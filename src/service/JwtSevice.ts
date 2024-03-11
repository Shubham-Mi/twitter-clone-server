import JWT from "jsonwebtoken";
import { User } from "@prisma/client";
import JwtUser from "../interface/JwtUser";

class JwtService {
  public static generateJwtToken(user: User) {
    const payload: JwtUser = {
      id: user.id,
      email: user.email,
    };
    const token = JWT.sign(payload, process.env.JWT_SECRET_KEY);
    return token;
  }

  public static decodeJwtToken(token: string) {
    try {
      return JWT.verify(token, process.env.JWT_SECRET_KEY) as JwtUser;
    } catch (error) {
      return null;
    }
  }
}

export default JwtService;
