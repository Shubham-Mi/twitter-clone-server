import { Tweet } from "@prisma/client";
import CreateTweetPayload from "../../interface/CreateTweetPayload";
import GraphqlContext from "../../interface/GraphqlContext";
import AllowedImageTypes from "../../enum/AllowedImageTypes";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../client/aws";
import AwsS3Service from "../../service/AwsS3Service";
import UserService from "../../service/UserService";
import TweetService from "../../service/TweetService";
import { redisClient } from "../../client/redis";

const queries = {
  getCurrentUserTweets: async (parent: any, {}: {}, ctx: GraphqlContext) => {
    if (!ctx.user) throw new Error("User not logged in!");
    const cacheValue = await redisClient.get(`TWEETS:${ctx.user.id}`);
    if (cacheValue) return JSON.parse(cacheValue);
    const tweets = TweetService.getTweetsByAuthorId(ctx.user.id);
    await redisClient.setex(
      `TWEETS:${ctx.user.id}`,
      300,
      JSON.stringify(tweets)
    );
    return tweets;
  },

  getUserTweets: async (parent: any, { id }: { id: string }) => {
    const cacheValue = await redisClient.get(`TWEETS:${id}`);
    if (cacheValue) return JSON.parse(cacheValue);
    const tweets = await TweetService.getTweetsByAuthorId(id);
    await redisClient.setex(`TWEETS:${id}`, 300, JSON.stringify(tweets));
    return tweets;
  },

  getAllTweets: async () => {
    const cacheValue = await redisClient.get("ALL_TWEETS");
    if (cacheValue) return JSON.parse(cacheValue);
    const tweets = await TweetService.getAllTweets();
    await redisClient.set("ALL_TWEETS", JSON.stringify(tweets));
    return tweets;
  },

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
    await redisClient.del("ALL_TWEETS");
    await redisClient.del(`TWEETS:${ctx.user.id}`);
    return tweet;
  },
};

const foreignKeyResolver = {
  Tweet: {
    author: (parent: Tweet) => UserService.getUserById(parent.authorId),
    likedBy: (parent: Tweet) => TweetService.getLikedUsers(parent.id),
  },
};

export const resolvers = { queries, mutations, foreignKeyResolver };
