import { Tweet } from "@prisma/client";
import { prismaClient } from "../../client/db";
import CreateTweetPayload from "../../interface/CreateTweetPayload";
import GraphqlContext from "../../interface/GraphqlContext";
import AllowedImageTypes from "../../enum/AllowedImageTypes";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../client/aws";
import AwsS3Service from "../../service/AwsS3Service";
import UserService from "../../service/UserService";
import TweetService from "../../service/TweetService";

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
    TweetService.getTweetsByAuthorId(id),

  getAllTweets: () => TweetService.getAllTweets(),

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
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("User not logged in!");
    const tweet = await TweetService.createTweet({
      ...payload,
      userId: ctx.user.id,
    });

    return tweet;
  },
};

const foreignKeyResolver = {
  Tweet: {
    author: (parent: Tweet) => UserService.getUserById(parent.authorId),
  },
};

export const resolvers = { queries, mutations, foreignKeyResolver };
