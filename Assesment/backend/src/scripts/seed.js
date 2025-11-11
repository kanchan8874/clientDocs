import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Document from '../models/Document.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Document.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create test users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123'
    });

    console.log('✅ Created test users');

    // Create test clients for user1
    const client1 = await Client.create({
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      address: '123 Business St, City',
      createdBy: user1._id
    });

    const client2 = await Client.create({
      name: 'Tech Solutions Inc',
      email: 'info@techsolutions.com',
      phone: '+9876543210',
      company: 'Tech Solutions',
      address: '456 Tech Ave, City',
      createdBy: user1._id
    });

    console.log('✅ Created test clients');

    // Note: Documents require actual file uploads, so we'll skip seeding documents
    // Users can create documents through the API

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('User 1:');
    console.log('  Email: john@example.com');
    console.log('  Password: password123');
    console.log('\nUser 2:');
    console.log('  Email: jane@example.com');
    console.log('  Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
