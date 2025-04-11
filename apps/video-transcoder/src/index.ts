import {
  ECSClient,
  RunTaskCommand,
  RunTaskCommandInput,
} from '@aws-sdk/client-ecs';
import { SQSHandler } from 'aws-lambda';

const ecs = new ECSClient({
  region: process.env.REGION,
});

export const handler: SQSHandler = async (event) => {
  for (const sqsRecord of event.Records) {
    const s3Event = JSON.parse(sqsRecord.body);

    for (const s3Record of s3Event.Records) {
      console.log('Processing file upload', {
        bucket: s3Record.s3.bucket.name,
        key: s3Record.s3.object.key,
      });

      const key = s3Record.s3.object.key;
      const bucket = s3Record.s3.bucket.name;

      try {
        const task: RunTaskCommandInput = {
          cluster: process.env.ECS_CLUSTER,
          taskDefinition: process.env.ECS_TASK_DEFINITION,
          launchType: 'FARGATE',
          networkConfiguration: {
            awsvpcConfiguration: {
              subnets: process.env.SUBNETS.split(','),
              assignPublicIp: 'ENABLED',
            },
          },
          overrides: {
            containerOverrides: [
              {
                name: process.env.ECS_CONTAINER_NAME,
                environment: [
                  {
                    name: 'INPUT_VIDEO',
                    value: key,
                  },
                  {
                    name: 'BUCKET',
                    value: bucket,
                  },
                  {
                    name: 'BACKEND_URL',
                    value: process.env.BACKEND_URL,
                  },
                  {
                    name: 'API_KEY',
                    value: process.env.API_KEY,
                  },
                ],
              },
            ],
          },
        };

        const command = new RunTaskCommand(task);

        await ecs.send(command);
        console.log('Task submitted to ECS', task);

        await updateJobStatus(key);
      } catch (error) {
        console.error('Error submitting ECS task', error);
      }
    }
  }
};

const updateJobStatus = async (key: string) => {
  const baseUrl = process.env.BACKEND_URL;

  try {
    const response = await fetch(
      `${baseUrl}/api/module/video/status/${key}?status=PROCESSING`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error updating job status: ${response.statusText}`);
    }

    await response.json();
    console.log('Job status updated successfully');
  } catch (error) {
    console.error('Error updating job status');
    throw error;
  }
};
