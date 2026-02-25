resource "aws_kms_key" "codeartifact" {
  description             = "KMS key for CodeArtifact domain ${var.domain_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_alias" "codeartifact" {
  name          = "alias/devs10x-codeartifact"
  target_key_id = aws_kms_key.codeartifact.key_id
}
