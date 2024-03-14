import { prismaClient } from "../../db";
import CreateTweetPayload from "../../interface/CreateTweetPayload";
import GraphqlContext from "../../interface/GraphqlContext";

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

export const resolvers = { mutations };
