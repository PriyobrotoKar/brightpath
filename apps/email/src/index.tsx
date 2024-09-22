import React from 'react';
import { BullMQClient } from '@brightpath/bullmq';
import { sendMail } from './lib/nodemailer';
import { render } from '@react-email/render';
import { getEmailTemplate } from './lib/utils';
import * as Email from './templates';

const queue = new BullMQClient('Mail Queue');

queue.consumeJob(
  async (job) => {
    console.log('Job consumed at', new Date().toUTCString(), ':', job.data);

    const TemplateComponent: React.FC =
      Email[getEmailTemplate(job.data.eventType)];

    if (!TemplateComponent) {
      console.error(
        `No email template found for event type: ${job.data.eventType}`,
      );
      return;
    }

    const variables = 'variables' in job.data ? job.data.variables : {};

    const emailHtml = await render(<TemplateComponent {...variables} />);

    await sendMail({
      to: job.data.recipient.email,
      subject: job.data.eventType,
      html: emailHtml,
    });
  },
  { limiter: { max: 1, duration: 1000 } },
);
