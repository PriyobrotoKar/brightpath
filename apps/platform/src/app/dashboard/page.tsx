import { Button } from '@brightpath/ui/components/button';
import { IconPlus } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from './_components/Header';

export default function DashboardPage(): React.JSX.Element {
  return (
    <>
      <Header
        subtitle="Here's an overview of your bootcamps and active learners"
        title="Hello, Priyobroto"
      />
      <div className="flex flex-1 items-center justify-center">
        <main className="relative w-60 space-y-4">
          <Image
            alt="Bg Grid"
            className="absolute -top-1/3 left-1/2 max-w-[30rem] -translate-x-1/2"
            height={600}
            src="/bg_grid.svg"
            width={800}
          />
          <div className="relative z-10">
            <Image
              alt="New Bootcamp"
              height={300}
              src="/new_bootcamp.svg"
              width={400}
            />
          </div>
          <div className="space-y-1">
            <div className="text-lg">Start your First Bootcamp</div>
            <p className="text-md text-muted-foreground">
              Guide learners through your expertise, step by step.
            </p>
          </div>
          <Link className="block" href="/dashboard/course/create/information">
            <Button className="w-full" size="sm" variant="secondary">
              <IconPlus />
              Create
            </Button>
          </Link>
        </main>
      </div>
    </>
  );
}
