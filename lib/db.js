const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

export default db;
