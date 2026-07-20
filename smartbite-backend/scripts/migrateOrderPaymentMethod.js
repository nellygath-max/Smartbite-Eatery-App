const mongoose = require('mongoose');
const { MONGO_URI, MONGO_DB_NAME } = require('../src/config/env');

const migrateOrderPaymentMethod = async () => {
  try {
    console.log('Connecting to MongoDB to migrate order payment methods...');
    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME,
      serverSelectionTimeoutMS: 5_000,
    });

    const result = await mongoose.connection.collection('orders').updateMany(
      { paymentMethod: 'cash_on_delivery' },
      { $set: { paymentMethod: 'payment_on_delivery' } }
    );

    const remaining = await mongoose.connection.collection('orders').countDocuments({
      paymentMethod: 'cash_on_delivery',
    });

    console.log(
      `Matched ${result.matchedCount}; updated ${result.modifiedCount}; ${remaining} remaining.`
    );
  } finally {
    await mongoose.disconnect();
  }
};

migrateOrderPaymentMethod().catch((err) => {
  console.error('Order payment method migration failed:', err.message);
  process.exitCode = 1;
});