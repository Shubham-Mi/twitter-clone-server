export const queries = `#graphql

  getAllTweets: [Tweet]

  getCurrentUserTweets: [Tweet]

  getUserTweets(id: String!): [Tweet]
`;
