const mongoose = require('mongoose');
const { MONGO_URI } = require('../src/config/env');

const removeMenuCategoryImageUrls = async () => {
  try {
    console.log('Connecting to MongoDB to remove menu category imageUrl fields...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5_000 });
    const result = await mongoose.connection.collection('menucategories').updateMany(
      { imageUrl: { $exists: true } },
      { $unset: { imageUrl: '' } }
    );
    const remaining = await mongoose.connection.collection('menucategories').countDocuments({
      imageUrl: { $exists: true },
    });
    console.log(
      `Matched ${result.matchedCount}; removed ${result.modifiedCount}; ${remaining} remaining.`
    );
  } finally {
    await mongoose.disconnect();
  }
};

removeMenuCategoryImageUrls().catch((err) => {
  console.error('Menu category imageUrl cleanup failed:', err.message);
  process.exitCode = 1;
});
