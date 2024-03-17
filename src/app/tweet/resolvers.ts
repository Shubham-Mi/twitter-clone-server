import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import CreateTweetPayload from "../../interface/CreateTweetPayload";
import GraphqlContext from "../../interface/GraphqlContext";
import AllowedImageTypes from "../../enum/AllowedImageTypes";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../client/aws";
import AwsS3Service from "../../service/AwsS3Service";

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

  getSignedUrl: (
    parent: any,
    { imageName, imageType }: { imageName: string; imageType: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("User not logged in");
    if (!(imageType in AllowedImageTypes))
      throw new Error("Unsupported image type");

    const signedUrl = getSignedUrl(
      s3Client,
      AwsS3Service.getPutObjectCommand(ctx.user.id, imageName),
      { expiresIn: 300 }
    );

    return signedUrl;
  },
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
