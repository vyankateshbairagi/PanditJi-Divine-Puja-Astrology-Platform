# PanditJi — Sacred Services & Astrological Platform

PanditJi is a full-stack web application to connect devotees with verified Pandits for pujas, rituals, and astrological services (kundali, horoscope, compatibility).

---

## Table of Contents

- Overview
- Quick Start
- Requirements
- Backend Setup
- Frontend Setup
- Configuration
- Repository Structure
- API Summary
- Contributing
- License
- Contact
- Changelog

---

## Overview

PanditJi helps users discover and book Pandits, request astrological consultations, and manage bookings with secure payments and real-time notifications.

## Quick Start

1. Install backend dependencies and start server:

```bash
cd Backend
npm install
npm run dev
```

2. Install frontend dependencies and start dev server:

```bash
cd Frontend
npm install
npm run dev
```

Open the frontend at http://localhost:5173 and backend at http://localhost:5000.

## Requirements

- Node.js 18+ (recommended)
- MongoDB (local or Atlas)
- npm or yarn

---

## Backend Setup

- Copy `.env.example` to `.env` and fill required variables (MongoDB URI, JWT secret, Razorpay keys, Cloudinary, email credentials).
- Run `npm install` and `npm run dev` in the `Backend` folder.

## Frontend Setup

- Set `VITE_API_URL` in the frontend environment (e.g., `.env` or local dev settings) to point at the backend, default: `http://localhost:5000`.
- Run `npm install` and `npm run dev` in the `Frontend` folder.

---

## Configuration (important env vars)

- `PORT` — backend port (default 5000)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JSON Web Token secret
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — payments
- `CLOUDINARY_*` — image uploads

Refer to `.env.example` in the `Backend` folder for the full list.

---

## Repository Structure

```
PanditJi/
├─ Backend/           # Express API, models, controllers, routes
├─ Frontend/          # React (Vite) app
└─ README.md
```

---

## API Summary

Common endpoints (backend base: `/api`):

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/services`, `POST /api/services` (admin)
- `GET /api/pandits`, `POST /api/pandits/register`
- `GET /api/bookings`, `POST /api/bookings`
- `POST /api/payments/order`, `POST /api/payments/verify`

See backend route files in `Backend/routes` for full details.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit and open a pull request

Please follow existing code style and run lint/tests before submitting.

---

## License

MIT — see LICENSE file.

---

## Contact

- Email: info@panditji.com

---

## Changelog

- 2026-05-22 — Replaced README with a cleaned, canonical version.

If you want additional sections (detailed architecture, deployment scripts, or CI), tell me what to include and I will expand the README accordingly.
