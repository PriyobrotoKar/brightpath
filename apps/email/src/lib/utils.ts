import { TransactionalMessage } from '../../../../packages/kafka/dist';

export function getEmailTemplate(eventType: TransactionalMessage['eventType']) {
  const ans = eventType
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join('');

  console.log(ans);
  return ans;
}
