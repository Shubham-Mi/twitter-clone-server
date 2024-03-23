declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET_KEY: string;
      AWS_DEFAULT_REGION: string;
      AWS_S3_ACCESS_KEY: string;
      AWS_S3_SECRET_KEY: string;
      AWS_S3_BUCKET: string;
      REDIS_ENDPOINT: string;
      REDIS_PASSWORD: string;
      REDIS_PORT: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
