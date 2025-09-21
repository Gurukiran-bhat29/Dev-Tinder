const express = require('express');
const connectDb = require('./config/database');
const User = require('./models/user');

const app = express();

app.post('/signUp', async (req, res) => {
  // creating a new instance of the User model
  const user = new User({
    firstName: 'Gurukiran',
    lastName: 'Bhat',
    emailId: 'guru@gmail.com',
    password: 'password@123',
  });

  try {
    await user.save();
    res.send('User added successfully')
  } catch (err) {
    res.status(400).send('Error saving the user '+ err.message)
  }
})

connectDb().then(() => {
  console.log('Database connected successfully')
  app.listen('7070', () => {
    console.log('Server is running on port 7070')
  })
}).catch(err => {
  console.error('Database cannot be connected', err)
})
