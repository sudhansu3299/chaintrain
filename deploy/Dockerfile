FROM python:3.10

WORKDIR /app

# Install backend
COPY backend/ ./backend
COPY config.py ./config.py
RUN pip install -r backend/requirements.txt

# Install frontend (build artifacts only)
COPY frontend/build ./frontend/build

# Start script
COPY deploy/start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
