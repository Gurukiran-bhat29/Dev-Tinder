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
app.get("/user", (req, res) => {
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