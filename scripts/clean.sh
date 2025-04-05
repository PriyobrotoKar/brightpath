#!/bin/bash

# Script to remove all node_modules directories in a monorepo
# Usage: ./clean-node-modules.sh [path/to/monorepo]

# Set the root directory (default to current directory if not specified)
ROOT_DIR=${1:-.}
cd "$ROOT_DIR" || exit 1

echo "🧹 Cleaning node_modules directories in $ROOT_DIR..."

# Find and remove all node_modules directories
find . -type d -name "node_modules" | while read -r dir; do
  echo "Removing: $dir"
  rm -rf "$dir"
done

# Remove other common package manager cache directories
echo "🧹 Cleaning package manager caches..."

# Remove .pnpm-store directories if they exist
find . -type d -name ".pnpm-store" -exec rm -rf {} +

# Remove all turbo cache directories
echo "🧹 Cleaning all Turborepo cache directories..."
find . -type d -name ".turbo" | while read -r dir; do
  echo "Removing: $dir"
  rm -rf "$dir"
done

# Remove dist directories
echo "🧹 Cleaning build output directories..."
find . -type d -name "dist" | while read -r dir; do
  echo "Removing: $dir"
  rm -rf "$dir"
done

# Remove other cache directories
echo "🧹 Cleaning other cache directories..."
rm -rf .cache .next out

echo "✅ Cleaning complete!"
echo "Run 'pnpm install' to reinstall all dependencies."
