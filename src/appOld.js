const express = require('express');

const app = express();

// This will respond to all incoming requests
// app.use((req, res) => {
//     res.send("Hello from the server!");
// })

// app.use("/hello/2", (req, res) => {
//     res.send("Hello from the /hello/2 endpoint!");
// })

// app.use("/hello", (req, res) => {
//     res.send("Hello from the /hello endpoint!");
// })

// app.use("/test", (req, res) => {
//     res.send("Hello from the /test endpoint!");
// })

// app.use("/", (req, res) => {
//     res.send("Hello from the / endpoint!");
// })

/* <--------------------------------------------------------> */

// This will match all the HTTP methods (GET, POST, PUT, DELETE, etc.) to /test
app.use("/test", (req, res) => {
    res.send("Hello from the /test endpoint!");
})

// This will match only GET requests to /user
// This will allow the api to pass query
app.get("/user", (req, res) => {
    console.log('query: /user?userId=value', req.query)
    res.send({firstName: 'Gurukiran', lastName: 'Bhat'});
})

// For dynamic route
app.get("/user/:userId/:name", (req, res) => {
    console.log('params', req.params)
    res.send({firstName: 'Gurukiran', lastName: 'Bhat'});
})

app.post("/user", (req, res) => {
    res.send('Data has been saved successfully!');
})

app.delete("/user", (req, res) => {
    res.send('Data has been deleted successfully!');
})

app.listen(6969, () => {
    console.log('Server is running on port 6969');
});