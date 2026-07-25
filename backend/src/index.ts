import express, { Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";

import { typeDefs } from "./graphql/schema";
import { resolvers, Context } from "./graphql/resolvers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }: { req: Request }): Promise<Context> => {
        let userId: string | undefined;

        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.substring(7);

          try {
            const decoded = jwt.verify(
              token,
              process.env.JWT_SECRET as string
            ) as { userId: string };

            userId = decoded.userId;
          } catch (error) {
            console.log("Invalid token");
          }
        }

        return { userId };
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});