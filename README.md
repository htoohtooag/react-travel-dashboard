# 🌍 AI Travel Trip Planner

An AI-powered travel planning platform that enables administrators to create country-based travel itineraries using AI while allowing users to explore detailed travel experiences through a modern web application.

---

## 🚀 Overview

AI Travel Trip Planner is a full-stack travel application that combines AI-generated travel content with an intuitive admin dashboard.

The platform consists of:

* **User Application** – Users can browse trips and view detailed travel itineraries.
* **Admin Dashboard** – Administrators can create new trips by providing destination information. AI automatically generates complete travel plans and retrieves destination images.

The application leverages modern cloud services and APIs to provide a scalable and efficient travel planning experience.

--- 

## Demo Link - https://react-travel-dashboard.vercel.app

## ✨ Features

### 👤 User Features

* Browse travel trips
* View detailed trip itineraries
* Explore destinations across multiple countries
* Responsive user experience
* Destination image galleries

### 🛠️ Admin Features

* Secure admin dashboard
* Create new trips
* AI-generated travel itineraries
* Automatic destination image retrieval
* Interactive map visualization
* Country-based trip creation workflow

> Note: The admin dashboard currently supports **trip creation only** (Create operation). Trip update and deletion features are not implemented.

### 🤖 AI Features

* AI-generated travel plans
* Destination recommendations
* Structured itinerary generation
* Dynamic travel content creation

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* Syncfusion UI Components

### Backend & Database

* Appwrite

  * Authentication
  * Database
  * Backend Services

### AI

* Google Gemini AI

### Image Services

* Unsplash API

### Payments

* Stripe

### Monitoring

* Sentry

---

## 🏗️ Architecture

```text
Admin Dashboard
       │
       ▼
Create Trip Information
       │
       ▼
Gemini AI Generates Itinerary
       │
       ▼
Unsplash Fetches Destination Images
       │
       ▼
Appwrite Stores Trip Data
       │
       ▼
Users Explore Trips
```

---

## 🔐 Authentication

Authentication and authorization are managed through Appwrite.

### Roles

* Admin
* User

### Capabilities

* Secure authentication
* Session management
* Role-based access control

---

## 💳 Payments

Stripe is integrated for payment processing and premium feature support.

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/your-username/ai-travel-trip-planner.git
```

### Navigate to Project

```bash
cd ai-travel-trip-planner
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
VITE_BASE_URL=http://localhost:5173

# => Syncfusion
VITE_SYNCFUSION_LICENSE_KEY=

# => Appwrite
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_PROJECT_NAME=
VITE_APPWRITE_ENDPOINT=

VITE_APPWRITE_API_KEY=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_USERS_TABLE_ID=
VITE_APPWRITE_TRIPS_TABLE_ID=

# => Sentry
SENTRY_AUTH_TOKEN=

# => Gemini
GEMINI_API_KEY=
GEMINI_API_MODEL=

# => Unsplash
UNSPLASH_ACCESS_KEY=
UNSPLASH_SECRET_KEY=

# => Stripe
STRIPE_SECRET_KEY=
```

---

## 🔄 Application Flow

1. Admin logs into dashboard.
2. Admin enters destination and trip information.
3. Gemini AI generates travel itinerary content.
4. Unsplash API retrieves destination images.
5. Trip data is stored in Appwrite.
6. Users browse and view generated trips.

---

## 🧠 Future Improvements

* Trip editing support
* Trip deletion support
* AI travel assistant chatbot
* Personalized recommendations
* Multi-language support
* Mobile application
* Booking integrations

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Your Name

GitHub: https://github.com/your-username
