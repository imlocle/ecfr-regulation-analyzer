"""Unit tests for helper utilities."""

import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src'))

from utils.helper import to_camel_case, dict_keys_to_camel_case


class TestToCamelCase:
    """Test snake_case to camelCase conversion."""
    
    def test_simple_snake_case(self):
        assert to_camel_case("hello_world") == "helloWorld"
    
    def test_multiple_underscores(self):
        assert to_camel_case("hello_world_test") == "helloWorldTest"
    
    def test_kebab_case(self):
        assert to_camel_case("hello-world") == "helloWorld"
    
    def test_single_word(self):
        assert to_camel_case("hello") == "hello"
    
    def test_empty_string(self):
        assert to_camel_case("") == ""
    
    def test_already_camel_case(self):
        assert to_camel_case("helloWorld") == "helloworld"


class TestDictKeysToCamelCase:
    """Test recursive dictionary key conversion."""
    
    def test_simple_dict(self):
        input_dict = {"hello_world": "value"}
        result = dict_keys_to_camel_case(input_dict)
        assert "helloWorld" in result
        assert result["helloWorld"] == "value"
    
    def test_nested_dict(self):
        input_dict = {
            "outer_key": {
                "inner_key": "value"
            }
        }
        result = dict_keys_to_camel_case(input_dict)
        assert "outerKey" in result
        assert "innerKey" in result["outerKey"]
    
    def test_list_of_dicts(self):
        input_list = [
            {"first_name": "John"},
            {"last_name": "Doe"}
        ]
        result = dict_keys_to_camel_case(input_list)
        assert "firstName" in result[0]
        assert "lastName" in result[1]
    
    def test_mixed_types(self):
        input_dict = {
            "string_key": "value",
            "number_key": 123,
            "bool_key": True,
            "none_key": None
        }
        result = dict_keys_to_camel_case(input_dict)
        assert result["stringKey"] == "value"
        assert result["numberKey"] == 123
        assert result["boolKey"] is True
        assert result["noneKey"] is None
    
    def test_empty_dict(self):
        result = dict_keys_to_camel_case({})
        assert result == {}
    
    def test_preserves_values(self):
        input_dict = {"snake_case_key": "snake_case_value"}
        result = dict_keys_to_camel_case(input_dict)
        # Keys converted, values preserved
        assert result["snakeCaseKey"] == "snake_case_value"
