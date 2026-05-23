const mongoose = require('mongoose');
const Pandit = require('../models/Pandit');
const Service = require('../models/Service');
require('dotenv').config();

const seedPandits = [
  {
  name: "Rajesh Sharma",
  location: "Varanasi",
  services: ["Rudrabhishek", "Maha Mrityunjaya Jaap", "Griha Pravesh"],
  contact: "9876500011",
  email: "rajesh.sharma@example.com",
  username: "rajeshpandit",
  password: "pandit123",
  rating: 4.8,
  experience: 12,
  languages: ["Hindi", "Sanskrit"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: true
},
{
  name: "Anil Mishra",
  location: "Prayagraj",
  services: ["Ganesh Puja", "Bhumi Pujan", "Vaastu Shanti"],
  contact: "9876500012",
  email: "anil.mishra@example.com",
  username: "anilmishra",
  password: "pandit123",
  rating: 4.6,
  experience: 10,
  languages: ["Hindi", "English"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: false
},
{
  name: "Deepak Joshi",
  location: "Ujjain",
  services: ["Satya Narayan Puja", "Navagraha Shanti", "Pitra Dosh Puja"],
  contact: "9876500013",
  email: "deepak.joshi@example.com",
  username: "deepakjoshi",
  password: "pandit123",
  rating: 4.9,
  experience: 15,
  languages: ["Hindi", "Marathi"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: true
},
{
  name: "Mahesh Pathak",
  location: "Nashik",
  services: ["Rudrabhishek", "Mahamrityunjaya Jaap"],
  contact: "9876500014",
  email: "mahesh.pathak@example.com",
  username: "maheshpathak",
  password: "pandit123",
  rating: 4.7,
  experience: 9,
  languages: ["Hindi", "Marathi"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: true
},
{
  name: "Vikram Tiwari",
  location: "Ayodhya",
  services: ["Ram Katha", "Hanuman Puja", "Sundarkand Path"],
  contact: "9876500015",
  email: "vikram.tiwari@example.com",
  username: "vikramtiwari",
  password: "pandit123",
  rating: 4.5,
  experience: 8,
  languages: ["Hindi"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: false
},
{
  name: "Ramesh Bhatt",
  location: "Haridwar",
  services: ["Ganga Puja", "Mundan Sanskar", "Pind Daan"],
  contact: "9876500016",
  email: "ramesh.bhatt@example.com",
  username: "rameshbhatt",
  password: "pandit123",
  rating: 4.8,
  experience: 14,
  languages: ["Hindi", "Sanskrit"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: true
},
{
  name: "Suresh Upadhyay",
  location: "Mumbai",
  services: ["Wedding Puja", "Griha Pravesh", "Satya Narayan Puja"],
  contact: "9876500017",
  email: "suresh.upadhyay@example.com",
  username: "sureshupadhyay",
  password: "pandit123",
  rating: 4.7,
  experience: 11,
  languages: ["Hindi", "Marathi", "English"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: true
},
{
  name: "Shubham Dixit",
  location: "Delhi",
  services: ["Kaal Sarp Dosh Puja", "Navagraha Shanti"],
  contact: "9876500018",
  email: "shubham.dixit@example.com",
  username: "shubhamdixit",
  password: "pandit123",
  rating: 4.6,
  experience: 7,
  languages: ["Hindi", "English"],
  image: "/images/pandit.png",
  isAvailable: true,
  isOnline: false
},
  // ... other pandits with username/password
];


// Sample services data

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
  },
  {
  name: "Griha Pravesh Puja",
  description: "Sacred housewarming ritual performed for positivity and blessings in a new home.",
  purpose: "Purpose of Griha Pravesh",
  details: [
    "Purify the new house spiritually",
    "Remove negative energy",
    "Invite positivity and peace",
    "Seek blessings for prosperity"
  ],
  image: "/images/GrihaPraveshPuja.jpg",
  price: "₹2999/-",
  category: "housewarming",
  duration: "3-5 hours",
  isActive: true
},
{
  name: "Bhumi Pujan",
  description: "Performed before construction to seek blessings for land and future prosperity.",
  purpose: "Purpose of Bhumi Pujan",
  details: [
    "Seek blessings before construction",
    "Remove Vaastu defects",
    "Ensure prosperity and success"
  ],
  image: "/images/BhumiPujan.jpg",
  price: "₹2499/-",
  category: "regular",
  duration: "2-3 hours",
  isActive: true
},
{
  name: "Rudrabhishek",
  description: "Special worship of Lord Shiva for peace, prosperity and removal of negativity.",
  purpose: "Purpose of Rudrabhishek",
  details: [
    "Gain divine blessings of Shiva",
    "Remove negativity",
    "Improve spiritual wellbeing"
  ],
  image: "/images/Rudrabhishek.jpg",
  price: "₹3499/-",
  category: "shiv",
  duration: "4 hours",
  isActive: true
},
{
  name: "Maha Mrityunjaya Jaap",
  description: "Powerful puja for health, protection and longevity.",
  purpose: "Purpose of Maha Mrityunjaya Jaap",
  details: [
    "Improve health",
    "Protection from negativity",
    "Peace and spiritual strength"
  ],
  image: "/images/MahaMrityunjayaJaap.jpg",
  price: "₹4999/-",
  category: "health",
  duration: "5 hours",
  isActive: true
},
{
  name: "Navagraha Shanti",
  description: "Performed to reduce negative planetary effects and improve life harmony.",
  purpose: "Purpose of Navagraha Shanti",
  details: [
    "Reduce planetary doshas",
    "Improve career and health",
    "Bring peace and balance"
  ],
  image: "/images/NavagrahaShanti.jpg",
  price: "₹3999/-",
  category: "astrology",
  duration: "3-4 hours",
  isActive: true
},
{
  name: "Mundan Sanskar",
  description: "Traditional first hair removal ritual for blessings and healthy growth.",
  purpose: "Purpose of Mundan Sanskar",
  details: [
    "Traditional purification ritual",
    "Bless child for healthy growth",
    "Remove past karmic energies"
  ],
  image: "/images/MundanSanskar.jpg",
  price: "₹2599/-",
  category: "sanskar",
  duration: "2 hours",
  isActive: true
},
{
  name: "Kaal Sarp Dosh Puja",
  description: "Special puja to reduce negative effects of Kaal Sarp Dosh.",
  purpose: "Purpose of Kaal Sarp Dosh Puja",
  details: [
    "Reduce dosha effects",
    "Bring peace and stability",
    "Improve career and finances"
  ],
  image: "/images/KaalSarpDoshPuja.jpg",
  price: "₹5499/-",
  category: "astrology",
  duration: "4 hours",
  isActive: true
},
{
  name: "Lakshmi Puja",
  description: "Performed to seek wealth, prosperity and success from Goddess Lakshmi.",
  purpose: "Purpose of Lakshmi Puja",
  details: [
    "Gain prosperity",
    "Attract financial success",
    "Peace and positivity"
  ],
  image: "/images/LakshmiPuja.jpg",
  price: "₹1999/-",
  category: "festival",
  duration: "2 hours",
  isActive: true
}
  // ... other services
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vyankateshbairagidev_db_user:Vyankatesh14@cluster0.ujjr0cx.mongodb.net/panditji?retryWrites=true&w=majority&appName=Cluster0&family=4');
    
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