import JwtUser from "./JwtUser";

interface GraphqlContext {
  user?: JwtUser;
}

export default GraphqlContext;
