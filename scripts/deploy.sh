cd ./infra/dev

terraform import aws_s3_bucket.primary_bucket brightpath-dev
terraform import aws_s3_bucket.temp_bucket brightpath-dev-temp

terraform apply
