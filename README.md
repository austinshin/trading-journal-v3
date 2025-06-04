# Trading Journal & Watchlist App (DT-v3)

A comprehensive trading journal and stock watchlist application built with Next.js, FastAPI, and Supabase.

## Features

### Trading Journal
- Add, edit, and delete trades
- Comprehensive trade analysis with profit/loss calculations
- Risk analysis and trade metrics
- Trade history and performance tracking
- Import/export functionality

### Stock Watchlist
- Real-time stock data powered by Finnhub API
- Premarket data and gap analysis
- Market cap, float, and volume information
- 52-week range tracking
- Integration with external tools (DilutionTracker, Yahoo Finance)
- AI-powered trade analysis with ChatGPT integration

### Saved Watchlists
- Create and manage multiple watchlists
- Save watchlists for quick access
- Edit and delete functionality
- Persistent storage with Supabase

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database and authentication

### Backend
- **FastAPI** - Python web framework
- **Supabase** - PostgreSQL database
- **Finnhub API** - Market data
- **Docker** - Containerization

## Prerequisites

- Node.js 18+
- Python 3.9+
- Docker (optional)
- Supabase account
- Finnhub API key

## Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd DT-v3
```

### 2. Environment Variables
Create a `.env` file in the root directory with:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Finnhub API
FINNHUB_API_KEY=your_finnhub_api_key

# Backend
BACKEND_URL=http://localhost:8000
```

### 3. Database Setup
Run the SQL migrations in your Supabase SQL editor:
```bash
# Apply the schema
psql < backend/supabase/migrations/00001_initial_schema.sql
psql < backend/supabase/migrations/00002_saved_watchlists.sql
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 6. Docker Setup (Alternative)
```bash
docker-compose up -d
```

## Usage

1. **Sign up/Sign in** - Create an account or log in
2. **Add trades** - Record your trades with detailed information
3. **Analyze performance** - View trade analysis and metrics
4. **Create watchlists** - Monitor stocks you're interested in
5. **Real-time data** - Get live market data and premarket information

## API Endpoints

### Trading Journal
- `GET /trades` - Get all trades
- `POST /trades` - Add a new trade
- `GET /trades/{id}` - Get specific trade
- `PUT /trades/{id}` - Update trade
- `DELETE /trades/{id}` - Delete trade

### Market Data
- `GET /enrich/{symbol}` - Get enriched stock data
- `GET /premarket/{symbol}` - Get premarket data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please create an issue in the GitHub repository. 