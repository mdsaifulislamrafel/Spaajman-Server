const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        'http://localhost:5174'
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());



const uri = "mongodb+srv://newProject:TDtatArVAMt2EAcF@cluster0.2lraink.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const userCollection = client.db("Spaajman").collection("user");
const shopData = client.db("Spaajman").collection("service");
const jobsData = client.db("Spaajman").collection("jobs");
const blogsData = client.db("Spaajman").collection("blogs");
const requestedShop = client.db("Spaajman").collection("requestedShop");
async function run() {
    try {

        // jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        });



        // shop data start
        app.get('/shop', async (req, res) => {
            const services = await shopData.find().toArray();
            res.send(services)
        })

        app.get('/shop/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await shopData.findOne(query);
            res.send(result);
        });

        // shop data end

        // shop Post Api Start
        app.post('/shop', async (req, res) => {
            const newService = req.body;
            const result = await shopData.insertOne(newService);
            res.status(201).send(result);
        })

        app.delete('/shop/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await shopData.deleteOne(query);
            res.send(result);
        });


        // shop register method

        app.get('/shop/position/:email', async (req, res) => {
            const email = req.params.email;
            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: 'Unauthorized request' });
            // }

            const query = { email: email };
            const user = await shopData.findOne(query);
            let positionAs = false;
            if (user) {
                positionAs = user?.positionAs === 'shop';
            }
            // res.send({ positionAs });
            res.send({ position: positionAs });
        });

        app.patch('/shop/approved/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: 'approved',
                    positionAs: 'shop'
                }
            };
            const result = await shopData.updateOne(filter, updatedDoc, options);
            res.send(result);

        });



        // Shop Request korbo Admin ar kase

        app.post('/requestedShop', async (req, res) => {
            const shopDetails = req.body;
            console.log(shopDetails);
            try {
                const result = await requestedShop.insertOne(shopDetails);
                res.status(200).json({ message: 'Shop Requested successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Failed to Shop Requested' });
            }
        });

        app.get('/requestedShop', async (req, res) => {
            try {
                const Shop = await requestedShop.find().toArray();
                res.status(200).json(Shop);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch Shop' });
            }
        });


        // registerAs api service

        // app.get('/user/registerAs/:type', async (req, res) => {
        //     try {
        //         const type = req.params.type;
        //         const query = { registerAs: type };
        //         const users = await shopData.find(query).toArray();
        //         res.send(users);
        //     } catch (error) {
        //         res.status(500).send({ error: 'Failed to fetch users' });
        //     }
        // });

        app.post('/users', async (req, res) => {
            const user = req.body;
            // insert email if user does not exist
            // you can do this many way
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists', insertedId: null });
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        });
        app.get('/users', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users)
        })


        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // admin apis
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: 'Unauthorized request' });
            // }

            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        });


        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        // find all and single job api start

        app.get('/jobs', async (req, res) => {
            const jobs = await jobsData.find({}).toArray();
            res.send(jobs)
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await jobsData.findOne(query);
            res.send(result);
        });

        // find all and single job api end
        // Job Post Api Start 

        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsData.insertOne(newJob);
            res.status(201).send(result);
        });
        // blog api endpoint start

        app.get('/blogs', async (req, res) => {
            const blogs = await blogsData.find({}).toArray();
            res.send(blogs)
        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await blogsData.findOne(query);
            res.send(result);
        });

        // blog api endpoint end

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
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})