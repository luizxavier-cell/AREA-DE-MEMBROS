import { Repeat } from 'solid-js';

import { Skeleton } from './ui/misc';

/** Placeholder for a members page whose data is still loading. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Carregando" class="flex flex-1 flex-col">
      <div class="flex h-14 items-center gap-3 border-b px-4 lg:px-6">
        <Skeleton class="size-7" />
        <Skeleton class="h-4 w-40" />
      </div>
      <div class="flex flex-col gap-6 p-4 lg:p-6">
        <div class="space-y-2">
          <Skeleton class="h-7 w-64" />
          <Skeleton class="h-4 w-96 max-w-full" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Repeat count={6}>
            {() => (
              <div class="space-y-3 rounded-xl border p-3">
                <Skeleton class="aspect-video w-full" />
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-3 w-1/2" />
              </div>
            )}
          </Repeat>
        </div>
      </div>
    </div>
  );
}
