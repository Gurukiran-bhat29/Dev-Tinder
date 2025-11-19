require('dotenv').config();
const express = require('express');
const connectDb = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

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

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDb().then(() => {
  try {
    app.listen(7070, () => {
      console.log('Server is running on port 7070');
    })
  } catch (err) {
    console.error('Database connection error:', err);
  }
});