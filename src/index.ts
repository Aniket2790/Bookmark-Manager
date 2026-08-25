import { createYoga, createSchema } from "graphql-yoga";
import { createServer } from "node:http";
import fs from "node:fs";
import { resolvers } from "./graphql/resolvers";
import { createContext } from "./graphql/context";

const typeDefs = fs.readFileSync(
  "./src/graphql/schema.graphql",
  "utf8",
);

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: createContext,
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log("🚀 GraphQL Yoga running at http://localhost:4000/graphql");
});