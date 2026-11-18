// Creates demo accounts so you can log in as every role.  Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

const demo = [
  { name: 'Society Admin', email: 'admin@society.com', password: 'admin123', role: 'admin' },
  { name: 'Ravi Security', email: 'security@society.com', password: 'security123', role: 'security' },
  { name: 'Mohan Maintenance', email: 'maintenance@society.com', password: 'maintenance123', role: 'maintenance' },
  { name: 'Asha Resident', email: 'resident@society.com', password: 'resident123', role: 'resident', unit: 'A-101', phone: '9999999999' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-society');
  let admin;
  for (const d of demo) {
    let u = await User.findOne({ email: d.email });
    if (!u) {
      u = await User.create(d);
      console.log('Created', d.role, d.email, '/', d.password);
    }
    if (d.role === 'admin') admin = u;
  }
  if (!(await Announcement.countDocuments())) {
    await Announcement.create({ title: 'Welcome to Smart Society', message: 'Raise complaints, pay bills and track visitors from one place.', author: admin._id });
  }
  const Facility = require('./models/Facility');
  if (!(await Facility.countDocuments())) {
    await Facility.insertMany([
      { name: 'Badminton Court', icon: '🏸', description: 'Indoor wooden-floor court. Rackets at the desk.', openTime: '06:00', closeTime: '22:00' },
      { name: 'Basketball Court', icon: '🏀', description: 'Full-size outdoor court with floodlights.', openTime: '06:00', closeTime: '22:00' },
      { name: 'Pool Table', icon: '🎱', description: 'Pool table in the recreation room.', openTime: '10:00', closeTime: '22:00' },
      { name: 'Table Tennis', icon: '🏓', description: 'Two tables in the recreation room.', openTime: '08:00', closeTime: '22:00' },
      { name: 'Tennis Court', icon: '🎾', description: 'Hard court, bring your own racket.', openTime: '06:00', closeTime: '20:00' },
      { name: 'Club House', icon: '🏛', description: 'Hall for parties and gatherings. Up to 50 guests.', openTime: '09:00', closeTime: '23:00' },
    ]);
    console.log('Created 6 facilities');
  }
  console.log('Seed complete');
  await mongoose.disconnect();
})();
