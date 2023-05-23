const express = require('express');
const cors = require('cors');
// MongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// npm dotenv
require('dotenv').config()

const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());


// console.log(process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tl5czkc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // find()/get all
        const serviceCollection = client.db('carDoctor').collection('services');
        // booking
        const bookingCollection = client.db('carDoctor').collection('bookings');

        // services all
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // service individual
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                // _id is given by default.(_id will not be given: _id: 0)Include only the `title` and `imdb` fields in the returned document
                // title: 1(give me the title), _id: 0(do not give me title)
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })

        // bookings(get specific datas for email)
        app.get('/bookings', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            // selecting query for specific data
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        // bookings(post)
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        // bookings(delete)
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        // bookings(put)
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            // create a filter for a booking to update
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            console.log(updatedBooking);
            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            // main updating line
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car Doctor is running.');
})

app.listen(port, () => {
    console.log(`Car Doctor is running on port: ${port}`);
})