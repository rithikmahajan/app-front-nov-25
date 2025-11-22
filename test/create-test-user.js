const mongoose = require('mongoose');
const User = require('../oct-7-backend-admin-main/src/models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/yoraa-db')
  .then(async () => {
    console.log('Connected to database...');
    
    // Check if user exists
    let user = await User.findOne({ phNo: '9999888877' });
    console.log('Existing user:', user ? 'FOUND' : 'NOT FOUND');
    
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    if (!user) {
      // Create new user
      user = new User({
        name: 'Test User',
        email: 'testuser@yoraa.com',
        phNo: '9999888877',
        password: hashedPassword,
        isVerified: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        authProvider: 'email'
      });
      await user.save();
      console.log('✅ User created successfully');
    } else {
      // Update existing user
      user.password = hashedPassword;
      user.isVerified = true;
      user.isPhoneVerified = true;
      user.isEmailVerified = true;
      await user.save();
      console.log('✅ User updated successfully');
    }
    
    console.log('\nUser details:');
    console.log('  Phone:', user.phNo);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Verified:', user.isVerified);
    console.log('  ID:', user._id);
    console.log('\nLogin credentials:');
    console.log('  phNo: 9999888877');
    console.log('  password: testpass123');
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
