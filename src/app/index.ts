import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { User } from "./user";
import { Tweet } from "./tweet";
import { HealthCheck } from "./health";
import GraphqlContext from "../interface/GraphqlContext";
import JwtService from "../service/JwtSevice";

const typeDefs = `#graphql
  ${User.types}
  ${Tweet.types}

  type Query {
    ${HealthCheck.queries},
    ${User.queries},
    ${Tweet.queries}
  }

  type Mutation {
    ${Tweet.mutations},
    ${User.mutations}
  }
`;

const resolvers = {
  // Query: get some data from the server
  Query: {
    ...HealthCheck.resolvers.queries,
    ...User.resolvers.queries,
    ...Tweet.resolvers.queries,
  },
  // Mutation: send some data to the server
  Mutation: {
    ...User.resolvers.mutations,
    ...Tweet.resolvers.mutations,
  },
  ...User.resolvers.foreignKeyResolver,
  ...Tweet.resolvers.foreignKeyResolver,
};

export async function initServer() {
  const app = express();
  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs,
    resolvers,
  });
  await graphqlServer.start();
  app.use(bodyParser.json());
  app.use(cors());

  app.get("/", (req, res) => res.status(200).json({ message: "running" }));
  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JwtService.decodeJwtToken(
                req.headers.authorization.split("Bearer ")[1]
              )
            : undefined,
        };
      },
    })
  );
  return app;
}
