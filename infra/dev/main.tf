resource "aws_s3_bucket" "primary_bucket" {
  bucket = "brightpath-dev"
}

resource "aws_s3_bucket" "temp_bucket" {
  bucket = "brightpath-dev-temp"
}

resource "aws_s3_bucket_cors_configuration" "temp_bucket_cors" {
  bucket = aws_s3_bucket.temp_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_notification" "temp_bucket_notification" {
  bucket = aws_s3_bucket.temp_bucket.id

  queue {
    queue_arn = aws_sqs_queue.video_transcoding_queue.arn
    events    = ["s3:ObjectCreated:CompleteMultipartUpload"]
  }
}

resource "aws_sqs_queue" "video_transcoding_queue" {
  name                      = "brightpath-video-transcoding-queue"
  delay_seconds             = 90
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}

data "aws_iam_policy_document" "video_transcoding_queue_policy_document" {
  statement {
    sid    = "AllowS3ToSendMessage"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }

    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.video_transcoding_queue.arn]

    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values   = [aws_s3_bucket.temp_bucket.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "video_transcoding_queue_policy" {
  queue_url = aws_sqs_queue.video_transcoding_queue.id
  policy    = data.aws_iam_policy_document.video_transcoding_queue_policy_document.json
}





