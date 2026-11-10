import { Repeat } from 'solid-js';

import { Skeleton } from './ui/misc';

/** Placeholder for a members page whose data is still loading. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Carregando" class="flex flex-1 flex-col gap-10 py-10">
      <div class="space-y-4 px-4 sm:px-6 lg:px-12">
        <Skeleton class="h-12 w-full max-w-md" />
        <Skeleton class="h-4 w-full max-w-sm" />
        <Skeleton class="h-11 w-36" />
      </div>
      <Repeat count={2}>
        {() => (
          <div class="space-y-3 px-4 sm:px-6 lg:px-12">
            <Skeleton class="h-5 w-48" />
            <div class="flex gap-3 overflow-hidden">
              <Repeat count={8}>
                {() => <Skeleton class="aspect-[3/4] w-36 shrink-0 sm:w-40 lg:w-44" />}
              </Repeat>
            </div>
          </div>
        )}
      </Repeat>
    </div>
  );
}
