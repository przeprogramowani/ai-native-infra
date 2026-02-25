variable "domain_name" {
  description = "CodeArtifact domain name (must start with lowercase letter)"
  type        = string

  validation {
    condition     = can(regex("^[a-z]", var.domain_name))
    error_message = "Domain name must start with a lowercase letter."
  }
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-central-1"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "project_name" {
  description = "Project name used for tagging"
  type        = string
}
