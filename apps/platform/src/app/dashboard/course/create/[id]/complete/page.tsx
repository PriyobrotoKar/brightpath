import { Button } from '@brightpath/ui/components/button';
import FormInfo from '../../_components/FormInfo';

export default function CreationCompletePage(): React.JSX.Element {
  return (
    <>
      <div className="mx-auto flex h-full max-w-sm items-center justify-center text-center">
        <FormInfo
          subtitle="You’ve successfully created your BootCamp. Next, let’s make it an engaging experience for your learners!"
          title="Congratulations! Your BootCamp is Ready!"
        />
      </div>
      <div className="border-border mt-auto flex items-center justify-between border-t py-4">
        <Button size="sm" variant="secondary">
          Cancel
        </Button>
        <Button className="w-fit" size="sm">
          View Bootcamp
        </Button>
      </div>
    </>
  );
}
