# End-to-End Test Report

## Scope

This report covers the browser smoke suite that verifies the integrated frontend, backend API, and local MongoDB database.

## Tools

- Playwright
- Google Chrome channel
- React frontend dev server
- Express backend dev server
- Local MongoDB seeded through the backend seed script

## Command

```bash
npm run test:e2e
```

## Latest Result

- E2E tests: 3 passed
- Public visitor flow: passed
- User account and booking flow: passed
- Admin console flow: passed

The suite reseeds the backend before and after the browser run so the development database returns to the seeded state.

## Covered Browser Flows

- Visitor opens homepage, searches activities, compares an activity, uses the Smart Trip Planner, submits contact support, subscribes to newsletter, and checks mobile activities layout.
- User registers, logs out, logs back in, saves an activity to wishlist, completes a booking request, views receipt, views My Bookings, uploads a profile photo, and removes the photo.
- Admin logs in, opens dashboard, navigates Users, Activities, Operators, Price Comparison, Bookings, Reviews, Support Messages, Analytics, and Settings, views booking details, confirms support message visibility, and logs out.

## Evidence Screenshots

Screenshots are stored in `docs/testing/screenshots/`:

- `public-home.png`
- `mobile-activities.png`
- `booking-receipt.png`
- `admin-dashboard.png`

## Notes

- E2E runs against `http://localhost:5173` so the browser origin matches the backend CORS configuration.
- Backend API base URL is `http://127.0.0.1:5050`.
- Playwright starts or reuses the dev servers through `playwright.config.js`.
