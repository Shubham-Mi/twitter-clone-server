export const mutations = `#graphql
  followUser(userId: ID!): Boolean

  unfollowUser(userId: ID!): Boolean

  likeTweet(tweetId: ID!): Boolean

  unLikeTweet(tweetId: ID!): Boolean
`;
