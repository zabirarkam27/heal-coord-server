const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const participantCollection = db.collection("participants");
    const adminCollection = db.collection("admins");

    // Get all camps
    app.get("/camps", async (req, res) => {
      try {
        const camps = await campCollection.find().toArray();
        res.send(camps);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch camps", error });
      }
    });

    //  Get a single camp by ID
    app.get("/camps/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const camp = await campCollection.findOne(query);

        if (!camp) {
          return res.status(404).send({ message: "Camp not found" });
        }

        res.send(camp);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch camp", error });
      }
    });

    // Register a participant
    app.post("/participants", async (req, res) => {
      try {
        const participant = req.body;
        const result = await participantCollection.insertOne(participant);
        res.send(result);
      } catch (error) {
        res
          .status(500)
          .send({ message: "Failed to register participant", error });
      }
    });

    // Increment participant count
    app.patch("/camps/:id/register", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $inc: { registeredParticipants: 1 } };
      const result = await campCollection.updateOne(query, update);
      res.send(result);
    });

    // Update admin profile by email
    app.put("/admins/:email", async (req, res) => {
      const email = req.params.email;
      const updateData = req.body;

      try {
        const filter = { email };
        const options = { upsert: true };
        const updateDoc = { $set: updateData };

        await adminCollection.updateOne(filter, updateDoc, options);
        const updatedAdmin = await adminCollection.findOne(filter);

        res.send(updatedAdmin);
      } catch (error) {
        res
          .status(500)
          .send({ message: "Failed to update organizer profile", error });
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
