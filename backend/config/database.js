const mongoose = require('mongoose');

let memServerInstance = null;

async function autoSeedTopicsIfEmpty() {
  try {
    const Topic = require('../models/Topic');
    const count = await Topic.countDocuments();
    if (count === 0) {
      console.log('🌱 No discussion topics found — seeding default ThinkSpace practice topics...');
      const defaultTopics = [
        // Technology
        { title: 'AI and automation will reshape the future of creative work', category: 'technology', difficulty: 'hard' },
        { title: 'Social media algorithms prioritize engagement over factual accuracy', category: 'technology', difficulty: 'medium' },
        { title: 'Governments should regulate generative AI and deepfake technology strictly', category: 'technology', difficulty: 'hard' },
        { title: 'Smartphones have fundamentally changed deep interpersonal communication', category: 'technology', difficulty: 'easy' },
        { title: 'Open-source software promotes stronger security than closed proprietary models', category: 'technology', difficulty: 'medium' },
        { title: 'Autonomous vehicles will make urban transportation safer and more efficient', category: 'technology', difficulty: 'medium' },

        // Society
        { title: 'Critical thinking instruction should be mandatory in primary education', category: 'society', difficulty: 'easy' },
        { title: 'Universal basic income can effectively cushion technological displacement', category: 'society', difficulty: 'hard' },
        { title: 'Remote work enhances productivity and life balance without compromising culture', category: 'society', difficulty: 'medium' },
        { title: 'Public surveillance in urban centers strikes a fair balance with civil liberties', category: 'society', difficulty: 'medium' },
        { title: 'Standardized testing is an outdated metric for evaluating intellectual ability', category: 'society', difficulty: 'easy' },

        // Politics & Governance
        { title: 'Electoral systems should incorporate term limits for legislative representatives', category: 'politics', difficulty: 'medium' },
        { title: 'Digital voting systems can be designed with sufficient cryptographic security', category: 'politics', difficulty: 'hard' },
        { title: 'Civic literacy tests should be introduced prior to casting election ballots', category: 'politics', difficulty: 'hard' },

        // Education
        { title: 'Online learning platforms can fully replace traditional university lectures', category: 'education', difficulty: 'medium' },
        { title: 'Continuous skill re-learning is more valuable than a specialized college degree', category: 'education', difficulty: 'medium' },
        { title: 'AI writing tools should be embraced rather than banned in academic curriculum', category: 'education', difficulty: 'easy' },

        // Environment
        { title: 'Nuclear energy is essential for achieving net-zero carbon emissions', category: 'environment', difficulty: 'hard' },
        { title: 'Individual consumer choices have negligible impact compared to industrial regulation', category: 'environment', difficulty: 'medium' },
        { title: 'Carbon taxation is the most economically efficient climate mitigation strategy', category: 'environment', difficulty: 'hard' },

        // Economy
        { title: 'Gig economy platforms exploit labor flexibility at the cost of social protections', category: 'economy', difficulty: 'medium' },
        { title: 'Decentralized finance will significantly reduce global banking remittance fees', category: 'economy', difficulty: 'medium' },
        { title: 'Automation taxes should be levied on companies replacing human labor with robotics', category: 'economy', difficulty: 'hard' },
      ];

      await Topic.insertMany(defaultTopics);
      console.log(`✅ Successfully seeded ${defaultTopics.length} default ThinkSpace topics`);
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed topics check failed:', err.message);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thinkspace';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected:', conn.connection.host);
    await autoSeedTopicsIfEmpty();
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB at ${uri} (${error.message}).`);

    // In development or test, fall back to MongoMemoryServer so the app runs smoothly
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🚀 Initializing in-memory MongoDB server for ThinkSpace development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memServerInstance = await MongoMemoryServer.create();
        const memUri = memServerInstance.getUri();
        await mongoose.connect(memUri);
        console.log('✅ In-memory MongoDB connected successfully at:', memUri);
        await autoSeedTopicsIfEmpty();
        return;
      } catch (memErr) {
        console.error('❌ Failed to initialize in-memory MongoDB server:', memErr.message);
      }
    }

    console.error('Fatal MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
