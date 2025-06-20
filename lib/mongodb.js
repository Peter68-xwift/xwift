import { MongoClient } from "mongodb"

const uri =
  "mongodb+srv://kevinkoech041:MgBRZ9uShQ3h5AKL@cluster0.dfxucz1.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0"
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
