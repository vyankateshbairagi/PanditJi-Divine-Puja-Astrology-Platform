<<<<<<< HEAD
# 🞉️ PanditJi - Sacred Services & Ceremonies Booking Platform

> A full-stack web application connecting devotees with expert Pandits (Hindu priests) for performing Pujas (religious ceremonies) and astrological services across India.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Key Components](#key-components)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**PanditJi** is a comprehensive platform that revolutionizes the way devotees book Pandits for spiritual ceremonies. The platform provides:

- **Seamless Pandit Booking**: Browse and book verified Pandits for various Pujas and ceremonies
- **Astrological Services**: Access to Horoscope readings, Kundali analysis, and Compatibility checks
- **Secure Payments**: Razorpay integration for safe and reliable payment processing
- **Real-time Notifications**: Socket.IO powered live updates for bookings and events
- **Admin Management**: Comprehensive admin panel for platform management
- **Pandit Portal**: Dedicated portal for Pandits to manage bookings and profiles

---

## ✨ Features

### For Devotees (Users)
- 🔐 **User Authentication**: Secure login/signup with JWT
- 📅 **Puja Booking**: Schedule and book Pandits for specific ceremonies and dates
- 🕯️ **Multiple Puja Types**: Regular Pujas, Festival Pujas, Hawans, Shantis
- 📍 **Location-Based Services**: Find Pandits in your area
- ⭐ **Reviews & Ratings**: Rate and review Pandits after services
- 💳 **Secure Payments**: Razorpay integration with refund management
- 🔔 **Real-time Notifications**: Socket.IO updates for booking status changes
- 📧 **Email Notifications**: Automated email reminders and confirmations
- 🎴 **Astrological Tools**:
  - Kundali (Birth Chart) Analysis
  - Horoscope Readings
  - Compatibility Checker
  - Marriage Yoga Calculations

### For Pandits
- 📝 **Profile Management**: Create and manage professional profiles
- 💼 **Booking Management**: Accept/decline/complete bookings
- 📊 **Dashboard**: View earnings, ratings, and booking history
- 🎓 **Expertise Showcase**: Highlight specializations and certifications
- 📞 **Direct Contact**: Manage communication with devotees

### For Administrators
- 👥 **User Management**: Monitor and manage all users (Pandits & Devotees)
- 🛡️ **Verification**: Verify Pandits for platform credibility
- 💰 **Payment Tracking**: Monitor transactions and financial reports
- 📋 **Booking Management**: Oversee all bookings and disputes
- 📊 **Analytics**: Platform statistics and performance metrics
- 🎁 **Promotional Management**: Manage discounts and offers

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v22.13.0)
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB 7.8.9 (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO 4.8.3
- **Payments**: Razorpay 2.9.6
- **File Upload**: Cloudinary + Multer
- **Validation**: express-validator
- **Security**: Helmet.js, bcryptjs, CORS
- **Rate Limiting**: express-rate-limit
- **Astronomy**: sweph (Swiss Ephemeris)
- **Email**: Nodemailer
- **Task Scheduling**: node-cache
- **Utilities**: dotenv, axios, path

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.1
- **State Management**: Context API (AuthContext, SocketContext)
- **HTTP Client**: Axios 1.13.2
- **UI/Icons**: FontAwesome 7.2.0, Lucide React
- **Animations**: Framer Motion 12.38.0
- **Styling**: CSS3 (custom theme with spiritual colors)
- **Notifications**: React Toastify 11.1.0
- **Real-time**: Socket.IO Client 4.8.3
- **Payments**: Razorpay Checkout
- **Linting**: ESLint 9.36.0

---

## 📁 Project Structure

```
Poojapath/
├── Pujanam-Backend-master/
│   ├── config/
│   │   └── database.js                 # MongoDB connection config
│   ├── controllers/
│   │   ├── adminController.js          # Admin operations
│   │   ├── bookingController.js        # Booking management
│   │   ├── panditController.js         # Pandit operations
│   │   ├── paymentController.js        # Razorpay integration
│   │   └── serviceController.js        # Service management
│   ├── middleware/
│   │   ├── auth.js                     # JWT authentication
│   │   ├── validation.js               # Input validation
│   │   ├── cloudinaryUpload.js         # File upload config
│   │   ├── errorHandler.js             # Error handling
│   │   └── logger.js                   # Request logging
│   ├── models/
│   │   ├── User.js                     # User schema
│   │   ├── Pandit.js                   # Pandit schema
│   │   ├── Booking.js                  # Booking schema
│   │   ├── Service.js                  # Service schema
│   │   ├── Review.js                   # Review schema
│   │   ├── AstroConsultation.js        # Astro service schema
│   │   ├── BirthChartResult.js         # Kundali results
│   │   ├── CompatibilityResult.js      # Compatibility results
│   │   └── [other models...]
│   ├── routes/
│   │   ├── admin.js                    # Admin routes
│   │   ├── bookings.js                 # Booking routes
│   │   ├── pandit.js                   # Pandit routes
│   │   ├── payment.js                  # Payment routes
│   │   ├── services.js                 # Service routes
│   │   ├── astroConsultation.js        # Astro routes
│   │   └── [other routes...]
│   ├── services/
│   │   └── swissEphService.js          # Ephemeris calculations
│   ├── utils/
│   │   ├── emailService.js             # Email notifications
│   │   ├── notificationService.js      # Push notifications
│   │   ├── astronomy.js                # Astronomy calculations
│   │   ├── marriageYoga.js             # Marriage yoga analysis
│   │   └── seedData.js                 # Database seeding
│   ├── uploads/                        # User uploads directory
│   ├── ephe/                           # Ephemeris data files
│   ├── .env.example                    # Environment variables template
│   ├── server.js                       # Main server file
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx          # Navigation with spiritual theme
│   │   │   │   ├── Footer.jsx          # Footer component
│   │   │   │   ├── BookingForm.jsx     # Booking form
│   │   │   │   └── RazorpayPayment.jsx # Payment integration
│   │   │   ├── admin/
│   │   │   │   ├── AdminPanel.jsx      # Admin dashboard
│   │   │   │   └── AdminLogin.jsx      # Admin login
│   │   │   ├── astro/
│   │   │   │   ├── KundaliTool.jsx     # Birth chart analysis
│   │   │   │   ├── HoroscopeTool.jsx   # Horoscope readings
│   │   │   │   ├── CompatibilityTool.jsx # Compatibility checker
│   │   │   │   └── [result components...]
│   │   │   ├── pandit/
│   │   │   │   ├── PanditLogin.jsx     # Pandit authentication
│   │   │   │   └── PanditPortal.jsx    # Pandit dashboard
│   │   │   ├── user/
│   │   │   │   ├── UserLogin.jsx       # User authentication
│   │   │   │   ├── UserDashboard.jsx   # User profile & bookings
│   │   │   │   └── [auth components...]
│   │   │   └── auth/
│   │   │       └── ProtectedRoute.jsx  # Route protection
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing page
│   │   │   ├── Services.jsx            # Services listing
│   │   │   ├── AstroServices.jsx       # Astrological services
│   │   │   ├── JoinPandit.jsx          # Pandit registration
│   │   │   ├── About.jsx               # About page
│   │   │   ├── Contact.jsx             # Contact page
│   │   │   ├── PrivacyPolicy.jsx       # Privacy policy
│   │   │   └── [other pages...]
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Authentication state
│   │   │   └── SocketContext.jsx       # Real-time updates
│   │   ├── api/
│   │   │   ├── apiClient.js            # Axios configuration
│   │   │   ├── userApi.js              # User API calls
│   │   │   ├── bookingApi.js           # Booking API calls
│   │   │   ├── panditApi.js            # Pandit API calls
│   │   │   └── [other API files...]
│   │   ├── styles/
│   │   │   ├── Header.css              # Header with spiritual theme
│   │   │   ├── Home.css
│   │   │   ├── Services.css
│   │   │   └── [component styles...]
│   │   ├── hooks/
│   │   │   └── useLoading.js           # Custom loading hook
│   │   ├── App.jsx                     # Main App component
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles
│   ├── public/
│   │   └── images/                     # Static images
│   ├── vite.config.js                  # Vite configuration
│   ├── eslint.config.js                # ESLint configuration
│   └── package.json
│
└── README.md                           # This file

```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v22.13.0 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager
- Razorpay account (for payments)
- Cloudinary account (for image uploads)

### Backend Setup

1. **Clone the repository**
```bash
cd Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** (copy from `.env.example`)
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Configuration](#configuration))

5. **Start the development server**
```bash
npm run dev
```

Server will run on `http://localhost:5000` (or 5001 if 5000 is busy)

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd Pujanam-Frontend-master
```

2. **Install dependencies**
```bash
npm install
```

├── Backend/
```bash
VITE_API_URL=http://localhost:5000
```

4. **Start the development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or next available port)

---

## ⚙️ Configuration

### Backend `.env` Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/panditji

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary Image Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# WhatsApp Integration (Optional)
WHATSAPP_PHONE_NUMBER=your_phone_number

# Admin Credentials
ADMIN_EMAIL=admin@panditji.com
ADMIN_PASSWORD=secure_password

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `config.js`

```javascript
// src/config.js
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd Pujanam-Backend-master
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Production Build

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

---

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/me                # Get current user
```

### Booking Endpoints
```
GET    /api/bookings               # Get all bookings
POST   /api/bookings               # Create new booking
GET    /api/bookings/:id           # Get booking details
PUT    /api/bookings/:id           # Update booking
DELETE /api/bookings/:id           # Cancel booking
POST   /api/bookings/:id/complete  # Mark booking complete
```

### Pandit Endpoints
```
GET    /api/pandits                # Get all pandits
GET    /api/pandits/:id            # Get pandit details
POST   /api/pandits/register       # Register as pandit
PUT    /api/pandits/profile        # Update pandit profile
GET    /api/pandits/:id/bookings   # Get pandit's bookings
```

### Service Endpoints
```
GET    /api/services               # Get all services
POST   /api/services               # Create new service (admin)
PUT    /api/services/:id           # Update service
DELETE /api/services/:id           # Delete service
```

### Payment Endpoints
```
POST   /api/payments/order         # Create Razorpay order
POST   /api/payments/verify        # Verify payment
POST   /api/payments/refund        # Process refund
GET    /api/payments/status/:id    # Check payment status
```

### Astrological Services Endpoints
```
POST   /api/astro/kundali          # Generate birth chart
POST   /api/astro/horoscope        # Generate horoscope
POST   /api/astro/compatibility    # Check compatibility
GET    /api/astro/results/:id      # Get saved results
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (user, pandit, admin),
  profileImage: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  bio: String,
  ratings: Number,
  reviewCount: Number,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  userId: ObjectId (ref: User),
  panditId: ObjectId (ref: Pandit),
  serviceId: ObjectId (ref: Service),
  pujaDate: Date,
  pujaTime: String,
  location: String,
  specialRequests: String,
  totalAmount: Number,
  paymentStatus: String (pending, completed, failed, refunded),
  bookingStatus: String (confirmed, completed, cancelled),
  bookedAt: Date,
  completedAt: Date,
  cancellationReason: String,
  rating: Number,
  review: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Service Model
```javascript
{
  name: String,
  description: String,
  category: String (regular, festival, hawan, shanti),
  duration: Number (in hours),
  basePrice: Number,
  image: String,
  requiredItems: [String],
  benefits: [String],
  availability: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  bookingId: ObjectId (ref: Booking),
  userId: ObjectId (ref: User),
  panditId: ObjectId (ref: Pandit),
  rating: Number (1-5),
  review: String,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Key Components

### Frontend Components

#### Header Component
- Modern spiritual theme with saffron, gold, and maroon colors
- Om (ॐ) symbol brand crest
- Responsive navigation with hamburger menu
- User authentication links
- Book Now CTA button

#### BookingForm Component
- Multi-step form for booking pujas
- Date and time selection
- Location-based pandit search
- Special requests field
- Real-time availability check

#### RazorpayPayment Component
- Secure payment integration
- Order creation and verification
- Refund handling
- Payment status tracking

#### Astrology Components
- **KundaliTool**: Birth chart generation with Swiss Ephemeris
- **HoroscopeTool**: Personalized horoscope readings
- **CompatibilityTool**: Marriage compatibility analysis
- Result saving and sharing

### Backend Services

#### EmailService
- Booking confirmations
- Payment receipts
- Refund notifications
- Reminder emails
- Account notifications

#### NotificationService
- Real-time Socket.IO updates
- Booking status changes
- Payment notifications
- Review notifications

#### AstronomyService
- Swiss Ephemeris calculations
- Birth chart generation
- Horoscope predictions
- Yoga (astrological combinations) analysis

---

## 🌈 Design & Theme

### Color Palette
- **Primary**: Saffron (#E85A16)
- **Secondary**: Gold (#D4AF37)
- **Accent**: Maroon (#7A2B2B)
- **Background**: Cream/Ivory (#FFF8EC, #FCF6E8)

### Typography
- **Headers**: Bold, high contrast
- **Body**: Clean, readable fonts
- **Icons**: FontAwesome, Lucide icons

### Responsive Design
- Mobile-first approach
- Desktop, tablet, and mobile breakpoints
- Touch-friendly interfaces
- Accessibility compliance

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs encryption
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Cross-origin request protection
- **Helmet.js**: HTTP header security
- **Input Validation**: express-validator
- **Protected Routes**: Authorization checks
- **Secure Payments**: Razorpay integration
- **Cloudinary Integration**: Secure file uploads

---

## 🚢 Deployment

### Backend Deployment (Heroku/Vercel/AWS)
```bash
npm run build
npm start
```

### Frontend Deployment (Netlify/Vercel)
```bash
npm run build
# Deploy the dist folder
```

### Environment Variables
Ensure all `.env` variables are set in your hosting platform's environment configuration.

---

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support & Contact

For support, issues, or suggestions:
- Email: info@panditji.com
- Phone: +91 9373120370
- Address: Pune, India

---

## 🙏 Acknowledgments

- Built with passion for spiritual services
- Inspired by modern booking platforms
- Dedicated to preserving spiritual traditions
- Community-driven development

---

**Made with ❤️ for sacred services**

🞉️ **PanditJi** - Connecting Devotees with Divine Services
=======
# PanditJi-Divine-Puja-Astrology-Platform
A sacred online platform where people can book pujas, connect with pandits, and access astrology services like kundali, horoscope, and spiritual guidance.
>>>>>>> a0670d1807c82327b154aefe129761f7e6936b44
