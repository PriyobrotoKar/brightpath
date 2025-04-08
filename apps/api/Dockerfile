FROM public.ecr.aws/lambda/nodejs:20 AS base

# Install pnpm
RUN npm install -g pnpm
ENV PNPM_HOME="/tmp/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Builder stage
FROM base AS builder
# Set working directory
WORKDIR /var/task

# Install Turbo
RUN pnpm install -g turbo@^2

# Copy source
COPY . .

# Prune monorepo for the api package
RUN turbo prune api --docker

# Installer stage
FROM base AS installer
WORKDIR /var/task

# Copy package.json files from builder
COPY --from=builder /var/task/out/json/ .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY --from=builder /var/task/out/full/ .

# Build the project
RUN pnpm turbo run build

# Runner stage
FROM base AS runner
WORKDIR /var/task

# Copy built application
COPY --from=installer /var/task .

# Create necessary directories
RUN mkdir -p /tmp/pnpm/.tools/pnpm && chmod -R 777 /tmp/pnpm

# Command to run
CMD [ "apps/api/dist/lambda.handler" ]
