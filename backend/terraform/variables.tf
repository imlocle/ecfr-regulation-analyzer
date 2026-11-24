variable "project_name" {
  default = "ecfr"
  type    = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  default = "us-west-1"
  type    = string
}

variable "runtime" {
  default = "python3.13"
  type    = string
}
