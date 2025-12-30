# Contact App (local dev)

Local Docker Compose setup for the Contact App (Postgres, Express API, and React client served by Nginx).

## Run locally

Start all services in detached mode:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

## Health

- Server health endpoint: `http://localhost:5000/health` (returns `{ status: 'ok' }`).
- Client (Nginx) serves the app on `http://localhost:8082`.

## App features

- Home page: shows contacts **filtered by precinct** (select a precinct to see only matching entries). You can add a new contact from the Home page — when you add a contact and include a precinct it will become available in the precinct filter.
- Admin page: available at `http://localhost:8082/admin` and provides full CRUD (create, read, update, delete) for contacts.

## Tests (server)

Install dev dependencies locally and run tests from the `server` folder:

```bash
cd server
npm install
npm test
```

You can also run tests inside the running server container (if Compose is up):

```bash
docker compose exec server npm test
```

Note: The integration tests expect the Postgres DB to be available (the compose setup starts DB).
