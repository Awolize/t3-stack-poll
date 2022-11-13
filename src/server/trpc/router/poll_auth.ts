import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, protectedProcedure, publicProcedure } from "../trpc";

export const authPollRouter = router({
  getAllPollGroups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: { name: true },
    });
  }),

  getPollsByGroupKey: publicProcedure.input(z.object({ key: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.pollGroup.findFirst({
      where: { key: input.key },
      include: {
        polls: {
          select: {
            id: true,
          },
        },
      },
    });
  }),

  getPoll: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.poll.findFirst({
      where: { id: input.id },
      include: {
        choices: {
          select: {
            id: true,
          },
        },
      },
    });
  }),

  getPollChoice: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.pollChoice.findFirst({
      where: { id: input.id },
      include: {
        voters: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }),

  getPollGroupMembers: publicProcedure.input(z.object({ key: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.pollGroup.findFirst({
      where: { key: input.key },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }),

  getPollTotalVoters: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const poll = await ctx.prisma.poll.findFirst({
      where: {
        id: input.id,
      },

      include: {
        choices: {
          select: {
            voters: true,
          },
        },
      },
    });

    let sum = 0;
    for (const choiceIndex in poll?.choices) {
      if (Object.prototype.hasOwnProperty.call(poll?.choices, choiceIndex)) {
        const choice = poll?.choices[choiceIndex];
        sum += choice.voters.length;
      }
    }

    return sum;
  }),

  getPollChoiceStatus: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return (
      (await ctx.prisma.pollChoice.count({
        where: {
          id: input.id,
          voters: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
      })) > 0
    );
  }),

  joinPollGroup: protectedProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.prisma.pollGroup.update({
      where: {
        key: input.key,
      },
      data: {
        users: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });
  }),

  createPollGroup: protectedProcedure
    .input(z.object({ key: z.string().nullish() }).nullish())
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.pollGroup.create({
        data: {
          key: input?.key ?? (Math.random() + 1).toString(36).substring(7),
          creatorId: ctx.session.user.id,
          users: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  pollVote: protectedProcedure // todo
    .input(z.object({ choiceId: z.string(), checked: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (input.checked) {
        return await ctx.prisma.pollChoice.update({
          where: { id: input.choiceId },
          data: {
            voters: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      } else {
        return await ctx.prisma.pollChoice.update({
          where: { id: input.choiceId },
          data: {
            voters: {
              disconnect: { id: ctx.session.user.id },
            },
          },
        });
      }
    }),

  createPoll: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        pollGroupId: z.string(),
        choices: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // validate is member of group with key
      const valid = await ctx.prisma.user.count({
        where: {
          pollGroups: {
            some: {
              key: input.pollGroupId,
            },
          },
        },
      });
      console.log(valid);

      if (valid > 0) {
        const choicesToCreate = input.choices
          .map((elem) => {
            return { title: elem };
          })
          .filter((elem) => elem.title);

        console.log("input.title", input.title);
        console.log("ctx.session.user.id", ctx.session.user.id);
        console.log("input.pollGroupId", input.pollGroupId);

        // By ID
        const pollGroup = await ctx.prisma.pollGroup.findUnique({
          where: {
            key: input.pollGroupId,
          },
        });

        if (!pollGroup) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }

        return ctx.prisma.poll.create({
          data: {
            title: input.title,
            pollGroupId: pollGroup.id,
            authorId: ctx.session.user.id,
            choices: {
              create: choicesToCreate,
            },
          },
        });
      }
    }),

  deletePoll: protectedProcedure
    .input(
      z.object({
        pollId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // is the request user the creator of the poll?
      const pollToDelete = await ctx.prisma.user.findFirst({
        where: {
          createdPolls: {
            some: {
              id: input.pollId,
            },
          },
        },
      });
      console.log(pollToDelete);

      if (pollToDelete != null) {
        // get Poll by Id
        return ctx.prisma.poll.delete({
          where: {
            id: input.pollId,
          },
          include: {
            choices: true,
          },
        });
      }
    }),
});
