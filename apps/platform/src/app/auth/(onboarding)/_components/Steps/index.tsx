import Indicators from './Indicators';
import { getOnboardingStatus } from '@/lib/onboardingStatus';

async function Steps(): Promise<React.JSX.Element> {
  const status = await getOnboardingStatus();
  return (
    <div className="w-full">
      <Indicators initialStep={status.step} />
    </div>
  );
}

export default Steps;
