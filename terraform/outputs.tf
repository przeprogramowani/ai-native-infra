output "domain_name" {
  description = "CodeArtifact domain name"
  value       = aws_codeartifact_domain.this.domain
}

output "domain_arn" {
  description = "CodeArtifact domain ARN"
  value       = aws_codeartifact_domain.this.arn
}

output "npm_repository_arn" {
  description = "Private npm repository ARN"
  value       = aws_codeartifact_repository.npm.arn
}

output "npm_store_repository_arn" {
  description = "Proxy npm-store repository ARN"
  value       = aws_codeartifact_repository.npm_store.arn
}

output "developer_policy_arn" {
  description = "IAM managed policy ARN for developers"
  value       = aws_iam_policy.codeartifact_developer.arn
}

output "npm_login_command" {
  description = "Command to authenticate npm with CodeArtifact"
  value       = "aws codeartifact login --tool npm --domain ${var.domain_name} --domain-owner ${var.aws_account_id} --repository npm --region ${var.aws_region}"
}

output "npm_scoped_login_command" {
  description = "Command to authenticate npm with CodeArtifact for a specific scope"
  value       = "aws codeartifact login --tool npm --domain ${var.domain_name} --domain-owner ${var.aws_account_id} --repository npm --region ${var.aws_region} --namespace <scope>"
}
