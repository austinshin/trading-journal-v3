FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Environment variables
ENV PORT=8000
ENV HOST=0.0.0.0

# Run the app
CMD ["sh", "-c", "uvicorn main:app --host $HOST --port $PORT"] 