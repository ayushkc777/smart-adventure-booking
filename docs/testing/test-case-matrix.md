# Test Case Matrix

| Area | Test Type | Coverage |
| --- | --- | --- |
| Visitor browsing | Playwright | Home, Activities, search, Compare, Travel Planner |
| Activity search/filter | Vitest + Playwright | Filtering utility, Activities page filtering, public search |
| Smart Trip Planner | Vitest + Playwright | Activity preference ranking and browser recommendation |
| Authentication | Vitest + Supertest + Playwright | Register, login, invalid login, JWT `/me`, role redirects |
| Protected routes | Vitest + Supertest | Guest redirect, user denied admin, admin endpoint authorization |
| Booking flow | Vitest + Supertest + Playwright | Form validation, API booking creation, receipt, My Bookings |
| Reviews | Supertest | Completed-booking requirement, duplicate prevention, metric recalculation |
| Wishlist | Playwright | Save activity with logged-in user |
| User profile | Vitest + Playwright | Edit details, password validation, profile photo size, upload/remove |
| Admin users | Supertest + Playwright | Self-protection, safe deletion, Users section access |
| Admin activities | Supertest + Playwright | Create/update/archive behavior and Activities section access |
| Admin operators | Supertest + Playwright | Public/admin visibility and Operators section access |
| Admin bookings | Supertest + Playwright | Ownership, status update, booking detail modal |
| Admin reviews | Supertest + Playwright | Delete and metrics recalculation, Reviews section access |
| Support messages | Supertest + Playwright | Public contact submission, admin view/update/delete |
| Newsletter | Supertest + Playwright | Subscribe, duplicate handling, admin list/delete |
| Upload security | Supertest | Reject disguised non-image upload |
| Mobile responsiveness | Playwright | 390px Activities page filter layout and overflow check |
