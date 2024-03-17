import { PutObjectCommand } from "@aws-sdk/client-s3";

class AwsS3Service {
  public static getPutObjectCommand(userId: string, name: string) {
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `uploads/${userId}/tweets/${name}-${Date.now().toString()}`,
    });
    return putObjectCommand;
  }
}

export default AwsS3Service;
