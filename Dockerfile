FROM python:3.10

WORKDIR /app

# Copy backend
COPY backend ./backend

# Install backend dependencies
RUN pip install -r backend/dataset_registry/offchain/requirements.txt

# Copy start script
COPY start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
