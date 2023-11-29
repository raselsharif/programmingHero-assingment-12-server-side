const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const assetCollection = database.collection("assets");
    // const customAssetCollection = database.collection("customAssets");

    // payment stripe

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log("amount", amount);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    // user api's
    app.get("/users", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    // get single user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await userCollection.findOne(filter);
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // update user
    app.put("/update-profile/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      console.log(user, id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          ...user,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });
    // add custom asset
    // app.post("/add-custom-asset", async (req, res) => {
    //   const asset = req.body;
    //   const result = await customAssetCollection.insertOne(asset);
    //   res.send(result);
    // });
    // // get custom assets
    // app.get("/custom-assets", async (req, res) => {
    //   const assets = await customAssetCollection.find().toArray();
    //   res.send(assets);
    // });

    // admin api
    app.get("/employee/:owner", async (req, res) => {
      const owner = req.params.owner;
      const filter = { workAt: owner };
      const result = await userCollection.find(filter).toArray();
      res.send(result);
    });
    app.get("/assets", async (req, res) => {
      const assets = await assetCollection.find().toArray();
      res.send(assets);
    });
    app.get("/asset/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await assetCollection.findOne(filter);
      res.send(result);
    });
    app.put("/asset-update/:id", async (req, res) => {
      const id = req.params.id;
      const asset = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAsset = {
        $set: {
          ...asset,
        },
      };
      const result = await assetCollection.updateOne(
        filter,
        updateAsset,
        options
      );
      res.send(result);
    });
    app.post("/add-asset", async (req, res) => {
      const asset = req.body;
      const result = await assetCollection.insertOne(asset);
      res.send(result);
    });
    app.delete("/asset-delete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await assetCollection.deleteOne(filter);
      res.send(result);
    });
    app.put("/add-remove-team/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      console.log(user, id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          ...user,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
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
