const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const listDBs = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/');
        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const dbs = await admin.listDatabases();
        console.log('Databases:', dbs.databases.map(db => db.name));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

listDBs();
