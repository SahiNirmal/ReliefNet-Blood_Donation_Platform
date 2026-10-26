# ReliefNet Backend — Experiments 4 & 5

REST API for ReliefNet: Express + MongoDB (via Mongoose), now with production-grade security hardening.

## Setup

```bash
npm install
cp .env.example .env
# edit .env — set MONGODB_URI and FRONTEND_URL
npm run seed      # optional: populate with realistic sample data
npm run dev
```

`GET http://localhost:5000/api/health` should return `{"status":"ok"}`.

## Security (Experiment 5)

- **Helmet** — sets protective response headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate limiting** — a general limiter (300 req/15min) on all `/api` routes, plus a stricter one (20 req/15min) on `/api/users/register` and `/api/users/login` specifically, since those are what a brute-force or credential-stuffing attack would target
- **NoSQL-injection sanitization** — strips any request key starting with `$` or containing `.` from `req.body`, `req.params`, and `req.query`, so a payload like `{ email: { "$gt": "" } }` can't be used to bypass a query filter
- **HTTP Parameter Pollution protection** — duplicate query params (`?bloodGroup=O+&bloodGroup=A+`) collapse to the last value instead of silently becoming an array a controller doesn't expect
- **Locked-down CORS** — restricted to the single origin in `FRONTEND_URL`, not left open to any site
- **Body size limit** — requests over 10kb are rejected before parsing

### A note on `express-mongo-sanitize` and `hpp`
The obvious choices for the sanitization/HPP pieces are the `express-mongo-sanitize` and `hpp` npm packages — but both are broken on **Express 5** specifically, because `req.query` in Express 5 is a getter that recomputes a fresh object on every access. Both packages try to mutate that object in place, which is silently discarded the next time anything reads `req.query`. Rather than ship security middleware that quietly does nothing, `src/middleware/sanitizeInputs.js` implements the same protections directly, using `Object.defineProperty` to actually replace the getter with a fixed, sanitized value. See the comments in that file for the full explanation.

## Seeding the database

```bash
npm run seed
```
Wipes and repopulates Users, BloodRequests, and Donations with realistic sample data. All seeded accounts use the password `password123`.

## Connecting to MongoDB Atlas

1. Atlas → **Network Access** → add your current IP (or `0.0.0.0/0` while developing).
2. Atlas → **Database → Connect → Drivers** → copy the connection string, then add a database name right after the host: `.../reliefnet?retryWrites=true&w=majority`
3. Never share your real connection string anywhere — rotate immediately in Atlas → Database Access if one is ever exposed.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register as donor or requester |
| POST | `/api/users/login` | Log in |
| GET | `/api/users/donors?bloodGroup=&available=&lat=&lng=&radiusKm=` | List donors, filterable and distance-sorted |
| GET | `/api/users/:id` | Get a single user |
| PATCH | `/api/users/:id` | Update location/availability/area/phone |
| GET | `/api/requests?bloodGroup=&urgency=&status=&requesterId=&lat=&lng=&radiusKm=` | List requests, filterable and distance-sorted |
| GET | `/api/requests/:id` | Get a single request |
| POST | `/api/requests` | Create a new emergency request (returns `nearbyDonorsMatched`) |
| PATCH | `/api/requests/:id` | Update a request (status, fulfilledBy) |
| DELETE | `/api/requests/:id` | Delete a request |
| GET | `/api/donations?donorId=&requestId=` | List donations/responses |
| POST | `/api/donations` | A donor responds to a request |
| PATCH | `/api/donations/:id` | Update a response's status (e.g. to "completed") |
| GET | `/api/stats` | Platform-wide counts for the admin panel |

## What's next
- Experiment 6 adds real password hashing (bcrypt) and JWT-based login, replacing the plaintext password check in `userController.js`.
- Experiment 7 is this same API tested via a Postman collection.
- Experiment 8 adds WebSockets for real-time cross-user notifications.
