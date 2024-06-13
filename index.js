const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;
// middleWare
app.use(cors({
    origin: ['http://localhost:5173',process.env.ACCESS_URL],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


const verify = (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        return res.send({ message: "empty cookies" })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "access failed" })
        }
        req.user = decoded;
        next()
    })
}




const uri = "mongodb+srv://mdafsar99009:sF5mneEKKJ4d$.-@cluster0.zgmhkd0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const cookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // Send a ping to confirm a successful connection
        const database = client.db("CommentDB").collection('Comments');



        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await database.insertOne(comment);
            res.send(result)
        })

        app.get('/comments', async (req, res) => {
            const result = await database.find().toArray();
            res.send(result)
        })

        app.delete('/comments/:id', async (req, res) => {
            const result = await database.deleteOne({ _id: new ObjectId(req.params.id) });
            res.send(result)
        })

        app.get('/comment', verify, async (req, res) => {
            console.log(req.query)
            let query = {}
            if (req.query?.name) {
                query = { name: req.query.name }
            }
            const result = await database.find(query).toArray();
            res.send(result)
        })



        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
            res
                .cookie('token', token, cookieOption)
                .send({ success: true })
        })

        app.post('/logout', (req, res) => {
            res
                .clearCookie('token', { ...cookieOption ,maxAge: 0 })
                .send({ success: true })
        })



        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);











app.get('/', (req, res) => {
    res.send('the server is running is properly')
})
app.listen(port, () => {
    console.log('the server is running')
})