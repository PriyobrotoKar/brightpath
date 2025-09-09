import InfoSection from './InfoSection';
import ReadMore from './ReadMore';

interface DescriptionProps {
  description: string | null;
}

export default function Description({
  description,
}: DescriptionProps): React.JSX.Element | null {
  if (!description) return null;

  return (
    <InfoSection>
      <h2>Description</h2>
      <ReadMore>{description}</ReadMore>
    </InfoSection>
  );
}
