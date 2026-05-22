const mongoose = require('mongoose');
const Pandit = require('../models/Pandit');
const Service = require('../models/Service');
require('dotenv').config();

const seedPandits = [
  {
    name: "Soham Utpat",
    location: "Pune",
    services: ["Vaastu Shanti", "Pooja", "Ganesh Puja", "Satya Narayan Puja"],
    contact: "8767119282",
    email: "soham.utpat.sit.comp@gmail.com",
    username: "sohamutpat", // ✅ Add this
    password: "pandit123",  // ✅ Add this - will be hashed automatically
    rating: 4.2,
    experience: 5,
    languages: ["Hindi", "Marathi", "English"],
    image: "/images/icon.png",
    isAvailable: true,
    isOnline: true // ✅ Add this for notifications
  },
  {
    name: "Atharv Kulkarni",
    location: "Pune", 
    services: ["Ganesh Puja", "Bhumi Pujan", "Griha Pravesh"],
    contact: "9876543210",
    email: "atharv@example.com",
    username: "atharvk", // ✅ Add this
    password: "pandit123", // ✅ Add this
    rating: 4.5,
    experience: 8,
    languages: ["Hindi", "Marathi"],
    image: "/images/icon.png",
    isAvailable: true,
    isOnline: true
  },
  // ... other pandits with username/password
];

const seedServices = [
  {
    name: "Satya Narayan Puja",
    description: "Performed for well-being, prosperity, and happiness, seeking blessings from Lord Satya Narayan.",
    purpose: "Purpose of Satya Narayan Puja",
    details: [
      "Remove Sufferings and Past Sins",
      "Purify the Mind and Soul (by upholding Truth)",
      "Bring Positive Energy and Fulfillment of Desires",
      "Seek Blessings of Wealth and Wellbeing (from Lord Vishnu)",
      "Ensure Harmony, Peace, and Prosperity"
    ],
    image: "/images/Satyanarayan.jpg",
    price: "₹1099/-",
    category: "regular",
    duration: "3-4 hours",
    isActive: true
  },
  {
    name: "Ganesh Puja",
    description: "Performed to remove obstacles and bring success, wisdom, and prosperity.",
    purpose: "Purpose of Ganesh Puja",
    details: [
      "Remove Obstacles (Vighnaharta) for smooth beginnings",
      "Purify the Soul, Mind, and surrounding Environment",
      "Bring Positive Energy and an Auspicious start to ventures",
      "Seek Blessings for Wisdom, Intellect, and Knowledge",
      "Ensure Harmony, Peace, and overall Family Prosperity"
    ],
    image: "/images/GaneshPuja.jpeg",
    price: "₹1499/-",
    category: "regular",
    duration: "2-3 hours",
    isActive: true
  },
  {
    name: "Wedding Puja",
    description: "Performed to bless the couple with a happy, prosperous, and harmonious married life.",
    purpose: "Purpose of Wedding Ceremony",
    details: [
      "Mark the beginning of the Grihastha Ashram (Householder Stage)",
      "Purify the couple to jointly pursue the four aims of life (Purusharthas)",
      "Bring a Spiritual and Karmic Union between two souls for seven lifetimes",
      "Seek Blessings from Ganesha and Agni (Fire God) for prosperity and fidelity",
      "Ensure Progeny, Family Harmony, and the fulfillment of worldly desires (Kama)"
    ],
    image: "/images/WeddingPuja.png",
    price: "₹7999/-",
    category: "regular",
    duration: "Full day",
    isActive: true
  }
  // ... other services
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/panditji');
    
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Pandit.deleteMany({});
    await Service.deleteMany({});
    
    // Insert new data
    await Pandit.insertMany(seedPandits);
    await Service.insertMany(seedServices);
    
    console.log('Database seeded successfully!');
    console.log(`Created ${seedPandits.length} pandits`);
    console.log(`Created ${seedServices.length} services`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();