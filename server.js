import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

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

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Your WebSocket connection handler
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'join') {
      const { sessionCode } = parsedMessage;
      ws.sessionCode = sessionCode.toUpperCase(); // Ensure session code is uppercase
      console.log(`Client joined session: ${sessionCode}`);
    }
    else if(parsedMessage.type === 'buzz'){
      const { teamName, playerName, sessionCode } = parsedMessage;
      ws.sessionCode = sessionCode.toUpperCase();
      broadcastToSession(ws.sessionCode, {teamaName, playerName});
      res.status(200).json({ message: `team name = ${teamName}, player name = ${playerName}` });
    }
  });
});

// Function to broadcast a message to all clients in a session
function broadcastToSession(sessionCode, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.sessionCode === sessionCode) {
      client.send(JSON.stringify(message));
    }
  });
}

async function connectToMongoDB() {
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("jeopardy");
    collection = database.collection("questions");
    boardsCollection = database.collection("boards");

    // Start the Express server
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

connectToMongoDB();

// Define your routes here...
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

// Create a new session
app.post('/sessions', (req, res) => {
  const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newSession = {
    sessionCode,
    teams: [],
    gameStarted: false,
    board: null,
    currentQuestion: null,
  };

  sessions[sessionCode] = newSession;
  console.log(`Session created with code: ${sessionCode}`);
  res.status(201).json({ sessionCode });
});

// Get session details
app.get('/sessions/:code', (req, res) => {
  const sessionCode = req.params.code.toUpperCase();

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.status(200).json(sessions[sessionCode]);
});

// Join a session
app.post('/sessions/:code/join', (req, res) => {
  const sessionCode = req.params.code.toUpperCase();
  let { teamName, playerName } = req.body;

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  teamName = teamName.toUpperCase();

  let team = sessions[sessionCode].teams.find(team => team.name === teamName);
  if (!team) {
    team = { name: teamName, players: [], score: 0 };
    sessions[sessionCode].teams.push(team);
  }

  if (!team.players.includes(playerName)) {
    team.players.push(playerName);
  }

  console.log(`${playerName} joined team ${teamName} in session ${sessionCode}`);
  broadcastToSession(sessionCode, { type: 'update', teams: sessions[sessionCode].teams });
  res.status(200).json({ teams: sessions[sessionCode].teams });
});

// Update score
app.post('/sessions/:code/score', (req, res) => {
  const sessionCode = req.params.code.toUpperCase();
  const { teamName, points } = req.body;

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const team = sessions[sessionCode].teams.find(team => team.name === teamName.toUpperCase());
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }

  team.score += points;
  console.log(`Team ${teamName} now has ${team.score} points in session ${sessionCode}`);
  broadcastToSession(sessionCode, { type: 'score_update', teams: sessions[sessionCode].teams });
  res.status(200).json({ score: team.score });
});

// Display scores
app.get('/sessions/:code/scores', (req, res) => {
  const sessionCode = req.params.code.toUpperCase();

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const scores = sessions[sessionCode].teams.map(team => ({
    teamName: team.name,
    score: team.score,
  }));

  res.status(200).json({ scores });
});

// Start the game
app.post('/sessions/:code/start', (req, res) => {
  const sessionCode = req.params.code.toUpperCase();

  if (!sessions[sessionCode]) {
    return res.status(404).json({ message: 'Session not found' });
  }

  sessions[sessionCode].gameStarted = true;
  console.log(`Game started for session ${sessionCode}`);
  broadcastToSession(sessionCode, { type: 'start', message: 'Game started' });
  res.status(200).json({ message: 'Game started' });
});


// When buzzers are activated
app.post('/sessions/:code/activate', (req, res) => {
  const sessionCode = req.params.code.toUpperCase();
  broadcastToSession(sessionCode, { type: 'activate_buzzers' });
  res.status(200).json({ message: 'Buzzers activated' });
});
// When buzzers are deactivated
app.post('/sessions/:code/deactivate', (req, res) => {
  const sessionCode = req.params.code.toUpperCase();
  broadcastToSession(sessionCode, { type: 'deactivate_buzzers' });
  res.status(200).json({ message: 'Buzzers deactivated' });
});