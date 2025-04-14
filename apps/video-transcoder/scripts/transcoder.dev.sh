group="/ecs/brightpath-video-transcoder"

# Start the log stream for the latest deployment
aws logs tail $group --follow --color on
