const express = require("express");
const app = express();
var cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3zctf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log(uri)

async function run() {
  try {
    await client.connect();
    //   console.log(`done`)
    const database = client.db("jewelry_shop");

    const shopCollection = database.collection("shop");
    const orderCollection = database.collection("order");
    const blogsCollection = database.collection("blogs");
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");

    //get blogs article
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find({}).toArray();
      res.json(result);
    });

    //get all products
    app.get("/shop", async (req, res) => {
      const result = await shopCollection.find({}).toArray();
      res.json(result);
    });

    //add new product
    app.post("/shop", async (req, res) => {
      const newProducts = req.body;
      const result = await shopCollection.insertOne(newProducts);

      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    //get all orders
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.json(result);
    });
    //DELETE API USING OBJECT ID
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(`DELTE _id: ${id}`);
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    //GET BY EMAIL ID
    app.get("/myorders/:email", async (req, res) => {
      console.log(req.params.email);
      const email = req.params.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      // console.log(appointments);
      res.json(result);
    });

    //add new order
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);

      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    //get all review
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });

    //add new review
    app.post("/review", async (req, res) => {
      const newreview = req.body;
      const result = await reviewCollection.insertOne(newreview);

      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    //USER ADD TO DB using register
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      // console.log(result);
      res.json(result);
    });

    //user add to db using googlelogin
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      // console.log(user.email);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //cheack email is admin or not
    app.get('/isadmin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  })

      // //UPDATE PUT API for Staus orders
      app.put("/orders/:id", async (req, res) => {
        // console.log('update id', req.body._id);
        const id = req.body._id;
        const updateStatus = req.body.status;
        // console.log('hitting with req.body', req.body);
        const filter = { _id: ObjectId(req.body._id) };
        console.log('hitting with status', filter);
        const options = { upsert: true };
        const updateDoc = {
          $set: { status : updateStatus }
        };
        const result = await orderCollection.updateOne(filter, updateDoc, options);
        res.send(result);
      });

          //GET API by ID
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.json(result);
    });



  } finally {
    //   await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello RAKIB JEWELLERY!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});



//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