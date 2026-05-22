const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  console.log('📡 Connecting to:', mongoURI);
  
  await mongoose.connect(mongoURI);
  
  // ✅ Show which database we're connected to
  const dbName = mongoose.connection.db.databaseName;
  console.log('✅ Connected to database:', dbName);
  
  // ✅ List all collections in this database
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('📚 Collections in this database:', collections.map(c => c.name));

  const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String
  });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const hashedPassword = await bcrypt.hash('Admin@2003', 12);

  const result = await User.findOneAndUpdate(
    { email: 'admin@panditji.com' },
    {
      username: 'admin',
      email: 'admin@panditji.com',
      password: hashedPassword,
      role: 'admin'
    },
    { upsert: true, new: true }
  );

  console.log('✅ Admin user created/updated in database:', dbName);
  console.log('   Email:', result.email);
  console.log('   Role:', result.role);
  
  // ✅ Verify by counting all users
  const userCount = await User.countDocuments();
  console.log('📊 Total users in this database:', userCount);
  
  await mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});