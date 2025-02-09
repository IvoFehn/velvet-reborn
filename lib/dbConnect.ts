import mongoose, { Mongoose } from "mongoose";

// Typdefinition für den Mongoose-Cache
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Erweiterung des globalen Namespace
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// Sicherstellen, dass die globale Variable existiert
const globalAny: typeof globalThis & { mongoose?: MongooseCache } = global;

if (!globalAny.mongoose) {
  globalAny.mongoose = { conn: null, promise: null };
}

const cached = globalAny.mongoose;

/**
 * Stellt eine Verbindung zur MongoDB-Datenbank her.
 * Verwendet einen Cache, um wiederholte Verbindungsaufbauten zu vermeiden.
 *
 * @returns {Promise<Mongoose>} Die Mongoose-Instanz.
 * @throws {Error} Wenn die Verbindung fehlschlägt.
 */
async function dbConnect(): Promise<Mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  // Die folgende Überprüfung ist redundant, da TypeScript weiß, dass MONGODB_URI ein string ist
  if (!MONGODB_URI) {
    throw new Error("Bitte definieren Sie die MONGODB_URI Umgebungsvariable");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Weitere Optionen können hier hinzugefügt werden
      // Beispielsweise:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // retryWrites: true,
      // w: "majority",
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
