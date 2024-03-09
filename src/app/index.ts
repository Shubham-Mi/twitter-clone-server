import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    check: String
  }
`;

const resolvers = {
  Query: {
    check: () => "Graphql server is running",
  },
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
