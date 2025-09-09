import Image from 'next/image';
import {
  IconBrandFacebook,
  IconBrandX,
  IconExternalLink,
  IconFolder,
  IconStarFilled,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import type { User } from '@brightpath/db';
import { Fragment } from 'react';
import { Separator } from '@brightpath/ui/components/separator';
import { Button } from '@brightpath/ui/components/button';
import InfoSection from './InfoSection';
import ReadMore from './ReadMore';
import { mediaUrl } from '@/lib/utils';

interface InstrutorProps {
  instructor: User;
}

const LinkIcons = [IconBrandFacebook, IconBrandX, IconWorld];

const getLinks = (links: string[]) => {
  return [
    {
      label: 'facebook',
      Icon: IconBrandFacebook,
      link: links.find((link) => link.includes('facebook.com')),
    },
    {
      label: 'twitter',
      Icon: IconBrandX,
      link: links.find((link) => link.includes('x.com')),
    },
    {
      label: 'website',
      Icon: IconWorld,
      link: links.find(
        (link) => !link.includes('facebook.com') && !link.includes('x.com'),
      ),
    },
  ];
};

export default function Instructor({
  instructor,
}: InstrutorProps): React.JSX.Element {
  const stats = [
    {
      icon: IconUsers,
      label: 'Students',
      value: 3340,
    },
    {
      icon: IconStarFilled,
      label: 'Rating',
      value: 3340,
    },
    {
      icon: IconFolder,
      label: 'Courses',
      value: 4,
    },
  ];

  return (
    <InfoSection>
      <h2>Instructor</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Image
                alt={instructor.name ?? 'Instructor Profile Picture'}
                className="rounded-lg"
                height={80}
                src={mediaUrl(instructor.profilePicture) ?? ''}
                width={80}
              />
            </div>

            <div className="flex">
              {stats.map((stat, i) => (
                <Fragment key={stat.label}>
                  <div
                    className="flex flex-col items-center gap-1 px-4"
                    key={stat.label}
                  >
                    <div className="flex gap-2">
                      <stat.icon />
                      <p className="text-base-medium">{stat.value}</p>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {stat.label}
                    </span>
                  </div>

                  {i !== stats.length - 1 && (
                    <Separator orientation="vertical" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
          <Button className="w-fit" size="sm">
            View Profile <IconExternalLink />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg">{instructor.name}</h3>
          <div className="flex gap-2">
            {getLinks(instructor.links).map(({ Icon, label, link }) => {
              if (!link) return;

              return (
                <a href={link} key={label} rel="noopener" target="_blank">
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
        {instructor.bio ? (
          <ReadMore type="gradient">{instructor.bio}</ReadMore>
        ) : null}
      </div>
    </InfoSection>
  );
}
