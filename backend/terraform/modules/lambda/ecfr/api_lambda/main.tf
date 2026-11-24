locals {
  name          = "${var.project_name}-${var.lambda_name}"
  function_name = "${local.name}-${var.environment}"
  handler_path  = replace(var.lambda_name, "-", "_")
  zip_file_path = "${path.root}/builds/${local.function_name}.zip"
}

resource "aws_iam_role" "this" {
  name = "${local.name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${local.name}-lambda-policy-${var.environment}"
  role = aws_iam_role.this.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect   = "Allow",
        Action   = ["s3:GetObject", "s3:ListBucket"],
        Resource = ["${var.data_bucket_arn}", "${var.data_bucket_arn}/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "this" {
  function_name = local.function_name
  handler       = "handlers.ecfr.${local.handler_path}.lambda_handler"
  runtime       = var.runtime
  role          = aws_iam_role.this.arn
  timeout       = 30

  filename         = local.zip_file_path
  source_code_hash = filebase64sha256(local.zip_file_path)

  layers     = [aws_lambda_layer_version.common_dependencies.arn]
  depends_on = [aws_lambda_layer_version.common_dependencies]

  environment {
    variables = {
      DATA_BUCKET = var.data_bucket_id
      ENVIRONMENT = var.environment
    }
  }
}

resource "aws_lambda_layer_version" "common_dependencies" {
  filename            = "${path.root}/builds/python.zip"
  layer_name          = "${local.name}-common-deps"
  compatible_runtimes = [var.runtime]
  source_code_hash    = filebase64sha256("${path.root}/builds/python.zip")

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "this" {
  api_id                 = var.api_id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.this.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "this" {
  api_id    = var.api_id
  route_key = var.route_key
  target    = "integrations/${aws_apigatewayv2_integration.this.id}"
}
