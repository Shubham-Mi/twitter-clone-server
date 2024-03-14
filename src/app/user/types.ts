export const types = `#graphql
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String
    profileImageUrl: String
    tweets: [Tweet]
  }
`;
