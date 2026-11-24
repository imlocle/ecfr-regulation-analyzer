"""Unit tests for data_processor module."""

import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src'))

from services.data_processor import (
    count_words,
    extract_text_from_xml,
    sha256,
    calculate_regulatory_burden_score,
    build_agency_title_map
)


class TestCountWords:
    """Test word counting functionality."""
    
    def test_count_words_simple(self):
        assert count_words("hello world") == 2
    
    def test_count_words_empty(self):
        assert count_words("") == 0
    
    def test_count_words_multiple_spaces(self):
        assert count_words("hello   world") == 2
    
    def test_count_words_with_punctuation(self):
        assert count_words("Hello, world!") == 2


class TestExtractTextFromXml:
    """Test XML text extraction."""
    
    def test_extract_simple_xml(self):
        xml = b"<root>Hello World</root>"
        result = extract_text_from_xml(xml)
        assert "Hello World" in result
    
    def test_extract_nested_xml(self):
        xml = b"<root><child>Hello</child><child>World</child></root>"
        result = extract_text_from_xml(xml)
        assert "Hello" in result
        assert "World" in result
    
    def test_extract_empty_xml(self):
        xml = b"<root></root>"
        result = extract_text_from_xml(xml)
        assert result == ""


class TestSha256:
    """Test SHA-256 hashing."""
    
    def test_sha256_consistent(self):
        data = b"test data"
        hash1 = sha256(data)
        hash2 = sha256(data)
        assert hash1 == hash2
    
    def test_sha256_different_data(self):
        hash1 = sha256(b"data1")
        hash2 = sha256(b"data2")
        assert hash1 != hash2
    
    def test_sha256_length(self):
        result = sha256(b"test")
        assert len(result) == 64  # SHA-256 produces 64 hex characters


class TestCalculateRegulatoryBurdenScore:
    """Test regulatory burden score calculation."""
    
    def test_basic_calculation(self):
        score = calculate_regulatory_burden_score(
            word_count=1000000,
            num_titles=10,
            total_amendments=100,
            years_of_data=1.0
        )
        # (1000000 / 1000) * 100 * 10 = 100,000
        assert score == 1000000.0
    
    def test_zero_titles(self):
        score = calculate_regulatory_burden_score(
            word_count=1000000,
            num_titles=0,
            total_amendments=100,
            years_of_data=1.0
        )
        assert score == 0.0
    
    def test_zero_words(self):
        score = calculate_regulatory_burden_score(
            word_count=0,
            num_titles=10,
            total_amendments=100,
            years_of_data=1.0
        )
        assert score == 0.0
    
    def test_realistic_values(self):
        # DOJ example from docs
        score = calculate_regulatory_burden_score(
            word_count=31586172,
            num_titles=11,
            total_amendments=1847,
            years_of_data=1.0
        )
        assert score > 0
        assert isinstance(score, float)


class TestBuildAgencyTitleMap:
    """Test agency-to-title mapping."""
    
    def test_simple_mapping(self):
        agencies = [
            {
                "slug": "test-agency",
                "cfr_references": [{"title": 1}, {"title": 2}],
                "children": []
            }
        ]
        result = build_agency_title_map(agencies)
        assert "test-agency" in result
        assert 1 in result["test-agency"]
        assert 2 in result["test-agency"]
    
    def test_with_children(self):
        agencies = [
            {
                "slug": "parent-agency",
                "cfr_references": [{"title": 1}],
                "children": [
                    {"cfr_references": [{"title": 2}]}
                ]
            }
        ]
        result = build_agency_title_map(agencies)
        assert 1 in result["parent-agency"]
        assert 2 in result["parent-agency"]
    
    def test_empty_agencies(self):
        result = build_agency_title_map([])
        assert result == {}
    
    def test_no_duplicates(self):
        agencies = [
            {
                "slug": "test-agency",
                "cfr_references": [{"title": 1}, {"title": 1}],
                "children": []
            }
        ]
        result = build_agency_title_map(agencies)
        assert len(result["test-agency"]) == 1
