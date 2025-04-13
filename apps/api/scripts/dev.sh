# Get the api-gateway id
apiId=$(aws apigateway get-rest-apis --output text --query "(items[?name=='brightpath-api-gateway'])[0].id")

# Construct the api url
url="https://$apiId.execute-api.$(aws configure get region).amazonaws.com/dev"

# Call the API to create a log group if it doesn't exist
curl -s "$url/api" > /dev/null

# Get the cloudwatch log group name for the latest deployment
group=$(aws logs describe-log-groups --log-group-name-pattern brightpath-api --output text --query "reverse(sort_by(logGroups, &creationTime))[0].logGroupName"  | head -1)



echo "✅ Successfully connected!"
echo "🚀 Make a requests to see the logs in real-time."
echo "API URL: $url"

# Start the log stream for the latest deployment
aws logs tail $group --follow --color on
