import GraphqlContext from "../../interface/GraphqlContext";
import { User } from "@prisma/client";
import UserService from "../../service/UserService";
import TweetService from "../../service/TweetService";
import { redisClient } from "../../client/redis";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const twitterToken = await UserService.verifyGoogleAuthToken(token);
    return twitterToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;
    const cacheValue = await redisClient.get(`USER:${id}`);
    if (cacheValue) return JSON.parse(cacheValue);
    const user = await UserService.getUserById(id);
    await redisClient.setex(`USER:${id}`, 300, JSON.stringify(user));
    return user;
  },

  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => {
    const cacheValue = await redisClient.get(`USER:${id}`);
    if (cacheValue) return JSON.parse(cacheValue);
    const user = await UserService.getUserById(id);
    await redisClient.setex(`USER:${id}`, 300, JSON.stringify(user));
    return user;
  },
};

const mutations = {
  followUser: async (
    parent: any,
    { userId }: { userId: string },
    ctx: GraphqlContext
  ) => {
    const id = ctx.user?.id;
    if (!id) throw new Error("Unauthenticated");
    await UserService.followUser(id, userId);
    await redisClient.del(`RECOMMENDED_USERS:${ctx.user?.id}`);
    return true;
  },

  unfollowUser: async (
    parent: any,
    { userId }: { userId: string },
    ctx: GraphqlContext
  ) => {
    const id = ctx.user?.id;
    if (!id) throw new Error("Unauthenticated");
    await UserService.unfollowUser(id, userId);
    await redisClient.del(`RECOMMENDED_USERS:${ctx.user?.id}`);
    return true;
  },
};

const foreignKeyResolver = {
  User: {
    tweets: (parent: User) => TweetService.getTweetsByAuthorId(parent.id),
    followers: (parent: User) => UserService.getFollowers(parent.id),
    following: (parent: User) => UserService.getFollowing(parent.id),
    recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
      if (!ctx.user) return [];
      const cacheValue = await redisClient.get(
        `RECOMMENDED_USERS:${parent.id}`
      );
      if (cacheValue) return JSON.parse(cacheValue);
      const recommendedUsers = await UserService.getFollowRecomendation(
        parent.id
      );
      await redisClient.set(
        `RECOMMENDED_USERS:${parent.id}`,
        JSON.stringify(recommendedUsers)
      );
      return recommendedUsers;
    },
  },
};

export const resolvers = { queries, mutations, foreignKeyResolver };
