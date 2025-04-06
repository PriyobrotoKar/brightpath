variable "api_secrets" {
  type        = map(string)
  sensitive   = true
  description = "Sensitive environment variables for the API"
}

variable "api_image_tag" {
  type        = string
  description = "Docker image tag for the API"
  default     = ":latest"
}
