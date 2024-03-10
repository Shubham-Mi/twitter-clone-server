import axios from "axios";
import { prismaClient } from "../../db";
import JwtService from "../../service/JwtSevice";
import GoogleTokenResult from "../../interface/GoogleTokenResult";

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
};

export const resolvers = { queries };
