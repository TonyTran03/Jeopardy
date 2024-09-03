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


app.post('/sessions', (req, res) => {
  const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  if (!sessions[sessionCode]) {
    sessions[sessionCode] = {
      players: [],  // List of players in the session
      gameStarted: false,
      // Add any other session-specific data here
    };
    console.log(`Session created with code: ${sessionCode}`);
    res.status(201).json({ sessionCode });
  } else {
    res.status(409).json({ message: 'Session already exists' });
  }
});

// POST /sessions/:code/join - Join a session
app.post('/sessions/:code/join', (req, res) => {
  const sessionCode = req.params.code;
  const { playerName } = req.body;

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  if (sessions[sessionCode].gameStarted) {
    return res.status(400).json({ message: 'Game has already started' });
  }

  sessions[sessionCode].players.push(playerName);
  console.log(`${playerName} joined session ${sessionCode}`);
  res.status(200).json({ message: 'Joined session successfully', players: sessions[sessionCode].players });
});

// POST /sessions/:code/start - Start the game
app.post('/sessions/:code/start', (req, res) => {
  const sessionCode = req.params.code;

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  sessions[sessionCode].gameStarted = true;
  console.log(`Game started for session ${sessionCode}`);
  res.status(200).json({ message: 'Game started' });
});

// GET /sessions/:code - Get session details
app.get('/sessions/:code', (req, res) => {
  const sessionCode = req.params.code;

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.status(200).json(sessions[sessionCode]);
});