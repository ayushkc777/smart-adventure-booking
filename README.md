# Nepal Adventure SmartBook

Nepal Adventure SmartBook is a professional adventure tourism booking platform for travelers who want to compare operators, review safety guidance, save activities, compare experiences, and request bookings with confidence.

## Stack

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React

## Installation

```bash
cd ~/Documents/smart-adventure-booking
npm install
```

## Environment Variables

Create `.env` in the frontend project root.

```env
VITE_API_URL=http://127.0.0.1:5050
```

## Pages

- `/` Premium landing page with search, smart planner, destinations, featured activities, operators, testimonials, FAQ, and newsletter signup
- `/activities` Advanced activity search with filters and sorting
- `/activities/:id` Activity details with gallery, safety score, price comparison, reviews, map-style location panel, related activities, and recently viewed tracking
- `/compare` Side-by-side activity comparison for up to three activities
- `/operators/:id` Operator profile with license, safety score, response rate, languages, insurance indicator, reviews, and activities offered
- `/booking/:id` Multi-step booking flow
- `/booking-success` Printable booking receipt with reference number and download action
- `/login` Account sign in
- `/register` Traveler account registration
- `/user/dashboard` Traveler dashboard with bookings, wishlist, recently viewed, recommendations, reminders, and notifications
- `/user/bookings` Saved booking requests
- `/user/profile` Editable traveler profile with photo, emergency contact, language, and password settings
- `/admin` Dedicated admin dashboard layout
- `/admin/activities`, `/admin/operators`, `/admin/prices`, `/admin/bookings`, `/admin/reviews`, `/admin/users`, `/admin/support`, `/admin/analytics`, `/admin/settings`
- `/about` Company and platform overview
- `/safety` Centralized safety guidance
- `/travel-guide` Nepal adventure travel preparation guide
- `/contact` Traveler support form and emergency contact guidance
- `/privacy-policy`, `/terms`, `/cancellation-policy` Legal and booking policy pages

## Features

- API-backed Nepal adventure catalog with destinations, operators, reviews, pricing, coordinates, safety scores, risk levels, best seasons, popularity, and duration metadata
- Smart Trip Planner with rule-based recommendations using experience level, budget, location, duration, risk comfort, activity type, and group size
- Advanced filtering by keyword, province/location, activity type, price, duration, difficulty, risk, season, rating, and sorting by price, rating, popularity, or safety score
- Activity wishlist, recently viewed tracking, and comparison state saved in browser storage
- Operator price comparison with safety rating, value rating, license, inclusions, cancellation policy, and operator profile links
- Multi-step booking flow with validation for date, group size, email, phone, emergency contact, extras, safety acknowledgement, and review summary
- Booking receipt with reference number, traveler details, emergency contact, extras, total, status, print, and download actions
- Traveler profile photo, nationality, preferred language, emergency contact, and password change flow
- Contact support messages submitted through the backend API and reviewed from the admin support section
- Toast notifications for account, wishlist, comparison, booking, newsletter, and admin actions
- Admin layout separated from public layout with sidebar navigation, analytics, management sections, settings, safety alert management, and public website access

## Test Accounts

Admin access:

```text
Email: admin@smartadventure.com
Password: Admin123
```

Traveler access:

```text
Email: user@smartadventure.com
Password: User1234
```

## Authentication Flow

- Guests can browse activities, use the planner, compare activities, view operators, and read safety guidance.
- Booking pages require sign in. If a guest opens a booking page, they are sent to `/login` and returned to the requested booking page after successful login.
- Admin users are sent to `/admin` after login.
- Traveler users are sent to `/user/dashboard` after login.
- Admin routes are restricted to admin accounts and use a dedicated admin layout.
- Traveler dashboard, bookings, profile, booking, and booking success pages are restricted to traveler accounts.
- Registration creates a traveler account through the backend API.
- Logout clears the active session token and returns to the home page.

## Data and Storage

Authentication, activities, operators, bookings, reviews, support messages, wishlist, newsletter subscriptions, notifications, users, dashboard statistics, and admin analytics use the backend API configured by `VITE_API_URL`. Browser storage is kept only for the active session token, short-term session cache, comparison selections, recently viewed activities, guest wishlist state, and admin UI settings.

## Run Locally

```bash
npm install
npm run dev
```

The local frontend runs at:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev      # Start Vite development server
npm run lint     # Run oxlint
npm run build    # Build production frontend
npm run preview  # Preview the production build
```

## Build

```bash
npm run build
```

## Folder Structure

```text
src/
  api/           Axios client and API modules
  components/    Reusable layout, UI, auth, and activity components
  context/       Auth, platform, and traveler experience state
  data/          Local metadata used for UI enrichment and settings defaults
  pages/         Public, user, admin, support, and legal pages
  routes/        React Router configuration
  utils/         Formatting, validation, newsletter, and recommendation helpers
  App.jsx        App provider shell
  main.jsx       React entry point
  index.css      Global Tailwind and design system styles
public/
  images/        Local adventure images
  favicon.svg    Project favicon
```
