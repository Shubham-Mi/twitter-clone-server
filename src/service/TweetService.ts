import { prismaClient } from "../client/db";
import CreateTweetPayload from "../interface/CreateTweetPayload";

class TweetService {
  public static createTweet(payload: CreateTweetPayload) {
    const tweet = prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        authorId: payload.userId,
      },
    });
    return tweet;
  }

  public static getAllTweets() {
    return prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } });
  }

  public static getTweetsByAuthorId(id: string) {
    return prismaClient.tweet.findMany({
      where: { author: { id: id } },
      orderBy: { createdAt: "desc" },
    });
  }
}

export default TweetService;
