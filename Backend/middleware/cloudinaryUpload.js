// backend/middleware/cloudinaryUpload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
};

const buildLocalStorage = () => multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/others/';

    if (file.fieldname === 'panditImage') {
      uploadPath = 'uploads/pandits/';
    } else if (file.fieldname === 'serviceImage') {
      uploadPath = 'uploads/services/';
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'serviceImage' ? 'service' : 'pandit';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

let storage;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      let folder = 'panditji/uploads';
      if (file.fieldname === 'serviceImage') {
        folder = 'panditji/services';
      } else if (file.fieldname === 'panditImage') {
        folder = 'panditji/pandits';
      }

      return {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
        public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`
      };
    }
  });
} else {
  storage = buildLocalStorage();
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});

module.exports = upload;
