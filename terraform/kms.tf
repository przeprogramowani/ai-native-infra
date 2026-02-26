resource "aws_kms_key" "codeartifact" {
  description = "KMS key for CodeArtifact domain encryption"
}

resource "aws_kms_alias" "codeartifact" {
  name          = "alias/${var.domain_name}-codeartifact"
  target_key_id = aws_kms_key.codeartifact.key_id
}
