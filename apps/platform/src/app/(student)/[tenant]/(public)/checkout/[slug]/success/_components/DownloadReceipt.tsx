import { Button } from '@brightpath/ui/components/button';
import { IconDownload } from '@tabler/icons-react';

export default function DownloadReceipt(): React.JSX.Element {
  return (
    <Button className="w-full">
      <IconDownload /> Download Receipt
    </Button>
  );
}
