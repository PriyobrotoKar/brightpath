'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@brightpath/ui/lib/utils';

import { toggleVariants } from '@brightpath/ui/components/toggle';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: 'default',
  variant: 'default',
  spacing: 0,
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants> & {
      spacing?: number;
    }
>(({ className, variant, size, spacing = 0, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    style={
      {
        '--gap': spacing,
      } as React.CSSProperties
    }
    className={cn('flex items-center justify-center gap-[--gap]', className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      data-variant={context.variant}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'data-[spacing=0]:rounded-none data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:data-[variant=outline]:first:border-l data-[spacing=0]:last:rounded-r-md',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
