# ── Managed policy for CodeArtifact developer access ─────────────────────────

resource "aws_iam_policy" "codeartifact_developer" {
  name        = "${var.domain_name}-codeartifact-developer"
  description = "Allows CI/CD to authenticate, read, and publish to CodeArtifact"
  policy      = data.aws_iam_policy_document.codeartifact_developer.json
}

data "aws_iam_policy_document" "codeartifact_developer" {
  # Domain-level: authentication token
  statement {
    sid    = "AllowGetAuthToken"
    effect = "Allow"

    actions = [
      "codeartifact:GetAuthorizationToken",
    ]

    resources = [
      "arn:aws:codeartifact:${var.aws_region}:${var.aws_account_id}:domain/${var.domain_name}",
    ]
  }

  # STS for bearer token exchange (required by GetAuthorizationToken)
  statement {
    sid    = "AllowSTSBearerToken"
    effect = "Allow"

    actions = [
      "sts:GetServiceBearerToken",
    ]

    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "sts:AWSServiceName"
      values   = ["codeartifact.amazonaws.com"]
    }
  }

  # Repository-level: read operations
  statement {
    sid    = "AllowRepositoryRead"
    effect = "Allow"

    actions = [
      "codeartifact:DescribeRepository",
      "codeartifact:GetRepositoryEndpoint",
      "codeartifact:ReadFromRepository",
      "codeartifact:ListPackages",
    ]

    resources = [
      "arn:aws:codeartifact:${var.aws_region}:${var.aws_account_id}:repository/${var.domain_name}/npm",
      "arn:aws:codeartifact:${var.aws_region}:${var.aws_account_id}:repository/${var.domain_name}/npm-store",
    ]
  }

  # Package-level: publish operations (note: package/ prefix, not repository/)
  statement {
    sid    = "AllowPackagePublish"
    effect = "Allow"

    actions = [
      "codeartifact:PublishPackageVersion",
      "codeartifact:PutPackageMetadata",
      "codeartifact:DescribePackageVersion",
      "codeartifact:ListPackageVersions",
    ]

    resources = [
      "arn:aws:codeartifact:${var.aws_region}:${var.aws_account_id}:package/${var.domain_name}/npm/*",
    ]
  }
}

# ── Attach to pre-existing GitHub Actions role ───────────────────────────────

data "aws_iam_role" "github_actions" {
  name = var.github_actions_role_name
}

resource "aws_iam_role_policy_attachment" "github_actions_codeartifact" {
  role       = data.aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.codeartifact_developer.arn
}
