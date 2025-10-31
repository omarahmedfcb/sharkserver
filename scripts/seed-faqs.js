// Script to seed FAQ database with initial Q&A pairs
require("dotenv").config();
const mongoose = require("mongoose");
const FAQ = require("../models/faq");
const seedFAQs = require("../data/seed-faqs");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      `${process.env.MONGO_URL}/${process.env.DB_NAME}`
    );
    console.log("Connected to MongoDB");

    // Clear existing FAQs (optional - comment out if you want to keep existing data)
    // await FAQ.deleteMany({});
    // console.log("Cleared existing FAQs");

    // Check if FAQs already exist
    const existingFAQs = await FAQ.countDocuments();
    if (existingFAQs > 0) {
      console.log(
        `Found ${existingFAQs} existing FAQs. Clearing and re-seeding...`
      );
      // Clear existing FAQs to ensure we have the latest questions
      await FAQ.deleteMany({});
      console.log("Cleared existing FAQs");
    }

    // Insert seed FAQs
    const insertedFAQs = await FAQ.insertMany(seedFAQs);
    console.log(`Successfully seeded ${insertedFAQs.length} FAQs`);

    await mongoose.disconnect();
    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();

