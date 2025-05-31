const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion} = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cuvfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("healCoordDB");
    const campCollection = db.collection("camps");

    app.get("/camps", async (req, res) => {
        try {
          const camps = await campCollection.find().toArray();
          res.send(camps);
        } catch (error) {
            res.status(500).send({ message: "Failed to fetch camps", error });
        }
      });

    app.get("/", (req, res) => {
      res.send("HealCoord server is running!");
    });

    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

app.listen(port, () => {
  console.log(`HealCoord server is running on port: ${port}`);
});
run().catch(console.dir);
