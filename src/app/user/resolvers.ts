import axios from "axios";
import { prismaClient } from "../../db";
import JwtService from "../../service/JwtSevice";
import GoogleTokenResult from "../../interface/GoogleTokenResult";
import GraphqlContext from "../../interface/GraphqlContext";
import { User } from "@prisma/client";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
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
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;
    const user = await prismaClient.user.findUnique({ where: { id } });
    return user;
  },

  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => prismaClient.user.findUnique({ where: { id } }),
};

const foreignKeyResolver = {
  User: {
    tweets: (parent: User) =>
      prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
  },
};

export const resolvers = { queries, foreignKeyResolver };
