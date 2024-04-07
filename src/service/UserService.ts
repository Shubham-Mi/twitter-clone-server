import axios from "axios";
import { prismaClient } from "../client/db";
import GoogleTokenResult from "../interface/GoogleTokenResult";
import JwtService from "./JwtSevice";
import { User } from "@prisma/client";
import { redisClient } from "../client/redis";

class UserService {
  public static async verifyGoogleAuthToken(token: string) {
    const googleAuthToken = token;
    const googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOauthUrl.searchParams.set("id_token", googleAuthToken);

    const { data } = await axios.get<GoogleTokenResult>(
      googleOauthUrl.toString(),
      {
        responseType: "json",
      }
    );

    const userExists = await prismaClient.user.findUnique({
      where: { email: data.email },
    });
    if (!userExists) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new Error("Error finding/creating user");
    }
    const userToken = JwtService.generateJwtToken(user);
    return userToken;
  }

  public static getUserById(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }

  public static async followUser(follower: string, following: string) {
    await prismaClient.follows.create({
      data: {
        follower: { connect: { id: follower } },
        following: { connect: { id: following } },
      },
    });
  }

  public static async unfollowUser(follower: string, following: string) {
    await prismaClient.follows.delete({
      where: {
        followerId_followingId: {
          followerId: follower,
          followingId: following,
        },
      },
    });
  }

  public static async likeTweet(userId: string, tweetId: string) {
    await prismaClient.like.create({
      data: {
        userId,
        tweetId,
      },
    });
  }

  public static async unLikeTweet(userId: string, tweetId: string) {
    await prismaClient.like.delete({
      where: {
        tweetId_userId: {
          tweetId,
          userId,
        },
      },
    });
  }

  public static async getFollowers(userId: string) {
    const result = await prismaClient.follows.findMany({
      where: { following: { id: userId } },
      include: {
        follower: true,
      },
    });
    return result.map((r) => r.follower);
  }

  public static async getFollowing(userId: string) {
    const result = await prismaClient.follows.findMany({
      where: { follower: { id: userId } },
      include: {
        following: true,
      },
    });
    return result.map((r) => r.following);
  }

  public static async getFollowRecomendation(userId: string) {
    const result = await prismaClient.follows.findMany({
      where: { follower: { id: userId } },
      include: {
        following: {
          include: {
            followers: {
              include: {
                following: true,
              },
            },
          },
        },
      },
    });

    const followingIds = new Set(result.map((follow) => follow.followingId));
    const recommendedUsers: User[] = [];

    for (const myFollowing of result) {
      for (const myFollowingsFollowing of myFollowing.following.followers) {
        if (
          userId !== myFollowingsFollowing.following.id &&
          !followingIds.has(myFollowingsFollowing.followingId)
        ) {
          recommendedUsers.push(myFollowingsFollowing.following);
        }
      }
    }
    return recommendedUsers;
  }
}

export default UserService;
