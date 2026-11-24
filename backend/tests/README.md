# Backend Unit Tests

## Overview

This directory contains unit tests for the eCFR Regulation Analyzer backend.

## Running Tests

**Quick Start:**

```bash
./run_tests.sh
```

**With pytest directly:**

```bash
pytest tests/ -v
```

**With coverage:**

```bash
pytest tests/ --cov=src --cov-report=term-missing
```

## Test Files

### test_data_processor.py

Tests for data processing functions:

- `count_words()` - Word counting
- `extract_text_from_xml()` - XML text extraction
- `sha256()` - Hashing
- `calculate_regulatory_burden_score()` - Burden score calculation
- `build_agency_title_map()` - Agency-title mapping

### test_helper.py

Tests for utility functions:

- `to_camel_case()` - Snake case to camel case conversion
- `dict_keys_to_camel_case()` - Recursive dictionary key conversion

## Test Coverage

Current coverage focuses on:

- ✅ Core data processing logic
- ✅ Utility functions
- ✅ Edge cases (empty inputs, null values)
- ✅ Type validation

Not covered (would require mocking):

- Lambda handlers (require AWS context)
- S3 operations (require boto3 mocking)
- eCFR API calls (require requests mocking)

## Writing New Tests

**Test Class Pattern:**

```python
class TestFunctionName:
    """Test description."""

    def test_basic_case(self):
        result = function_name("input")
        assert result == "expected"

    def test_edge_case(self):
        result = function_name("")
        assert result == ""
```

**Naming Conventions:**

- Test files: `test_*.py`
- Test classes: `Test*`
- Test methods: `test_*`

## Dependencies

Tests require:

- pytest >= 7.4.0
- pytest-cov >= 4.1.0

Install with:

```bash
pip install -r requirements-dev.txt
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd backend
    pip install -r requirements-dev.txt
    pytest tests/ -v --cov=src
```

## Future Enhancements

- [ ] Add integration tests with mocked AWS services
- [ ] Add Lambda handler tests with mocked context
- [ ] Add API endpoint tests
- [ ] Increase coverage to 80%+
- [ ] Add performance benchmarks
