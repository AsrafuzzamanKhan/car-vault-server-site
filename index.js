const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6kqiq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('CarDB');
    const carsCollection = database.collection('cars');
    const reviewsCollection = database.collection('reviews');
    const bookingsCollection = database.collection('bookings');
    const usersCollection = database.collection('user');

    //  add a car
    app.post('/addCar', async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
      res.json(result);
    });

    app.get('/allCars', async (req, res) => {
      const cursor = carsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get('/homeCars', async (req, res) => {
      const cursor = carsCollection.find({}).limit(6);
      const result = await cursor.toArray();
      res.json(result);
    });

    // get single car
    app.get('/allCars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const car = await carsCollection.findOne(query);
      console.log(car);
      res.json(car);
    });

    // delete car

    app.delete('/allCars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.json(result);
    });

    app.post('/addReview', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.json(result);
    });

    app.get('/allOrders', async (req, res) => {
      const cursor = bookingsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // get personal booking
    app.get('/bookingCar', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = bookingsCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    // insert
    app.post('/bookingCar', async (req, res) => {
      const cursor = req.body;
      const result = await bookingsCollection.insertOne(cursor);
      res.json(result);
    });
    app.delete('/bookingCar/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.json(result);
    });

    // verify admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // add user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    app.put('/users', async (req, res) => {
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

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log('User: ', user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // Approve booking
    // app.put("/manageAllBooking/:id", async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: ObjectId(id) };
    //     const option = { upsert: true };
    //     const updateDoc = {
    //         $set: {
    //             status: "Approved"
    //         }
    //     }
    //     const result = await bookingCollection.updateOne(query, updateDoc, option)
    //     res.send(result);
    // });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World-2023');
});

app.listen(port, () => {
  console.log(`Example listening at http://localhost:${port}`);
});
