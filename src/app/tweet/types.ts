export const types = `#graphql

  input CreateTweet {
    content: String!
    imageUrl: String
  }

  type Tweet {
    id: ID!
    content: String!
    imageUrl: String
    author: User
    likedBy: [User]
  }
`;
