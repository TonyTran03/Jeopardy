import express from 'express';
import { MongoClient, ObjectId } from 'mongodb'; // Import ObjectId for fetching by ID
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load environment variables
const apiPrefix = process.env.NODE_ENV === 'production' ? '/api' : '';
const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.MONGO_URI;

let client;
let collection;
let boardsCollection; // New variable for the "boards" collection

async function connectToMongoDB() {
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("jeopardy");
    collection = database.collection("questions");
    boardsCollection = database.collection("boards"); // Initialize the "boards" collection

    // Start the server only after the database connection is established
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

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
    if (!collection) {
      throw new Error('Database collection not initialized');
    }

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
    if (!collection) {
      throw new Error('Database collection not initialized');
    }

    const newQuestion = req.body;
    const result = await collection.insertOne(newQuestion);
    
    const createdQuestion = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(createdQuestion);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /boards - Retrieve all boards
app.get('/boards', async (req, res) => {
  try {
    if (!boardsCollection) {
      throw new Error('Boards collection not initialized');
    }

    const boards = await boardsCollection.find({}).toArray(); // Fetch all game boards
    res.json(boards);
  } catch (err) {
    console.error('Error fetching boards:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /boards - Save a new board
app.post('/boards', async (req, res) => {
  try {
    if (!boardsCollection) {
      throw new Error('Boards collection not initialized');
    }

    const newBoard = req.body; // This will contain the serialized URL and name
    const result = await boardsCollection.insertOne(newBoard);
    
    const createdBoard = await boardsCollection.findOne({ _id: result.insertedId });
    res.status(201).json(createdBoard);
  } catch (err) {
    console.error('Error saving board:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /boards/:id - Retrieve a specific board by ID
app.get('/boards/:id', async (req, res) => {
  try {
    const boardId = new ObjectId(req.params.id);
    const board = await boardsCollection.findOne({ _id: boardId });
    if (!board) {
      return res.status(404).send('Board not found');
    }
    res.json(board);
  } catch (err) {
    console.error('Error fetching board:', err);
    res.status(500).send('Internal Server Error');
  }
});
