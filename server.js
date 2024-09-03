import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load environment variables
const apiPrefix = process.env.NODE_ENV === 'production' ? '/api' : '';
const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.MONGO_URI;
let client;
let collection;

async function connectToMongoDB() {
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("jeopardy");
    collection = database.collection("questions");

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the application if the connection fails
  }
}

connectToMongoDB();

app.use(cors());

// Middleware 
app.use(express.json());

// GET /questions - Retrieve all questions
app.get(`${apiPrefix}/questions`, async (req, res) => {
  try {
    const questions = await collection.find({}).toArray();
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /questions - Create a new question
app.post(`${apiPrefix}/questions`, async (req, res) => {
  try {
    const newQuestion = req.body;
    const result = await collection.insertOne(newQuestion);
    
    // Fetch the newly inserted document by its ID
    const createdQuestion = await collection.findOne({ _id: result.insertedId });

    res.status(201).json(createdQuestion);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
