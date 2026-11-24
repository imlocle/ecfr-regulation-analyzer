"""Lambda handler for GET /agencies — per-agency metrics."""

from typing import Dict
import os

from services.s3_store import S3Store
from utils.error_handler import lambda_handler_with_errors
from utils.responses import success_response


@lambda_handler_with_errors("get_agencies")
def lambda_handler(event: Dict, context):
    store = S3Store(os.environ["DATA_BUCKET"])
    data = store.get_json("agency_metrics.json")
    return success_response(body=data)
