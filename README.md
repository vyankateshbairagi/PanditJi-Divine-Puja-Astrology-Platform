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

## Deployment

This project is set up for a split deployment:

- Backend on Render from `Backend/`
- Frontend on Vercel from `Frontend/`

Use `render.yaml` at the repository root for the backend service and `Frontend/vercel.json` for SPA routing.

## Requirements

- Node.js 18+ (recommended)
- MongoDB (local or Atlas)
- npm or yarn

---

## Backend Setup

- Copy `Backend/.env.example` to `Backend/.env` and fill required variables.
- Set `FRONTEND_URL` to your Vercel app URL and `CORS_ORIGINS` to every frontend origin you want the API to accept.
- Run `npm install` and `npm run dev` in the `Backend` folder.

## Frontend Setup

- Copy `Frontend/.env.example` to `Frontend/.env` for local development.
- Set `VITE_API_BASE_URL` to your Render backend URL, ending in `/api`, for example `https://panditji-divine-puja-astrology-platform.onrender.com/api`.
- Run `npm install` and `npm run dev` in the `Frontend` folder.

---

## Configuration (important env vars)

- `PORT` — backend port (default 5000)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JSON Web Token secret
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — payments
- `CLOUDINARY_*` — image uploads
- `FRONTEND_URL` — allowed frontend origin used by backend CORS and email links
- `CORS_ORIGINS` — comma-separated list of allowed browser origins
- `VITE_API_BASE_URL` — frontend API base URL, usually your Render backend `/api` endpoint

Refer to `Backend/.env.example` and `Frontend/.env.example` for the full list.

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

- 2026-05-22 — Added Render + Vercel deployment config and environment examples.

If you want additional sections (detailed architecture, deployment scripts, or CI), tell me what to include and I will expand the README accordingly.
