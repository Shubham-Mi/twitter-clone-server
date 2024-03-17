import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import CreateTweetPayload from "../../interface/CreateTweetPayload";
import GraphqlContext from "../../interface/GraphqlContext";

const queries = {
  getCurrentUserTweets: (parent: any, {}: {}, ctx: GraphqlContext) => {
    if (!ctx.user) throw new Error("User not logged in!");
    const tweets = prismaClient.tweet.findMany({
      where: { author: { id: ctx.user?.id } },
      orderBy: { createdAt: "desc" },
    });
    return tweets;
  },

  getUserTweets: (parent: any, { id }: { id: string }) =>
    prismaClient.tweet.findMany({
      where: { author: { id: id } },
      orderBy: { createdAt: "desc" },
    }),

  getAllTweets: () =>
    prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
};

const mutations = {
  createTweet: (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("User not logged in!");
    const tweet = prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        author: { connect: { id: ctx.user.id } },
      },
    });

    return tweet;
  },
};

const foreignKeyResolver = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaClient.user.findFirst({ where: { id: parent.authorId } }),
  },
};

export const resolvers = { queries, mutations, foreignKeyResolver };
