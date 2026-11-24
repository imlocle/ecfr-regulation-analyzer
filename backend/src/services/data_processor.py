"""Process eCFR data into analytics-ready metrics."""

import hashlib
import re
import xml.etree.ElementTree as ET
from collections import defaultdict


def extract_text_from_xml(xml_bytes: bytes) -> str:
    """Strip all XML tags, return plain text."""
    try:
        root = ET.fromstring(xml_bytes)
        return " ".join(root.itertext())
    except ET.ParseError:
        text = xml_bytes.decode("utf-8", errors="replace")
        return re.sub(r"<[^>]+>", " ", text)


def count_words(text: str) -> int:
    return len(text.split())


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def build_agency_title_map(agencies: list[dict]) -> dict[str, set[int]]:
    """Map each agency slug to the set of CFR title numbers it touches.

    Rolls up child-agency references into the parent.
    """
    mapping: dict[str, set[int]] = defaultdict(set)
    for agency in agencies:
        slug = agency["slug"]
        for ref in agency.get("cfr_references", []):
            mapping[slug].add(ref["title"])
        for child in agency.get("children", []):
            for ref in child.get("cfr_references", []):
                mapping[slug].add(ref["title"])
    return dict(mapping)


def compute_title_stats(title_xml: dict[int, bytes]) -> dict[int, dict]:
    """Pre-compute word count and checksum per title.

    Returns {title_number: {word_count, checksum, char_count}}.
    """
    stats = {}
    for title_num, xml_bytes in title_xml.items():
        text = extract_text_from_xml(xml_bytes)
        word_count = count_words(text)
        stats[title_num] = {
            "word_count": word_count,
            "checksum": sha256(xml_bytes),
            "char_count": len(text),
        }
    return stats


def calculate_regulatory_burden_score(
    word_count: int,
    num_titles: int,
    total_amendments: int,
    years_of_data: float = 1.0
) -> float:
    """Calculate a composite regulatory burden score.
    
    Formula: (word_count / 1000) x amendments_per_year x num_titles
    
    Higher scores indicate greater regulatory burden through a combination of:
    - Complexity (word count)
    - Instability (amendment frequency)
    - Scope (number of CFR titles)
    
    Args:
        word_count: Total words across all agency regulations
        num_titles: Number of CFR titles the agency touches
        total_amendments: Total number of amendments across all titles
        years_of_data: Time span of amendment data (default 1.0 for normalization)
    
    Returns:
        Burden score (higher = greater burden)
    """
    if num_titles == 0 or word_count == 0:
        return 0.0
    
    amendments_per_year = total_amendments / max(years_of_data, 1.0)
    score = (word_count / 1000.0) * amendments_per_year * num_titles
    return round(score, 2)
