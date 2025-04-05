variable "api_secrets" {
  type        = map(string)
  sensitive   = true
  description = "Sensitive environment variables for the API"
}
