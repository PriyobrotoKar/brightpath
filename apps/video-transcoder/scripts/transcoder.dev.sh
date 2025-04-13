group="/ecs/brightpath-video-transcoder"

# Start the log stream for the latest deployment
aws logs tail $group --follow --filter-pattern '?ERROR ?INFO' --color on
