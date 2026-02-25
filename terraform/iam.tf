variable "github_actions_role_name" {
  description = "Name of the existing GitHub Actions IAM role"
  type        = string
  default     = "github-actions-codeartifact"
}

data "aws_iam_role" "github_actions" {
  name = var.github_actions_role_name
}

resource "aws_iam_role_policy_attachment" "github_actions_codeartifact" {
  role       = data.aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.codeartifact_developer.arn
}

resource "aws_iam_policy" "codeartifact_developer" {
  name        = "devs10x-codeartifact-developer"
  description = "Allows developers to login, read, and publish to CodeArtifact"
  policy      = data.aws_iam_policy_document.codeartifact_developer.json
}

data "aws_iam_policy_document" "codeartifact_developer" {
  statement {
    sid    = "AllowDomainAuth"
    effect = "Allow"

    actions = [
      "codeartifact:GetAuthorizationToken",
      "codeartifact:GetDomainPermissionsPolicy",
      "codeartifact:DescribeDomain",
      "codeartifact:ListRepositoriesInDomain",
    ]

    resources = [aws_codeartifact_domain.this.arn]
  }

  statement {
    sid    = "AllowRepositoryAccess"
    effect = "Allow"

    actions = [
      "codeartifact:DescribeRepository",
      "codeartifact:GetRepositoryEndpoint",
      "codeartifact:ListPackages",
      "codeartifact:ReadFromRepository",
    ]

    resources = [
      aws_codeartifact_repository.npm.arn,
      aws_codeartifact_repository.npm_store.arn,
    ]
  }

  statement {
    sid    = "AllowPackageAccess"
    effect = "Allow"

    actions = [
      "codeartifact:DescribePackageVersion",
      "codeartifact:GetPackageVersionReadme",
      "codeartifact:ListPackageVersions",
      "codeartifact:ListPackageVersionAssets",
      "codeartifact:PublishPackageVersion",
      "codeartifact:PutPackageMetadata",
    ]

    resources = [
      "arn:aws:codeartifact:${var.aws_region}:${var.aws_account_id}:package/${var.domain_name}/${aws_codeartifact_repository.npm.repository}/*",
      "arn:aws:codeartifact:${var.aws_region}:${var.aws_account_id}:package/${var.domain_name}/${aws_codeartifact_repository.npm_store.repository}/*",
    ]
  }

  statement {
    sid    = "AllowGetToken"
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
}
