const express = require('express');

const app = express();

// This will respond to all incoming requests
// app.use((req, res) => {
//     res.send("Hello from the server!");
// })

app.use("/test", (req, res) => {
    res.send("Hello from the /test endpoint!");
})

app.listen(6969, () => {
    console.log('Server is running on port 6969');
});