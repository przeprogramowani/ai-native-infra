output "codeartifact_domain" {
  description = "CodeArtifact domain name"
  value       = aws_codeartifact_domain.this.domain
}

output "codeartifact_repository_npm" {
  description = "Private npm repository name"
  value       = aws_codeartifact_repository.npm.repository
}

output "codeartifact_repository_npm_store" {
  description = "Proxy npm-store repository name"
  value       = aws_codeartifact_repository.npm_store.repository
}

output "npm_login_command" {
  description = "Command to authenticate npm with the private registry"
  value       = "aws codeartifact login --tool npm --domain ${var.domain_name} --domain-owner ${var.aws_account_id} --repository npm --region ${var.aws_region}"
}

output "npm_login_command_scoped" {
  description = "Command to authenticate npm with the private registry (scoped)"
  value       = "aws codeartifact login --tool npm --domain ${var.domain_name} --domain-owner ${var.aws_account_id} --repository npm --region ${var.aws_region} --namespace @${var.domain_name}"
}
