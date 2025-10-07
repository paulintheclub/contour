import { router } from '../init';
import { organizationRouter } from './organization';
import { userRouter } from './user';
import { tourRouter } from './tour';
import { tourSlotRouter } from './tourSlot';

export const appRouter = router({
  organization: organizationRouter,
  user: userRouter,
  tour: tourRouter,
  tourSlot: tourSlotRouter,
});

export type AppRouter = typeof appRouter;

