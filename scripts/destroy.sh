cd ../infra/dev

terraform state rm aws_s3_bucket.primary_bucket
terraform state rm aws_s3_bucket.temp_bucket

terraform destroy
