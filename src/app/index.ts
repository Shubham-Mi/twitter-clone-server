import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { User } from "./user";
import { HealthCheck } from "./health";
import GraphqlContext from "../interface/GraphqlContext";
import JwtService from "../service/JwtSevice";

const typeDefs = `#graphql
  ${User.types}

  type Query {
    ${HealthCheck.queries},
    ${User.queries}
  }
`;

const resolvers = {
  // Query: get some data from the server
  Query: {
    ...HealthCheck.resolvers.queries,
    ...User.resolvers.queries,
  },
  // Mutation: send some data to the server
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
