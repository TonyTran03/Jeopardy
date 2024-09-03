import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load environment variables
const apiPrefix = process.env.NODE_ENV === 'production' ? '/api' : '';
const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.MONGO_URI;

let client;
let collection;
let boardsCollection;

// In-memory storage for sessions
const sessions = {};

async function connectToMongoDB() {
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("jeopardy");
    collection = database.collection("questions");
    boardsCollection = database.collection("boards");

    // Start the server only after the database connection is established
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

connectToMongoDB();

app.use(cors());
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

    const boards = await boardsCollection.find({}).toArray();
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

    const newBoard = req.body;
    const result = await boardsCollection.insertOne(newBoard);
    
    const createdBoard = await boardsCollection.findOne({ _id: result.insertedId });
    res.status(201).json(createdBoard);
  } catch (err) {
    console.error('Error saving board:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /sessions - Create or update a session
app.post('/sessions', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Session code is required' });
  }

  // If session does not exist, create it
  if (!sessions[code]) {
    sessions[code] = {};
    console.log(`Session created with code: ${code}`);
  } else {
    console.log(`Session already exists with code: ${code}`);
  }

  res.status(200).json({ message: 'Session created or updated successfully', session: sessions[code] });
});

// GET /sessions/:code - Check if session exists
app.get('/sessions/:code', (req, res) => {
  const sessionCode = req.params.code;
  const session = sessions[sessionCode];

  if (session) {
    res.status(200).json({ exists: true });
  } else {
    res.status(404).json({ exists: false });
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
