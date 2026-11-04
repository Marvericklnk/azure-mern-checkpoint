# MERN on Azure Checkpoint — Daylist

A task board built with MongoDB, Express, React, and Node.js. Add, edit, complete, filter, and delete tasks. Includes loading, empty, and error states, responsive CSS, and an actual database-health endpoint. No generated images are used.

## Current status

Source code is prepared for Azure App Service. This project is **not deployed**. Azure and Atlas accounts have not been created yet. Live database persistence, a real browser CRUD session, and the Azure deployment remain unverified. No live URL or successful cloud deployment is claimed.

## Local setup

Use Node.js 22.12 or newer and a running MongoDB server or an Atlas cluster.

```bash
npm ci
npm --prefix client ci
```

Copy `.env.example` to `.env` and set `MONGO_URI` to a separate practice database. Keep it private.

```bash
npm run build
npm test
npm start
```

Open http://localhost:3000. The server waits for MongoDB before listening. For frontend development, run `npm run dev` in one terminal and `npm --prefix client run dev` in another. Vite proxies `/api` to port 3000.

## API

| Method | Path | Action |
| --- | --- | --- |
| GET | /api/health | Report MongoDB connection status |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create a task with a title |
| PUT | /api/tasks/:id | Edit title or completion status |
| DELETE | /api/tasks/:id | Delete a task |

## Deployment

Follow [AZURE-SETUP.md](AZURE-SETUP.md) after creating the Azure and Atlas accounts. The React build is served by Express, so the frontend and API share one Azure Web App. Secrets are backend environment variables; none belong in the client build.

## Checks and limitations

`npm test` exercises HTTP responses with mocked Mongoose methods, schema validation, database-unavailable responses, and production HTML delivery. It does not verify persistence. `npm run build` builds the actual React application.

Before submission, confirm live CRUD with Atlas, deploy to Azure, reload the live app to verify persistence, and replace this pending status with the actual deployment URL and results.
