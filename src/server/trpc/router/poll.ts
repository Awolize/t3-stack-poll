import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../trpc";

export const pollRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAllPollGroups: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: { name: true },
    });
  }),

  getPollsByGroupKey: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.pollGroup.findFirst({
        where: { key: input.key },
        include: {
          polls: {
            include: {
              choices: {
                include: {
                  pollVotes: true,
                },
              },
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
            pollVotes: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      } else {
        return await ctx.prisma.pollChoice.update({
          where: { id: input.choiceId },
          data: {
            pollVotes: {
              disconnect: { id: ctx.session.user.id },
            },
          },
        });
      }
    }),

  //   createChoice: protectedProcedure
  //     .input(z.object({ title: z.string() }))
  //     .mutation(async ({ ctx, input }) => {
  //       return await ctx.prisma.pollChoice.create({
  //         data: {
  //           title: input.title,
  //           pollId: undefined,
  //         },
  //       });
  //     }),

  createPoll: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        pollGroupId: z.string(),
        choices: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //validate groupId
      console.log(input.pollGroupId);

      const valid = await ctx.prisma.user.count({
        where: {
          OR: [
            {
              //member of poll group
              pollGroups: {
                some: {
                  key: input.pollGroupId,
                },
              },
            },
            {
              //creator of poll group
              createdPollGroups: {
                some: {
                  key: input.pollGroupId,
                },
              },
            },
          ],
        },
      });

      if (valid > 0) {
        const choicesToCreate = input.choices.map((elem) => {
          return { title: elem };
        });

        console.log("input.title", input.title);
        console.log("ctx.session.user.id", ctx.session.user.id);
        console.log("input.pollGroupId", input.pollGroupId);

        // By ID
        const pollGroup = await ctx.prisma.pollGroup.findUnique({
          where: {
            key: input.pollGroupId,
          },
        });

        return ctx.prisma.poll.create({
          data: {
            title: input.title,
            pollGroupId: pollGroup!.id,
            authorId: ctx.session.user.id,
            choices: {
              create: choicesToCreate,
            },
          },
        });
      }
    }),
});
