import { prismaClient } from "../../client/db";
import GraphqlContext from "../../interface/GraphqlContext";
import { User } from "@prisma/client";
import UserService from "../../service/UserService";
import TweetService from "../../service/TweetService";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const twitterToken = await UserService.verifyGoogleAuthToken(token);
    return twitterToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;
    const user = await UserService.getUserById(id);
    return user;
  },

  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => UserService.getUserById(id),
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
    return true;
  },
};

const foreignKeyResolver = {
  User: {
    tweets: (parent: User) => TweetService.getTweetsByAuthorId(parent.id),
    followers: (parent: User) => UserService.getFollowers(parent.id),
    following: (parent: User) => UserService.getFollowing(parent.id),
    recommendedUsers: (parent: User, _: any, ctx: GraphqlContext) => {
      if (!ctx.user) return [];
      return UserService.getFollowRecomendation(parent.id);
    },
  },
};

export const resolvers = { queries, mutations, foreignKeyResolver };
