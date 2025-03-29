resource "aws_s3_bucket" "primary_bucket" {
  bucket = "brightpath-dev"
}

resource "aws_s3_bucket" "temp_bucket" {
  bucket = "brightpath-dev-temp"
}

resource "aws_s3_bucket_cors_configuration" "primary_bucket_cors" {
  bucket = aws_s3_bucket.primary_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "primary_bucket_public_access" {
  bucket                  = aws_s3_bucket.primary_bucket.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "primary_bucket_policy" {
  bucket = aws_s3_bucket.primary_bucket.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.primary_bucket.arn}/*"
      }
    ]
  })
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

  statement {
    sid    = "AllowLambdaToReceiveMessage"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes"
    ]
    resources = [aws_sqs_queue.video_transcoding_queue.arn]
  }
}

resource "aws_sqs_queue_policy" "video_transcoding_queue_policy" {
  queue_url = aws_sqs_queue.video_transcoding_queue.id
  policy    = data.aws_iam_policy_document.video_transcoding_queue_policy_document.json
}

data "aws_iam_policy_document" "video_transcoding_consumer_role_policy" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "video_transcoding_consumer_policy_document" {
  statement {
    sid    = "AllowSQSOperations"
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes"
    ]
    resources = [aws_sqs_queue.video_transcoding_queue.arn]
  }

  statement {
    sid    = "AllowCloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    sid    = "AllowECSRunTask"
    effect = "Allow"
    actions = [
      "ecs:RunTask",
      "ecs:DescribeTasks",
      "ecs:StopTask"
    ]
    resources = [aws_ecs_task_definition.video_transcoder_task.arn]
  }

  statement {
    sid    = "AllowPassRole"
    effect = "Allow"
    actions = [
      "iam:PassRole"
    ]
    resources = [aws_iam_role.ecs_task_role.arn, aws_iam_role.ecs_task_execution_role.arn]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "video_transcoding_consumer_role" {
  name               = "brightpath-video-transcoding-consumer-role"
  assume_role_policy = data.aws_iam_policy_document.video_transcoding_consumer_role_policy.json
}

resource "aws_iam_policy" "video_transcoding_consmer_policy" {
  name   = "brightpath-video-transcoding-consumer-policy"
  policy = data.aws_iam_policy_document.video_transcoding_consumer_policy_document.json
}

resource "aws_iam_role_policy_attachment" "video_transcoding_consumer_role_policy_attachment" {
  role       = aws_iam_role.video_transcoding_consumer_role.name
  policy_arn = aws_iam_policy.video_transcoding_consmer_policy.arn
}

data "archive_file" "video_transcoding_consumer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../apps/video-transcoder/dist"
  output_path = "${path.module}/../../apps/video-transcoder/video-transcoder.zip"
}

resource "aws_lambda_function" "video_transcoding_consumer" {
  filename      = data.archive_file.video_transcoding_consumer_zip.output_path
  function_name = "brightpath-video-transcoding-consumer"
  role          = aws_iam_role.video_transcoding_consumer_role.arn
  handler       = "index.handler"

  source_code_hash = data.archive_file.video_transcoding_consumer_zip.output_base64sha256

  runtime = "nodejs18.x"

  environment {
    variables = {
      REGION              = "ap-south-1"
      ECS_CLUSTER         = aws_ecs_cluster.brightpath_cluster.arn
      ECS_TASK_DEFINITION = aws_ecs_task_definition.video_transcoder_task.arn
      ECS_CONTAINER_NAME  = "brightpath-video-transcoder"
      SUBNETS             = "subnet-0d639d1cb06a3302c,subnet-0439194c6426f11db,subnet-0e2b4103cc9c48e68"
    }
  }
}

resource "aws_lambda_event_source_mapping" "video_transcoding_consumer_event_source" {
  event_source_arn = aws_sqs_queue.video_transcoding_queue.arn
  function_name    = aws_lambda_function.video_transcoding_consumer.arn
}

resource "aws_ecs_cluster" "brightpath_cluster" {
  name = "brightpath-cluster"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "ecs_task_execution_policy" {
  name = "ecsTaskExecutionLoggingPolicy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      Resource = "arn:aws:logs:ap-south-1:767397681312:log-group:/ecs/*"
      },
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        Resource = "arn:aws:ecr:ap-south-1:767397681312:repository/brightpath/transcoder"
      },
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ],
        Resource = [
          aws_s3_bucket.primary_bucket.arn,
          aws_s3_bucket.temp_bucket.arn
        ]
      }
    ]
  })
}

resource "aws_iam_policy_attachment" "ecs_task_execution_attach" {
  name       = "ecsTaskExecutionAttach"
  roles      = [aws_iam_role.ecs_task_execution_role.name]
  policy_arn = aws_iam_policy.ecs_task_execution_policy.arn
}

resource "aws_iam_role" "ecs_task_role" {
  name = "ecsTaskRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "ecs_task_s3_policy" {
  name = "ecsTaskS3Policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ],
        Resource = [
          "${aws_s3_bucket.primary_bucket.arn}/*",
          "${aws_s3_bucket.temp_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "s3:ListBucket"
        ],
        Resource = [
          aws_s3_bucket.primary_bucket.arn,
          aws_s3_bucket.temp_bucket.arn
        ]
      }
    ]
  })
}

resource "aws_iam_policy_attachment" "ecs_task_s3_attach" {
  name       = "ecsTaskS3Attach"
  roles      = [aws_iam_role.ecs_task_role.name]
  policy_arn = aws_iam_policy.ecs_task_s3_policy.arn
}

resource "aws_ecs_task_definition" "video_transcoder_task" {
  family = "brightpath-video-transcoder"

  container_definitions = jsonencode([
    {
      name      = "brightpath-video-transcoder"
      image     = "767397681312.dkr.ecr.ap-south-1.amazonaws.com/brightpath/transcoder:latest"
      cpu       = 2048
      memory    = 4096
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-create-group"  = "true"
          "awslogs-group"         = "/ecs/brightpath-video-transcoder"
          "awslogs-region"        = "ap-south-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  requires_compatibilities = ["FARGATE"]
  runtime_platform {
    cpu_architecture = "ARM64"
  }
  network_mode       = "awsvpc"
  cpu                = "2048"
  memory             = "4096"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn
}



