const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uri = process.env.DB_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // collections
    const database = client.db("assets-management");
    const userCollection = database.collection("users");

    // user api's
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server setup

app.get("/", async (req, res) => {
  res.send(`Asset management server is running...`);
});
app.listen(port, async (req, send) => {
  console.log(`Server Running on: ${port}`);
});
