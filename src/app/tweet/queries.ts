export const queries = `#graphql

  getAllTweets: [Tweet]

  getCurrentUserTweets: [Tweet]

  getUserTweets(id: String!): [Tweet]

  getSignedUrl(imageName: String!, imageType: String!): String
`;
