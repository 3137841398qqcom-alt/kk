import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/dbname?sslmode=require",
  },
});
