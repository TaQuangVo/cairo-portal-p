import { MongoClient, ServerApiVersion, Db, Collection } from "mongodb";
import { DBUser } from "./db.type";

const DB_NAME = "PeakAm";
const USER_COLLECTION_NAME = "users";

// Global variable to store the database client
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Function to initialize the database connection once
async function connectToDB(): Promise<MongoClient> {
  if (!client) {
    if (!process.env.DB_URI) {
      throw new Error("Mongo URI not found!");
    }

    client = new MongoClient(process.env.DB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

// Function to get a specific database
async function getDB(dbName: string): Promise<Db> {
  const client = await connectToDB();
  return client.db(dbName);
}

// Function to get a specific collection
async function getCollection(collectionName: string): Promise<Collection<Document>> {
  const db = await getDB(DB_NAME);
  return db.collection(collectionName);
}

// Function to get a specific collection
export async function getUserCollection(): Promise<Collection<DBUser>> {
  const db = await getDB(DB_NAME);
  return db.collection<DBUser>(USER_COLLECTION_NAME);
}
