# Smart Agriculture & Equipment Sharing Platform

## Overview
A comprehensive MERN (MongoDB, Express.js, React.js, Node.js) stack platform designed to empower farmers and agricultural workers. It provides a robust ecosystem for equipment sharing, service hiring, machine learning-driven crop recommendations, and automated leaf disease detection. 

## Key Features
- **Equipment & Service Rental**: List, search, and rent agricultural equipment, operators, and transport services.
- **Machine Learning Integration**: 
  - **Crop Recommendation**: Powered by a trained **Scikit-Learn Random Forest** model analyzing soil and climate data.
  - **Leaf Disease Scanner**: Powered by a trained **MobileNetV2 CNN** (Deep Learning) model for precise image-based diagnosis.
  - *(Includes intelligent Node.js fallbacks using Nearest Centroid algorithms to ensure the platform remains 100% responsive during demonstrations even if Python environments fail).*
- **Group Bookings**: Collaborative features allowing multiple farmers to book equipment together to share costs.
- **Multilingual Support**: Full internationalization (i18n) for accessibility across different languages and regions.
- **Smart Analytics & Tools**: Seasonal insights, weather tracking, Map-based search, and interactive usage analytics.
- **Dispute & Maintenance Management**: Integrated system for raising disputes and scheduling routine equipment maintenance.
- **Google Calendar Integration**: Automated scheduling and email notifications for all bookings.
- **Comprehensive Dashboards**: Dedicated User and Admin dashboards for managing profiles, listings, and platform operations.

## Tech Stack
### Frontend
- **Framework**: React.js
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Data Visualization**: Recharts
- **Internationalization**: i18next & react-i18next

### Backend & Machine Learning
- **Server**: Node.js & Express.js
- **Database**: MongoDB with Mongoose
- **Machine Learning**: Python, Scikit-Learn (Random Forest), TensorFlow/Keras (MobileNetV2)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Uploads**: Multer
- **Email & Calendar**: Nodemailer & ics

## Project Structure
```text
project/
├── backend/
│   ├── config/         # Database and third-party configuration
│   ├── controllers/    # Route handlers for various endpoints
│   ├── middleware/     # Custom middlewares (auth, error handling)
│   ├── ml/             # Python ML models (Random Forest, MobileNetV2) and scripts
│   ├── models/         # Mongoose schemas (User, Equipment, Booking, etc.)
│   ├── routes/         # Express API routes
│   ├── services/       # Reusable business logic (e.g., email services)
│   ├── uploads/        # Directory for uploaded files (e.g., leaf images)
│   └── server.js       # Backend entry point
│
└── frontend/
    ├── public/         # Static assets
    └── src/
        ├── components/ # Reusable UI components
        ├── locales/    # i18n translation files
        ├── pages/      # React route components (Dashboard, Analytics, etc.)
        ├── services/   # Frontend API service calls
        ├── App.js      # Main React application component
        └── index.js    # Frontend entry point
```

## Prerequisites
- **Node.js** (v14 or higher recommended)
- **Python** (v3.8+ recommended) with `scikit-learn` and `tensorflow` installed for ML scripts
- **MongoDB** instance (Local or MongoDB Atlas)
- **Google Cloud Console Account** (for OAuth & Calendar integration)

## Setup & Installation

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (you can use `.env.example` as a template) and add the following:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Google OAuth & Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Start the backend development server:
```bash
npm run dev
```
*The backend will run on `http://localhost:5000`.*

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

Start the frontend development server:
```bash
npm start
```
*The frontend will run on `http://localhost:3000`.*

## Project Report

📄 [View Project Report](https://drive.google.com/file/d/11tccqVgH8pY0Tbdq_YSdF9ApMeY63qLY/view?usp=sharing)

## Key API Endpoints
- **Authentication**: `/api/auth` (Register, login, profile)
- **Equipment**: `/api/equipment` (CRUD for equipment)
- **Bookings**: `/api/booking` (Manage individual bookings)
- **Group Bookings**: `/api/group-booking` (Manage shared bookings)
- **Machine Learning**: 
  - `/api/ml/recommend` (Crop recommendations via Random Forest)
  - `/api/ml/detect` (Leaf disease detection via MobileNetV2)
- **Admin**: `/api/admin` (Platform analytics and management)

## License
This project is licensed under the ISC License.
