const { MONGO_URI, MONGO_DB_NAME } = require('./env');

module.exports = {
  mongoUri: MONGO_URI,
  mongoOptions: { dbName: MONGO_DB_NAME },
};
