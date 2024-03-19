import axios from "axios";
import { prismaClient } from "../client/db";
import GoogleTokenResult from "../interface/GoogleTokenResult";
import JwtService from "./JwtSevice";

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
}

export default UserService;
