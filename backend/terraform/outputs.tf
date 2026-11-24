output "ecfr_api_endpoint" {
  description = "eCFR API Gateway endpoint URL"
  value       = module.api.api_endpoint
}

output "frontend_url" {
  description = "Frontend CloudFront URL"
  value       = module.frontend.cloudfront_url
}

output "frontend_bucket" {
  description = "S3 bucket for frontend deployment"
  value       = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = module.frontend.distribution_id
}
