"""Ingest pipeline: download eCFR data, compute metrics, store in S3.

Processes titles one at a time to keep memory usage manageable.
Designed to run as a Lambda (up to 15 min timeout) or locally.
"""

import logging
import os
from collections import defaultdict
from datetime import datetime, timezone

from services.ecfr_client import ECFRClient
from services.data_processor import (
    build_agency_title_map,
    compute_title_stats,
    calculate_regulatory_burden_score,
    sha256,
)
from services.s3_store import S3Store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)


def run_ingest(bucket: str) -> dict:
    client = ECFRClient()
    store = S3Store(bucket)

    # --- 1. Agencies & titles metadata ---
    logger.info("Fetching agencies...")
    agencies = client.get_agencies()
    store.put_json("agencies.json", agencies)

    logger.info("Fetching titles...")
    titles = client.get_titles()
    store.put_json("titles.json", titles)

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    agency_title_map = build_agency_title_map(agencies)

    # --- 2. Download XML per title, compute stats, then discard XML ---
    title_stats: dict[int, dict] = {}
    for title in titles:
        num = title["number"]
        if title.get("reserved"):
            logger.info(f"Skipping reserved title {num}")
            continue
        date = title.get("up_to_date_as_of") or today
        try:
            logger.info(f"Downloading title {num} as of {date}...")
            xml_bytes = client.get_title_xml(num, date)
            store.put_bytes(f"xml/title-{num}.xml", xml_bytes)
            # Compute stats immediately, then free the XML
            stats = compute_title_stats({num: xml_bytes})
            title_stats[num] = stats[num]
            del xml_bytes
        except Exception as e:
            logger.error(f"Title {num} failed: {e}")

    store.put_json("title_stats.json", title_stats)

    # --- 3. Version history (amendment timeline) ---
    logger.info("Fetching version histories...")
    period_counts: dict[str, int] = defaultdict(int)
    title_amendment_counts: dict[int, int] = {}  # Track amendments per title
    
    for title in titles:
        num = title["number"]
        if title.get("reserved"):
            continue
        try:
            versions = client.get_title_versions(num)
            title_amendment_counts[num] = len(versions)
            for version in versions:
                date = version.get("amendment_date") or version.get("date", "")
                if len(date) >= 7:
                    period_counts[date[:7]] += 1  # "YYYY-MM"
        except Exception as e:
            logger.error(f"Versions for title {num} failed: {e}")
            title_amendment_counts[num] = 0

    change_history = [
        {"period": period, "amendment_count": period_counts[period]}
        for period in sorted(period_counts)
    ]
    store.put_json("change_history.json", change_history)
    store.put_json("title_amendment_counts.json", title_amendment_counts)

    # --- 4. Build per-agency metrics from title-level stats ---
    agency_metrics = []
    for agency in agencies:
        slug = agency["slug"]
        ref_titles = agency_title_map.get(slug, set())

        word_count = sum(
            title_stats.get(title_num, {}).get("word_count", 0) for title_num in ref_titles
        )
        # Combine checksums of referenced titles into one agency checksum
        combined_hash = sha256(
            b"".join(
                title_stats.get(title_num, {}).get("checksum", "").encode()
                for title_num in sorted(ref_titles)
            )
        ) if ref_titles else None

        avg_words = (
            round(word_count / len(ref_titles), 1) if ref_titles else 0
        )
        
        # Calculate total amendments for this agency's titles
        total_amendments = sum(
            title_amendment_counts.get(title_num, 0) for title_num in ref_titles
        )
        
        # Calculate regulatory burden score
        # Using 1.0 year as default since we don't have historical span yet
        burden_score = calculate_regulatory_burden_score(
            word_count=word_count,
            num_titles=len(ref_titles),
            total_amendments=total_amendments,
            years_of_data=1.0
        )

        agency_metrics.append({
            "agency_name": agency["name"],
            "agency_slug": slug,
            "short_name": agency.get("short_name"),
            "cfr_titles": sorted(ref_titles),
            "word_count": word_count,
            "checksum": combined_hash,
            "num_titles": len(ref_titles),
            "avg_words_per_title": avg_words,
            "total_amendments": total_amendments,
            "regulatory_burden_score": burden_score,
        })

    store.put_json("agency_metrics.json", agency_metrics)

    # --- 5. Summary ---
    summary = {
        "last_updated": today,
        "titles_downloaded": len(title_stats),
        "agencies_processed": len(agency_metrics),
        "history_periods": len(change_history),
    }
    store.put_json("summary.json", summary)
    logger.info(f"Ingest complete: {summary}")
    return summary


def handler(event, context):
    """Lambda entry point."""
    return run_ingest(os.environ["DATA_BUCKET"])


if __name__ == "__main__":
    run_ingest(os.environ.get("DATA_BUCKET", "ecfr-data-bucket"))
