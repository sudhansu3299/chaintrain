FROM python:3.10

WORKDIR /app

# Copy backend directory (recursive)
COPY backend ./backend

# Copy config.py into root app directory (if needed by import paths)
COPY backend/dataset_registry/offchain/config.py ./config.py

# Install backend dependencies
RUN pip install -r backend/dataset_registry/offchain/requirements.txt

# Copy frontend build
COPY frontend/dist ./frontend/dist

# Start script
COPY deploy/start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
