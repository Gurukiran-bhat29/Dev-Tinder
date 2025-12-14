require('dotenv').config();

const express = require('express');
const connectDb = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const http = require('http');
const initializeSocket = require('./utils/socket');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const paymentRouter = require('./routes/payment');
const chatRouter = require('./routes/chat');

require('./utils/cronjobs');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', paymentRouter); // Add this line
app.use('/', chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDb().then(() => {
  try {
    server.listen(7070, () => {
      console.log('Server is running on port 7070');
    })
  } catch (err) {
    console.error('Database connection error:', err);
  }
});