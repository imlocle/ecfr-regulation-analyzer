"""Client for the eCFR public API."""

import requests
import time
import logging

logger = logging.getLogger(__name__)

BASE_URL = "https://www.ecfr.gov"
RATE_LIMIT_DELAY = 0.5  # seconds between requests to be polite


class ECFRClient:
    """Wrapper around the eCFR public API with retry logic."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "ecfr-analyzer/1.0",
        })

    def _get_json(self, path: str) -> dict:
        url = f"{BASE_URL}{path}"
        logger.info(f"GET {url}")
        resp = self.session.get(
            url,
            headers={"Accept": "application/json"},
            timeout=60,
        )
        resp.raise_for_status()
        time.sleep(RATE_LIMIT_DELAY)
        return resp.json()

    def _get_xml(self, path: str) -> bytes:
        url = f"{BASE_URL}{path}"
        logger.info(f"GET {url}")
        resp = self.session.get(
            url,
            headers={"Accept": "application/xml"},
            timeout=300,
            stream=True,
        )
        resp.raise_for_status()
        content = resp.content
        time.sleep(RATE_LIMIT_DELAY)
        return content

    def get_agencies(self) -> list[dict]:
        return self._get_json("/api/admin/v1/agencies.json")["agencies"]

    def get_titles(self) -> list[dict]:
        return self._get_json("/api/versioner/v1/titles")["titles"]

    def get_title_xml(self, title_number: int, date: str) -> bytes:
        """Download full XML for a title as of a specific date."""
        return self._get_xml(
            f"/api/versioner/v1/full/{date}/title-{title_number}.xml"
        )

    def get_title_versions(self, title_number: int) -> list[dict]:
        """Get amendment history for a title."""
        data = self._get_json(
            f"/api/versioner/v1/versions/title-{title_number}"
        )
        return data.get("content_versions", [])
