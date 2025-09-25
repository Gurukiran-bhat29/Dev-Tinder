const express = require('express');
const connectDb = require('./config/database');
const validator = require('validator');
const User = require('./models/user');
const { validateSignUpData } = require('./utils/validation');
const bcrypt = require('bcrypt');

const app = express();

/* <------------------- Here request data is being harcoded -------------------> */
// app.post('/signUp', async (req, res) => {

/* <---------- creating a new instance of the User model ----------> */

//   const user = new User({
//     firstName: 'Gurukiran',
//     lastName: 'Bhat',
//     emailId: 'guru@gmail.com',
//     password: 'password@123',
//   });

//   try {
//     await user.save();
//     res.send('User added successfully')
//   } catch (err) {
//     res.status(400).send('Error saving the user '+ err.message)
//   }
// })

// This middleware will be activated for the routes since app.use will run on all the route handlers
// The request.body will be in the form of readable stream and we need to convert it to json()
app.use(express.json());

app.post('/signUp', async (req, res) => {
  // console.log('Body', req.body)

  // NOTE: Never pass the req.body directly to the database instance
  // const user = new User(req.body);

  const { firstName, lastName, emailId, password } = req.body;
  try {
    // Validation of data
    validateSignUpData(req);

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating the new instance of the User model
    const user = new User({
      firstName, 
      lastName, 
      emailId, 
      password: passwordHash
    })

    await user.save();
    res.send('User added successfully')
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message)
  }
})

app.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      /* Never mention the message as below as it could be information leaking
      throw new Error('Email is not valid'); */
      throw new Error('Invalid credentials');
    } 

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      // throw new Error('EmailId is not present in Database');
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      res.send("Login Successful...!!!");
    } else {
      // throw new Error('Password is not correct');
      throw new Error('Invalid credentials');
    }
  } catch (err) {
    res.status(400).send('ERROR : ' + err.message)
  }
})

// Get user by email
app.get('/user', async (req, res) => {
  try {
    const userEmail = req.body.email;
    const users = await User.find({ emailId: userEmail })

    if (users.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.send(users);
    }
  } catch (err) {
    console.error('Something went wrong', err)
  }
})

// Feed API - Get /feed - get all the users from the database
app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({})
    if (users.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.send(users);
    }
  } catch (err) {
    console.error('Something went wrong', err)
  }
})


// Delete a user from Database
app.delete('/user', async (req, res) => {
  const userId = req.body.userId;
  try {
    // const user = await User.findByIdAndDelete({ _id: userId })
    const user = await User.findByIdAndDelete(userId)
    res.send('User deleted successfully');
  } catch (err) {
    console.error('Something went wrong', err);
  }
})

// Update a user to Database
app.patch('/user/:userId', async (req, res) => {
  const data = req.body;
  const userId = req.params?.userId;

  const ALLOWED_UPDATE = ['password', 'photoUrl', 'about', 'gender', 'age', 'skills'];

  try {
    const isUpdateAllowed = Object.keys(data).every((k) => ALLOWED_UPDATE.includes(k));

    if (!isUpdateAllowed) {
      throw new Error('Update not allowed');
    }

    if (data.skills.length > 10) {
      throw new Error('skills cannot be more than 10');
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, data);
    console.log('user', user);

    const userBefore = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: 'before',
      runValidators: true
    });
    console.log('Before document', userBefore);

    const userAfter = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: 'after',
      runValidators: true
    });
    console.log('Before document', userAfter);

    res.send('User update successfully');
  } catch (err) {
    console.error('Something went wrong', err);
    res.status(400).send('Update failed' + err.message)
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
