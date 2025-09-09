import Image from 'next/image';

const CERTIFICATE_WIDTH = '14rem';

export default function Certificate(): React.JSX.Element {
  return (
    <div
      className="relative rounded-xl border px-6 py-5"
      style={
        {
          '--certificate-width': CERTIFICATE_WIDTH,
        } as React.CSSProperties
      }
    >
      <div className="mr-[var(--certificate-width)] space-y-2">
        <h2 className="text-base-medium">Obtain a Career Certificate</h2>
        <p className="text-xs">
          Add these credentials in your Linkedin profile, resume or CV. Share
          them on your social media and in your performance reviews.
        </p>
      </div>
      <div className="absolute bottom-0 right-0 overflow-hidden px-4 pt-4">
        <Image
          alt="Certificate"
          className="shadow-xl"
          height={150}
          src="/certificate.png"
          width={200}
        />
      </div>
    </div>
  );
}
