const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// 3-minute timeout to allow initial MongoDB binary download on slow connections
jest.setTimeout(180000);

let mongoServer;

const connectTestDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
};

const clearTestDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
};

const closeTestDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};

module.exports = {
    connectTestDB,
    clearTestDB,
    closeTestDB
};
