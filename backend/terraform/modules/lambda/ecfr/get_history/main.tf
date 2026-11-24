module "lambda" {
  source            = "../api_lambda"
  lambda_name       = var.lambda_name
  environment       = var.environment
  project_name      = var.project_name
  runtime           = var.runtime
  data_bucket_arn   = var.data_bucket_arn
  data_bucket_id    = var.data_bucket_id
  api_id            = var.api_id
  api_execution_arn = var.api_execution_arn
  route_key         = "GET /history"
}
