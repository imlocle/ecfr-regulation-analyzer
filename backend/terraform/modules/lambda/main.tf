# Lambda orchestrator — wires up all Lambda function modules

module "ingest" {
  source            = "./ecfr/ingest"
  lambda_name       = "ingest"
  environment       = var.environment
  project_name      = var.project_name
  runtime           = var.runtime
  data_bucket_arn   = var.data_bucket_arn
  data_bucket_id    = var.data_bucket_id
  api_id            = var.api_id
  api_execution_arn = var.api_execution_arn
  timeout           = 900
}

module "get_agencies" {
  source            = "./ecfr/get_agencies"
  lambda_name       = "get-agencies"
  environment       = var.environment
  project_name      = var.project_name
  runtime           = var.runtime
  data_bucket_arn   = var.data_bucket_arn
  data_bucket_id    = var.data_bucket_id
  api_id            = var.api_id
  api_execution_arn = var.api_execution_arn
}

module "get_history" {
  source            = "./ecfr/get_history"
  lambda_name       = "get-history"
  environment       = var.environment
  project_name      = var.project_name
  runtime           = var.runtime
  data_bucket_arn   = var.data_bucket_arn
  data_bucket_id    = var.data_bucket_id
  api_id            = var.api_id
  api_execution_arn = var.api_execution_arn
}

module "get_summary" {
  source            = "./ecfr/get_summary"
  lambda_name       = "get-summary"
  environment       = var.environment
  project_name      = var.project_name
  runtime           = var.runtime
  data_bucket_arn   = var.data_bucket_arn
  data_bucket_id    = var.data_bucket_id
  api_id            = var.api_id
  api_execution_arn = var.api_execution_arn
}
