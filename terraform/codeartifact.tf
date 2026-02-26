resource "aws_codeartifact_domain" "this" {
  domain         = var.domain_name
  encryption_key = aws_kms_key.codeartifact.arn
}

resource "aws_codeartifact_domain_permissions_policy" "this" {
  domain          = aws_codeartifact_domain.this.domain
  policy_document = data.aws_iam_policy_document.domain_policy.json
}

data "aws_iam_policy_document" "domain_policy" {
  statement {
    sid    = "AllowAccountAccess"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.aws_account_id}:root"]
    }

    actions   = ["codeartifact:*"]
    resources = ["*"]
  }
}

# ── Proxy repository (npm-store) ─────────────────────────────────────────────

resource "aws_codeartifact_repository" "npm_store" {
  repository = "npm-store"
  domain     = aws_codeartifact_domain.this.domain

  external_connections {
    external_connection_name = "public:npmjs"
  }
}

# ── Private repository (npm) ─────────────────────────────────────────────────

resource "aws_codeartifact_repository" "npm" {
  repository = "npm"
  domain     = aws_codeartifact_domain.this.domain

  upstream {
    repository_name = aws_codeartifact_repository.npm_store.repository
  }
}

resource "aws_codeartifact_repository_permissions_policy" "npm" {
  repository      = aws_codeartifact_repository.npm.repository
  domain          = aws_codeartifact_domain.this.domain
  policy_document = data.aws_iam_policy_document.repo_policy.json
}

data "aws_iam_policy_document" "repo_policy" {
  statement {
    sid    = "AllowAccountAccess"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.aws_account_id}:root"]
    }

    actions = [
      "codeartifact:DescribeRepository",
      "codeartifact:GetRepositoryEndpoint",
      "codeartifact:ReadFromRepository",
      "codeartifact:ListPackages",
    ]

    resources = ["*"]
  }
}
