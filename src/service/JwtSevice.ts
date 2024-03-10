import JWT from "jsonwebtoken";
import { User } from "@prisma/client";

class JwtService {
  public static generateJwtToken(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = JWT.sign(payload, process.env.JWT_SECRET_KEY);
    return token;
  }
}

export default JwtService;
