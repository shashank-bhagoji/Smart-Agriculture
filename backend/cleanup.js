require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const Service = require('./models/Service');
      const User = require('./models/User');
      
      const sResult = await Service.deleteMany({ price: 500 });
      console.log('Deleted duplicate services:', sResult.deletedCount);
      
      // Let's also delete based on email if we can
      const uResult = await User.deleteMany({ email: 'rajesh@gmail.com' });
      console.log('Deleted duplicate user:', uResult.deletedCount);
      
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
