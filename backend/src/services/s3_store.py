"""Thin S3 wrapper for storing and retrieving JSON/binary data."""

import json
import boto3
import logging

logger = logging.getLogger(__name__)


class S3Store:
    def __init__(self, bucket: str, prefix: str = "ecfr-data"):
        self.s3 = boto3.client("s3")
        self.bucket = bucket
        self.prefix = prefix

    def _key(self, name: str) -> str:
        return f"{self.prefix}/{name}"

    def put_json(self, name: str, data) -> None:
        key = self._key(name)
        logger.info(f"PUT s3://{self.bucket}/{key}")
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=json.dumps(data, default=str),
            ContentType="application/json",
        )

    def get_json(self, name: str):
        key = self._key(name)
        resp = self.s3.get_object(Bucket=self.bucket, Key=key)
        return json.loads(resp["Body"].read())

    def put_bytes(self, name: str, data: bytes) -> None:
        key = self._key(name)
        self.s3.put_object(
            Bucket=self.bucket, Key=key, Body=data,
            ContentType="application/xml",
        )

    def get_bytes(self, name: str) -> bytes:
        key = self._key(name)
        resp = self.s3.get_object(Bucket=self.bucket, Key=key)
        return resp["Body"].read()
