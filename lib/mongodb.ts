import "server-only"

import { MongoClient, ServerApiVersion } from "mongodb"

import { env, requireEnv } from "@/lib/env"

const globalMongo = globalThis as typeof globalThis & {
  shotgardenMongo?: Promise<MongoClient>
}

export function mongoClient(): Promise<MongoClient> {
  if (!globalMongo.shotgardenMongo) {
    const client = new MongoClient(requireEnv("MONGODB_URI"), {
      serverApi: ServerApiVersion.v1,
    })
    globalMongo.shotgardenMongo = client.connect()
  }
  return globalMongo.shotgardenMongo
}

export async function db() {
  return (await mongoClient()).db(env().MONGODB_DB)
}
