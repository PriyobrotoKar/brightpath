function="brightpath-video-transcoding-consumer"
# invoke the consumer lambda function just once for creating the log group
aws lambda invoke --function-name $function \
  --payload '{"test": "value"}' \
  --cli-binary-format raw-in-base64-out \
  --no-cli-pager \
  /dev/null

group="/aws/lambda/$function"

# Start the log stream for the latest deployment
aws logs tail $group --follow --filter-pattern '?ERROR ?INFO' --color on
