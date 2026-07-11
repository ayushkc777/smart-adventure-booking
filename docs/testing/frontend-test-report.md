# Frontend Test Report

## Scope

This report covers the React + Vite frontend test suite for:

- Authentication validation and role-based route protection
- Activity catalogue filtering, API error state, comparison, and details pages
- Booking form validation and successful booking submission
- User dashboard, profile editing, password update, and profile photo size validation
- Core recommendation logic for the Smart Trip Planner

## Tools

- Vitest
- React Testing Library
- Testing Library User Event
- jsdom
- V8 coverage provider

## Commands

```bash
npm run test:run
npm run test:coverage
```

## Latest Result

- Unit/component test files: 4 passed
- Unit/component tests: 18 passed
- Statement coverage: 73.12%
- Branch coverage: 67.39%
- Function coverage: 64.37%
- Line coverage: 75.60%

Coverage artifacts are generated in `coverage/`.

## Notes

- Vitest is scoped to `src/**/*.test.{js,jsx}` so Playwright E2E specs are not run by the unit-test runner.
- The test command disables Node's experimental web storage warning while jsdom provides browser storage for tests.
- Remaining uncovered areas are mostly large visual/admin sections and low-risk presentational branches.
