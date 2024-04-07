export const types = `#graphql
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String
    profileImageUrl: String
    tweets: [Tweet]
    followers: [User]
    following: [User]
    recommendedUsers: [User]
    likedTweets: [Tweet]
  }
`;
