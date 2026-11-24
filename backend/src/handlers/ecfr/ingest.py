"""Lambda handler for eCFR data ingestion."""

from typing import Dict
import os
import json
import boto3

from services.ingest import run_ingest
from utils.error_handler import lambda_handler_with_errors
from utils.responses import success_response


@lambda_handler_with_errors("ingest")
def lambda_handler(event: Dict, context):
    bucket = os.environ["DATA_BUCKET"]
    
    # Check if this is an API Gateway request
    is_api_gateway = event.get("requestContext") is not None
    
    if is_api_gateway:
        # Trigger async execution and return immediately
        lambda_client = boto3.client('lambda')
        lambda_client.invoke(
            FunctionName=context.function_name,
            InvocationType='Event',  # Asynchronous
            Payload=json.dumps({"async": True})  # Mark as async execution
        )
        return success_response(body={
            "message": "Data ingestion started successfully",
            "status": "processing"
        })
    
    # Direct invocation or async execution - run the actual ingest
    summary = run_ingest(bucket)
    return success_response(body=summary)

