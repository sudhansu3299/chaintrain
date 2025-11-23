FROM python:3.10

WORKDIR /app

# Copy backend directory
COPY backend ./backend

# Install backend dependencies
RUN pip install -r backend/dataset_registry/offchain/requirements.txt

# Copy frontend build folder
COPY frontend/dist ./frontend/dist

# Copy start script from root to container root
COPY start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 8000
CMD ["./start.sh"]
