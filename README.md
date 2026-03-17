IoT Project Frontend
====================

This frontend displays sensor data (temperature & humidity) from the backend and visualizes it in a chart.

API Spec (concise)
- Auth: device-signed JWT (HS256) — server verifies with JWT_SECRET.
- Timestamps: ISO8601 UTC strings, e.g. 2026-03-17T19:00:22.000Z
- Content-Type: application/json

Endpoints
- POST /api/sensor
  - Body: { "token": "<JWT>" }
  - JWT claims (decoded payload): device_id (string, optional), timestamp (ISO8601, required), temperature (number, optional), humidity (number, optional), exp (numeric)
  - Responses: 200 { "success": true, "data": <savedDocument> } | 400/401/500 with { "error": "..." }

- GET /api/sensor
  - Response: 200 JSON array (up to 50), server-sorted newest→oldest

- GET /api/sensor/latest
  - Response: 200 single object or 404

Example POST (curl)
```
curl -X POST https://your-backend.example.com/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"token":"<JWT_HERE>"}'
```

Example GET (curl)
```
curl https://your-backend.example.com/api/sensor
```

Parsing / Validation rules for frontend
- Parse server timestamps with `new Date(entry.timestamp)`; display localized strings.
- Backend sorts newest→oldest. Client re-sorts to oldest→newest for time series plotting.
- Handle missing `temperature` and `humidity` fields (treat as null / gaps in chart).
- Expect error responses shaped as `{ "error": "<message>" }` and handle HTTP 400/401/500 accordingly.

Notes
- Frontend calls only GET endpoints. POST is performed by devices (they sign tokens).
- CORS: ensure backend allows your origin or use a proxy.
# IoT Project Backend

Node.js + Express backend for sensor ingestion and retrieval.

API spec, examples, and quick start are in this README.

Environment variables (create a `.env` from `.env.example`):

- `PORT` - server port (default 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret used to verify HS256 tokens
- `ALLOWED_ORIGINS` - comma-separated allowed browser origins

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

See the **API** section below for endpoint details and examples.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
