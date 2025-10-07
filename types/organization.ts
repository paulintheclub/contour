import type {inferRouterOutputs} from "@trpc/server";
import type {AppRouter} from "@/server/trpc/routers";

export type Organization = inferRouterOutputs<AppRouter>["organization"]["getAll"][number]
