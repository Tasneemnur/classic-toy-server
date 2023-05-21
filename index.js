const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9iyox0a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const toysCollection = client.db("toyCarsDB").collection("toyCars");
  try {
   

    app.get("/toys", async (req, res) => {
      let query = {};
      if (req.query?.search) {
        query = {toyName: { $regex: req.query.search,}}
      }
      if (req.query?.email) {
        query = {
          sellerEmail: req.query.email,
        };
      }
      
      const limit = 20;
      const result = await toysCollection.find(query).sort({price: -1}).limit(limit).toArray();
      res.send(result);
    });

    app.get("/toys/:id", async(req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id)}
      const result = await toysCollection.findOne(query);
      res.send(result)
    })

    app.get("/categories/:category", async(req, res) => {
      const category = req.params.category;
      const query = { category: category}
      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    app.put('/toys/:id', async(req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateToy = {
        $set: {
          price: toy.price,
          quantity: toy.quantity,
          description: toy.description
        }
      }
      const result = await toysCollection.updateOne(filter, updateToy, options);
      res.send(result)
    })

    app.delete("/toys/:id", async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.deleteOne(query);
        res.send(result)
      })

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

app.get("/", (req, res) => {
  res.send("This is Toy Cars Server");
});
app.listen(port, () => {
  console.log(`The toy cars server running on port: ${port}`);
});
