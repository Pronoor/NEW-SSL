# SSL Certificate Manager - React Frontend

React frontend for the SSL Certificate Manager application.

## Features

- ✅ User authentication (Login/Register)
- ✅ Dashboard with certificate statistics
- ✅ Certificate management (Create, View, Delete, Renew)
- ✅ Auto-renewal toggle
- ✅ Modern UI with React Router
- ✅ API integration with Laravel backend

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The app will run on `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/         # React contexts (Auth)
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── public/              # Static assets
└── package.json
```

## API Integration

The frontend communicates with the Laravel API backend. Make sure the backend is running on `http://localhost:8000`.

## Technologies

- React 18
- React Router 6
- Axios for API calls
- TanStack Query (React Query) for data fetching
- Vite for build tooling
