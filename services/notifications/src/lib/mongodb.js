const { MongoClient, ServerApiVersion } = require('mongodb');

let cachedDb = null;

const connectToDatabase = async () => {
    if (cachedDb) {
        return cachedDb;
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });

    await client.connect();
    const db = client.db(process.env.DB_NAME);
    cachedDb = db;
    return db;
};

module.exports = {
    connectToDatabase,
}; 