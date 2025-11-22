FROM python:3.10

WORKDIR /app

# Install backend
COPY backend/ ./backend
COPY ../backend/dataset-registry/offchain/config.py ./config.py
RUN pip install -r backend/requirements.txt

# Install frontend (build artifacts only)
COPY frontend/dist ./frontend/dist

# Start script
COPY deploy/start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
