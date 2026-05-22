# 🚀 Complete Installation & Setup Guide

> Step-by-step guide to set up and run the PanditJi project locally.

---

## 📋 Prerequisites

Before starting, ensure you have:

### Required Software
- **Node.js** (v22.13.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **MongoDB** (Local or Cloud - MongoDB Atlas)

### Required Accounts
- **MongoDB Atlas** (Cloud Database) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Razorpay** (Payment Gateway) - [Sign up](https://razorpay.com/)
- **Cloudinary** (Image Storage) - [Sign up](https://cloudinary.com/)
- **Gmail** (Email Service) - [Enable App Password](https://support.google.com/accounts/answer/185833)

### Recommended Tools
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Postman** - [Download](https://www.postman.com/downloads/)
- **MongoDB Compass** - [Download](https://www.mongodb.com/products/compass)

---

## 🛠️ Step 1: System Setup

### 1.1 Check Node.js Installation
```bash
node --version
npm --version
```

Should output:
```
v22.13.0 (or higher)
9.x.x (or higher)
```

### 1.2 Create Project Directory
```bash
mkdir Poojapath
cd Poojapath
```

### 1.3 Clone Repository (if applicable)
```bash
git clone <repository-url>
cd Poojapath
```

---

## 🗄️ Step 2: MongoDB Setup

### Option A: MongoDB Atlas (Recommended for Cloud)

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a Project** and **Create a Cluster**
3. **Add Database User**:
   - Username: `panditji_user`
   - Password: Generate strong password
   - Save credentials
4. **Whitelist IP Address**:
   - Security → Network Access
   - Add IP Address (or 0.0.0.0 for development)
5. **Get Connection String**:
   - Clusters → Connect
   - Select "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

Example:
```
mongodb+srv://panditji_user:PASSWORD@cluster.mongodb.net/panditji?retryWrites=true&w=majority
```

### Option B: Local MongoDB

1. **Install MongoDB Community** - [Download](https://www.mongodb.com/try/download/community)
2. **Start MongoDB Service**:
   - Windows: `mongod`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
3. **Default Connection**:
   ```
   mongodb://localhost:27017/panditji
   ```

### 1.3 Verify Connection with MongoDB Compass
1. Open MongoDB Compass
2. Paste connection string
3. Click "Connect"
4. Verify you can connect

---

## 💳 Step 3: Razorpay Setup

1. **Sign up** at [Razorpay](https://razorpay.com/)
2. **Enable Test Mode** (for development)
3. **Get API Keys**:
   - Dashboard → Settings → API Keys
   - Copy **Key ID** and **Key Secret**
   - Keep secure!

Example:
```
Key ID: rzp_test_1234567890
Key Secret: abcd1234efgh5678
```

---

## 📸 Step 4: Cloudinary Setup

1. **Sign up** at [Cloudinary](https://cloudinary.com/)
2. **Get Cloud Credentials**:
   - Dashboard → Copy Cloud Name, API Key, API Secret
3. **Configure Upload Settings**:
   - Settings → Upload → Add upload preset (if needed)

Example:
```
Cloud Name: mycloud
API Key: 123456789
API Secret: abcdefghijklmnop
```

---

## 📧 Step 5: Gmail App Password

1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Select Mail and Windows Computer
5. Generate password
6. Copy the 16-character password (no spaces)

Example:
```
abcd efgh ijkl mnop → abcdefghijklmnop
```

---

## 🔧 Step 6: Backend Setup

### 6.1 Navigate to Backend Directory
```bash
cd PanditJi-Backend-master
```

### 6.2 Install Dependencies
```bash
npm install
```

Wait for installation to complete (~2-3 minutes)

### 6.3 Create `.env` File
```bash
# Windows (PowerShell)
New-Item -Path ".env" -Force

# macOS/Linux
touch .env
```

### 6.4 Configure Environment Variables

Open `.env` in your text editor and add:

```env
# ========== Server Configuration ==========
PORT=5000
NODE_ENV=development

# ========== Database Configuration ==========
# MongoDB Atlas:
MONGODB_URI=mongodb+srv://panditji_user:PASSWORD@cluster.mongodb.net/panditji?retryWrites=true&w=majority

# Or Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/panditji

# ========== JWT Configuration ==========
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters

# ========== Razorpay Configuration ==========
RAZORPAY_KEY_ID=rzp_test_1234567890
RAZORPAY_KEY_SECRET=abcd1234efgh5678

# ========== Cloudinary Configuration ==========
CLOUDINARY_CLOUD_NAME=mycloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefghijklmnop

# ========== Email Configuration (Nodemailer) ==========
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=abcdefghijklmnop

# ========== Admin Configuration ==========
ADMIN_EMAIL=admin@panditji.com
ADMIN_PASSWORD=secure_admin_password_123

# ========== CORS Configuration ==========
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:5001

# ========== Optional: WhatsApp ==========
# WHATSAPP_PHONE_NUMBER=your_phone_number
```

⚠️ **Important**: Never commit `.env` to version control!

### 6.5 Test Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
✅ Connected to MongoDB Atlas
```

**If Error Occurs**:
- Check MongoDB connection: Verify MONGODB_URI is correct
- Check Port: Is port 5000 already in use?
- Check Environment Variables: All required fields filled?

### 6.6 Seed Database (Optional)

In a new terminal:
```bash
npm run seed
```

This creates sample data for testing.

### 6.7 Verify Backend

Open Postman or browser:
```
GET http://localhost:5000/api/services
```

Should return list of services (if seeded)

---

## 🎨 Step 7: Frontend Setup

### 7.1 Navigate to Frontend Directory

In a **new terminal**:
```bash
cd PanditJi-Frontend-master
```

### 7.2 Install Dependencies
```bash
npm install
```

Wait for installation (~2-3 minutes)

### 7.3 Create `.env` File (Optional)

```bash
# Windows
New-Item -Path ".env.local" -Force

# macOS/Linux
touch .env.local
```

### 7.4 Configure Environment Variables

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

### 7.5 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v7.3.0 ready in 702 ms
Local:   http://localhost:5173/
```

**If Port 5173 is Busy**:
Vite will automatically try 5174, 5175, etc.

---

## 🎯 Step 8: Verify Everything Works

### 8.1 Open Browser
Visit: `http://localhost:5173/`

You should see the PanditJi home page with:
- Header with Om symbol and navigation
- Hero section
- Services cards
- Footer

### 8.2 Test Backend API

```bash
# In new terminal, test API
curl http://localhost:5000/api/services

# Or use Postman
GET http://localhost:5000/api/services
```

### 8.3 Test Frontend-Backend Communication

1. Go to `http://localhost:5173/services`
2. Check browser console (F12)
3. Should show services loaded from backend
4. No CORS errors should appear

### 8.4 Test Database Connection

In MongoDB Compass:
1. Connect to your MongoDB
2. Database: `panditji`
3. Collections: services, users, etc. should appear

---

## 🧪 Step 9: Testing Features

### 9.1 User Registration & Login

1. Go to login page
2. Click "Register"
3. Fill form and submit
4. Check email for verification (if configured)
5. Login with credentials

### 9.2 Test Payment Integration

1. Login as user
2. Go to Services
3. Click "Book Now"
4. Fill booking form
5. Click "Pay Now"
6. Use Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
7. Payment should succeed

### 9.3 Test Astrological Tools

1. Go to "Astro Services"
2. Try Kundali, Horoscope, Compatibility tools
3. Fill details and generate
4. Verify results display correctly

### 9.4 Test Real-time Updates

1. Open two browser windows
2. Login in both with different users
3. Create booking in one window
4. Verify notification appears in other window

---

## 📁 Project Structure After Setup

```
Poojapath/
├── Backend/
│   ├── .env                    # Your configuration
│   ├── node_modules/
│   ├── server.js
│   ├── package.json
│   └── ... (other files)
│
├── Frontend/
│   ├── .env.local              # Your configuration
│   ├── node_modules/
│   ├── vite.config.js
│   ├── package.json
│   └── ... (other files)
│
└── README.md                   # This guide

```

---

## 🐛 Troubleshooting

### Backend Issues

#### Error: "Port 5000 already in use"
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env to 5001
PORT=5001
```

#### Error: "Cannot find module"
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Error: "MONGODB_URI is not defined"
```bash
# Check .env file exists in backend directory
# Verify all variables are set
# Copy from .env.example if needed
```

#### Error: "CORS error" in frontend
```
# Check CORS_ORIGINS in .env includes localhost:5173
# Restart backend server
# Clear browser cache
```

### Frontend Issues

#### Error: "Cannot GET /"
```bash
# Kill frontend dev server
# Clear node_modules
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

#### Error: "Module not found"
```bash
# Install missing dependency
npm install [package-name]

# Or reinstall all
npm install
```

#### Error: "Blank page or not loading"
```bash
# Check browser console (F12)
# Verify backend is running
# Check VITE_API_URL in .env.local
# Clear cache: Ctrl+Shift+Delete
```

### Database Issues

#### Error: "Authentication failed for MongoDB"
```
Check MongoDB username and password
Ensure IP is whitelisted in Atlas
Try connecting with MongoDB Compass
```

#### Error: "Cannot connect to localhost:27017"
```
Check MongoDB service is running
Windows: mongod
macOS: brew services list | grep mongodb
Linux: sudo systemctl status mongod
```

---

## 🔒 Security Notes

### Do's ✅
- Keep `.env` files private
- Use strong JWT_SECRET
- Use HTTPS in production
- Rotate passwords regularly
- Enable 2FA on accounts

### Don'ts ❌
- Don't commit `.env` to Git
- Don't share API keys publicly
- Don't use weak passwords
- Don't expose sensitive logs
- Don't use test keys in production

---

## 📚 Next Steps

1. **Explore Code**: Review project structure
2. **Read Documentation**: Check README files
3. **Test Features**: Try all platform features
4. **Customize**: Modify colors, text, settings
5. **Deploy**: Set up production environment

---

## 🆘 Getting Help

### Resources
- Check project README.md
- Review API documentation
- Check browser console for errors
- Check server logs

### Contact
- Email: info@pujanam.com
- Phone: +91 9373120370

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB configured
- [ ] Razorpay account created
- [ ] Cloudinary account created
- [ ] Gmail app password generated
- [ ] Backend .env configured
- [ ] Frontend .env.local configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Both can communicate (no CORS errors)
- [ ] Sample data seeded (optional)
- [ ] Tested user registration
- [ ] Tested payment flow
- [ ] Tested astrological tools
- [ ] Ready to develop!

---

**You're all set! Happy coding! 🚀**
