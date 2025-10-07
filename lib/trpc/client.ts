import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from '@/server/trpc/routers';
import superjson from 'superjson';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

