import { Suspense } from 'react';
import VerifyMagic from './_components/VerifyMagic';

export default function VerifyMagicPage(): React.JSX.Element {
  return (
    <Suspense>
      <VerifyMagic />
    </Suspense>
  );
}
