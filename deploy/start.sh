#!/bin/bash

cd backend
#!/bin/bash
uvicorn backend.dataset_registry.offchain.server:app --host 0.0.0.0 --port 8000
