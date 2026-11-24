terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "data" {
  bucket = "${var.project_name}-data-bucket-${var.environment}"
}

module "api" {
  source       = "./modules/api"
  environment  = var.environment
  project_name = var.project_name
}

module "frontend" {
  source       = "./modules/frontend"
  environment  = var.environment
  project_name = var.project_name
}

module "lambda" {
  source            = "./modules/lambda"
  environment       = var.environment
  project_name      = var.project_name
  runtime           = var.runtime
  data_bucket_arn   = aws_s3_bucket.data.arn
  data_bucket_id    = aws_s3_bucket.data.id
  api_id            = module.api.api_id
  api_execution_arn = module.api.api_execution_arn
}
