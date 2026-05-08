# Farmify

Farmify is a full-stack agriculture support platform built with Node.js, Express, SQLite, and a single-page frontend. The app connects the frontend UI to the backend APIs and stores data persistently in `database.sqlite`.

## Live features implemented

- User authentication
  - Signup, login, JWT-based sessions
  - Role support for farmer/buyer/expert
- Profile management
  - Persistent profile fields including contact, location, financial details
- Marketplace and orders
  - Product catalog
  - Cart checkout and order placement
  - Payment processing simulation
- Soil Testing Labs
  - Browse certified testing labs
  - Book soil tests with date, sample type, field size, and crop type
  - Persist bookings to the database
- Government Subsidies
  - Browse subsidy schemes
  - View scheme details, eligibility, application process, required documents
  - Submit subsidy applications and persist them in the database
- Live advisory and news sections
  - Advisory feed with crop, market, and weather updates
  - Advisory details with external info links
- Community support and help requests
  - Submit support queries
  - Community posts and organizations
- Farm overview and ledger
  - Farm data overview persisted per user
  - Ledger / income-expense tracking
- Soil and audio features
  - Speech recognition and text-to-speech support for search and chatbot

## Backend

- Main file: `server.js`
- Database: `database.sqlite`
- API routes include:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/profile`
  - `POST /api/profile`
  - `GET /api/subsidies`
  - `POST /api/subsidies/apply`
  - `GET /api/subsidies/applications`
  - `GET /api/soil-labs`
  - `POST /api/soil-labs/book`
  - `GET /api/soil-labs/bookings`
  - `POST /api/payment/process`
  - many more routes for marketplace, orders, advisories, community, weather, farm overview, ledger, and machinery

## Frontend

- Main file: `public/index.html`
- Connected UI feature cards for:
  - Soil Testing Labs
  - Government Subsidies
  - Farm Store
  - Weather Intelligence
  - Mandi Prices
  - Community and support
  - Machinery rental
  - Financial ledger
- Uses toast notifications and modal workflows for smooth interaction

## How to run

1. Open terminal in `c:\Users\HP\OneDrive\Desktop\farmify`
2. Install dependencies if not already installed:
   ```powershell
   npm install
   ```
3. Start the backend server:
   ```powershell
   node server.js
   ```
4. Open the app in your browser:
   ```text
   http://localhost:3000
   ```

## Notes

- The application is currently saved and connected to the server.
- `git status --short` returned a clean workspace at the time of creation.
- The backend must be running to use the live features.
- If you want, open `public/index.html` for further UI polish or translate `lang.js` for additional language support.

## File status

- `server.js` is the main Express backend file.
- `public/index.html` is the live frontend app.
- `database.sqlite` stores all persistent data.
- This README was added to document the project state and usage.
