import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { User } from "./user";

const typeDefs = `#graphql
  ${User.types}

  type Query {
    health: String!,
    ${User.queries}
  }
`;

const resolvers = {
  // Query: get some data from the server
  Query: {
    health: () => "Graphql server is running",
    ...User.resolvers.queries,
  },
  // Mutation: send some data to the server
};

export async function initServer() {
  const app = express();
  const graphqlServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await graphqlServer.start();

  app.use(bodyParser.json());
  app.use("/graphql", expressMiddleware(graphqlServer));

  return app;
}
