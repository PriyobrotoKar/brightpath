# BrightPath LMS - Video Transcoding Pipeline Project

BrightPath is a Learning Management System (LMS) for creators and students, with course authoring, enrollment, payments, analytics, and content delivery. The core technical highlight of this repository is its **cloud-native Video Transcoding Pipeline Project**, which powers scalable video lesson processing for the LMS.

## Core Highlight: Video Transcoding Pipeline

The pipeline ingests uploaded source videos, triggers background processing, transcodes them to adaptive HLS renditions, and publishes stream-ready outputs.

- Uploads are sent to a temporary S3 bucket (`brightpath-dev-temp`).
- S3 emits `ObjectCreated:CompleteMultipartUpload` notifications.
- Notifications are delivered to SQS (`brightpath-video-transcoding-queue`).
- A Lambda consumer (`apps/video-transcoder/src/index.ts`) receives queue events.
- Lambda launches ECS Fargate transcoding tasks per upload.
- The transcoder container (`apps/video-transcoder/container/index.ts`) runs FFmpeg and creates HLS variants (`1280x720`, `854x480`, `640x360`) plus a master playlist.
- Outputs are uploaded to the primary bucket (`brightpath-dev`) under `hls/<input-video>/...`.
- Processing status is synced back to the API (`PROCESSING`, `COMPLETED`) through secured status endpoints.

## LMS Features

BrightPath is not only a transcoding pipeline; it is a full LMS platform with creator and student workflows.

- Authentication and session management with OTP/magic-link login and token refresh.
- Multi-tenant creator organizations with public tenant/slug access.
- Course creation and publishing workflows (metadata, schedule, enrollment rules, and pricing).
- Lesson authoring with modules containing video, document, and assignment lessons.
- Video progress tracking and lesson completion support for learners.
- Course discovery foundations with categories and metadata endpoints.
- Comments with likes/unlikes for lesson-level discussion.
- Enrollment management and enrolled-course retrieval for students.
- Payments and commerce workflows (order creation, order status, payment webhooks).
- Creator monetization and billing support (merchant onboarding and subscription plans).
- Revenue, enrollment, and content-completion analytics for creators.
- Email support app for account and verification templates.

## Pipeline Architecture

1. A client uploads a video to the temporary bucket.
2. S3 sends an event to SQS.
3. Lambda consumes the queue message.
4. Lambda calls ECS `RunTask` to start transcoding.
5. FFmpeg produces HLS playlists and segments.
6. The transcoder uploads HLS artifacts to the primary bucket.
7. The API receives status updates and reflects progress in the LMS.

## Demo Video

Use this section to upload or link a BrightPath LMS demo while emphasizing the video processing flow.


## Repository Structure

- `apps/platform` - Next.js frontend for the BrightPath LMS experience.
- `apps/api` - NestJS backend for LMS domains (auth, courses, modules, payments, analytics, etc.).
- `apps/video-transcoder/src/index.ts` - Lambda consumer that triggers ECS tasks.
- `apps/video-transcoder/container/index.ts` - FFmpeg transcoding worker.
- `apps/email` - Email templates and mailer utilities.
- `infra/dev/main.tf` - AWS infrastructure (S3, SQS, Lambda, ECS, IAM, API Gateway, and related resources).

## Tech Stack

- TypeScript / Node.js
- Next.js (platform app)
- NestJS (API services)
- AWS Lambda, ECS Fargate, S3, SQS
- FFmpeg via `fluent-ffmpeg`
- Terraform for infrastructure
- pnpm + Turborepo monorepo tooling

## Prerequisites

- Node.js `>= 18`
- pnpm `>= 9`
- Docker
- AWS CLI configured with credentials
- Terraform installed

## Quick Start

### 1) Install dependencies

```bash
pnpm install
```

### 2) Build transcoder components

```bash
pnpm --filter video-transcoder build
pnpm --dir apps/video-transcoder/container build
```

### 3) Provision dev infrastructure

```bash
./scripts/deploy.sh
```

### 4) Upload and process a video

Upload a test file to `brightpath-dev-temp` and monitor:

- Lambda logs: `apps/video-transcoder/scripts/consumer.dev.sh`
- ECS transcoder logs: `apps/video-transcoder/scripts/transcoder.dev.sh`

### 5) Verify outputs

Check the primary bucket (`brightpath-dev`) for:

- `hls/<input-video>/index.m3u8`
- `hls/<input-video>/version_1280x720.m3u8`
- `hls/<input-video>/version_854x480.m3u8`
- `hls/<input-video>/version_640x360.m3u8`

## Configuration

Start from `.sample.env` and supply environment values for your deployment. Key pipeline-related runtime variables include:

- `REGION`
- `ECS_CLUSTER`
- `ECS_TASK_DEFINITION`
- `ECS_CONTAINER_NAME`
- `SUBNETS`
- `BACKEND_URL`
- `API_KEY`

## Notes

- This is a monorepo containing multiple apps, with the README focused on the BrightPath LMS and its video transcoding backbone.
- Current infrastructure naming in this repository targets a dev environment (`brightpath-dev*`).
