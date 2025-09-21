const mongoose = require('mongoose');

const URI = "mongodb+srv://gurukiranb92_db_user:9nk0oCh2AJgXYbpj@namastenode.wlffa0w.mongodb.net/devTinder";

const connectDb = async () => {
    await mongoose.connect(URI);
}

module.exports = connectDb;