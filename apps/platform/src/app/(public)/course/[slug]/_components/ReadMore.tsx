'use client';

import { Button } from '@brightpath/ui/components/button';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from '@brightpath/ui/lib/utils';
import { useMemo, useState } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

export default function ReadMore({
  limit = 30,
  type = 'normal',
  children,
}: {
  type?: 'normal' | 'gradient';
  limit?: number;
  children: string;
}): React.JSX.Element {
  if (type === 'gradient') return <ShowMore limit={limit}>{children}</ShowMore>;

  const words = useMemo(() => children.split(' '), [children]);
  const [isExpanded, setIsExpanded] = useState(() => words.length < limit);

  const truncatedText =
    words.slice(0, limit).join(' ') + (!isExpanded ? '...' : ' ');

  return (
    <div className="text-md prose [&>p]:inline">
      <Markdown>{isExpanded ? children : truncatedText}</Markdown>
      {words.length > limit && (
        <Button
          className={cn('h-fit px-0 transition-none', !isExpanded && 'px-2')}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
          size="sm"
          variant="link"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
    </div>
  );
}

interface ShowMoreProps {
  limit?: number;
  children: string;
}

function ShowMore({ children, limit = 4 }: ShowMoreProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <motion.div
        animate={{
          height: isExpanded ? 'auto' : `${limit * 0.2}rem`,
        }}
        className="relative overflow-hidden"
      >
        <p className="text-md prose">{children}</p>
        <div
          className={cn(
            'from-background pointer-events-none absolute inset-0 bg-gradient-to-t transition-opacity',
            isExpanded && 'opacity-0',
          )}
        />
      </motion.div>
      <Button
        className="w-full"
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        size="sm"
        variant="ghost"
      >
        {isExpanded ? (
          <>
            Show Less
            <IconChevronUp />
          </>
        ) : (
          <>
            Show More
            <IconChevronDown />
          </>
        )}
      </Button>
    </div>
  );
}
