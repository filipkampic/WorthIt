# WorthIt

WorthIt is a web application where users rate and review products to help others decide if they're worth the price. Users can browse products, leave reviews, and see whether something is a **Bargain**, **Worth It**, or **Overpriced** based on community ratings.

## Tech Stack

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express.js  
**Database:** Firebase Firestore

## Features

- Browse and search products by category, price, and rating
- Add products with image, description, and category
- Leave reviews with a 1–5 value rating
- Automatic status calculation (Bargain / Worth It / Overpriced)
- User profile with reviews, added products, and saved products
- Save products for later
- Responsive design

## Setup

### Prerequisites
- Node.js
- Firebase project with Firestore enabled

### Backend

1. Clone the repository:
```bash
git clone https://github.com/filipkampic/WorthIt.git
cd WorthIt
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Add your Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Save as `backend/config/serviceAccountKey.json`

4. Start the server:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`.

### Frontend

Open `frontend/index.html` in a browser or use a local server (e.g. Live Server in VS Code).

### Seed Data

To populate the database with sample products:
```bash
cd backend
node seed.js
```

## Author

Filip Kampić  
Faculty of Electrical Engineering, Computer Science and Information Technology Osijek (FERIT)  
Web Programming — 2025/2026
