import { router } from "../trpc";
import { authRouter } from "./auth";
import { publicPollRouter } from "./poll";
import { authPollRouter } from "./poll_auth";

export const appRouter = router({
  auth: authRouter,
  publicPoll: publicPollRouter,
  authPoll: authPollRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
