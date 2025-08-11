## Construction Tech API

A Node.js + Express API with Prisma + PostgreSQL for a construction platform that connects homeowners, contractors, and project managers via projects, bids, and milestones.

### Tech Stack
- Node.js, Express
- Prisma ORM, PostgreSQL
- JWT auth
- Jest for tests

### Prerequisites
- Docker and Docker Compose installed

### Environment Variables
Set these in your environment (local, Compose, or AWS):
- `DATABASE_URL` (PostgreSQL URI). Example: `postgresql://postgres:postgres@db:5432/app?schema=public`
- `JWT_SECRET` (e.g., a long random string)
- `PORT` (optional; defaults to 3000; AWS Elastic Beanstalk sets this to 8080 automatically)

### Run Locally with Docker Compose
1. Build and start:
   ```bash
   docker compose up --build
   ```
2. The API will be available at `http://localhost:3000`.
3. Health check: `GET /healthz` → 200 OK.

Prisma migrations are applied automatically on container start. To seed local dev data manually:
```bash
docker compose exec api node prisma/seed.js
```

### API Quickstart
Find the link to the Postman Api documentation:
https://documenter.getpostman.com/view/42348839/2sB3BEoVoP


### Model Overview and ER Diagram

- User owns many Projects (as homeowner)
- User submits many Bids (as contractor)
- Project has many Bids and many Milestones
- Project may have an assigned Contractor (optional because the homeowner could decide to cancel)
- Notification belongs to a User and a Project, and may reference a Bid



Key constraints and notes:
- Each `Bid` is unique per `(projectId, contractorId)` pair.
- `Project.contractorId` is optional until a contractor is assigned.
- `Notification.bidId` is optional; when present it references the related bid.
- See the full schema in `prisma/schema.prisma` for enums and field details.

### Docker
- `Dockerfile` builds a lean production image and generates Prisma Client during build.
- Container startup runs `prisma migrate deploy` then starts the server.
- `.dockerignore` keeps the image small.

### Deploy to AWS Elastic Beanstalk (Docker Platform)
This app is ready for the single-container Docker platform on Elastic Beanstalk.

1) Provision a PostgreSQL database (Amazon RDS recommended) and capture its connection string as `DATABASE_URL`.

2) Create an Elastic Beanstalk application and environment:
- Platform: Docker running on 64bit Amazon Linux 2
- Application code: Upload a ZIP of the repository root containing the `Dockerfile`

3) Configure environment variables in the Elastic Beanstalk console:
- `DATABASE_URL`: e.g., `postgresql://USER:PASSWORD@HOST:5432/DB?schema=public`
- `JWT_SECRET`: a strong random value
- `NODE_ENV`: `production`
- `PORT`: leave blank; EB sets `PORT=8080` automatically

4) Health checks:
- Set Health check URL to `/healthz` (HTTP) in the EB load balancer settings

5) Deployment:
- Click Deploy. The container will start, run Prisma migrations, and listen on `$PORT`.

6) Notes:
- Ensure security groups allow the EB instance(s) to reach the RDS database.
- Migrations run on every deploy (`prisma migrate deploy` is idempotent).

### Testing
Jest tests can be run locally (non-Docker) with a test database:
```bash
npm install
npm run test
```

### License
MIT


