import traceback
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tempfile
import os
from run_pipeline import process_dataset
from walrus_upload import download_dataset_walrus

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:8000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # or ["*"] for quick dev test
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    print("Processing dataset:", temp_path)

    try:
        result = process_dataset(temp_path)
        print("Result is: ", result)
        return {
            "success": True,
            # "tx": result["tx_digest"],
            "dataset_id": result["dataset_id"],
            "blob_id": result["blob_info"]["blob_id"],
            "blob_object_id": result["blob_info"]["blob_object_id"],
            "merkle_root": result["merkle_root"],
            "chunks": result["chunks"],
            "file_size": result["file_size"],
            "storage": result["blob_info"]["storage"],
            "registered_epoch": result["blob_info"]["registered_epoch"],
            "encoding_type": result["blob_info"]["encoding_type"],
            "cost": result["blob_info"]["cost"],
            "encoded_length": result["blob_info"]["encoded_length"],
            "filename": file.filename
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

    finally:
        os.remove(temp_path)

@app.get("/download-dataset")
async def download_dataset(blob_id: str):
    print("blobId from python server is: ", blob_id)
    # file_name = f"{uuid.uuid4()}.bin"
    # destination_path = os.path.join("/tmp", file_name)

    try:
        res = download_dataset_walrus(blob_id)
        print("res is ", res)
        return res

    except Exception as e:
        print("Error {}", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import hashlib
import requests
import os
from datetime import datetime
from pathlib import Path
import traceback

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ENCLAVE_URL = "http://16.170.234.164:3000/process_data"
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'csv', 'json', 'txt', 'parquet'}

# Ensure upload folder exists
Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

# In-memory storage
training_history = {}  # request_hash -> training_record
dataset_cache = {}     # dataset_path -> file_content/hash

# Pydantic models
class VerifyRequest(BaseModel):
    datasetPath: str
    requestHash: str

class TrainingResponse(BaseModel):
    requestHash: str
    modelWeights: str
    signature: str
    datasetSource: str
    timestamp: str

class VerificationResponse(BaseModel):
    isValid: bool
    requestHash: str
    message: str
    details: Optional[dict] = None

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

async def upload_dataset(file: UploadFile) -> str:
    """
    Handle file upload and return the file path
    """
    if not allowed_file(file.filename):
        raise ValueError(f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")
    
    # Add timestamp to avoid collisions
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    # Save file
    content = await file.read()
    with open(filepath, 'wb') as f:
        f.write(content)
    
    return filepath

def compute_dataset_hash(dataset_path: str) -> str:
    """
    Compute SHA256 hash of dataset content
    """
    # Check if we already have this hash cached
    if dataset_path in dataset_cache:
        return dataset_cache[dataset_path]
    
    try:
        # Read the file and compute hash
        with open(dataset_path, 'rb') as f:
            file_content = f.read()
            dataset_hash = hashlib.sha256(file_content).hexdigest()
            dataset_cache[dataset_path] = dataset_hash
            return dataset_hash
    except FileNotFoundError:
        # If file doesn't exist, just hash the path string itself
        # This handles cases where frontend provides paths we can't access
        dataset_hash = hashlib.sha256(dataset_path.encode()).hexdigest()
        dataset_cache[dataset_path] = dataset_hash
        return dataset_hash

def call_enclave(dataset_path: str) -> dict:
    """
    Call the enclave with dataset and get trained model
    """
    try:
        # Read dataset content to send to enclave
        with open(dataset_path, 'rb') as f:
            dataset_content = f.read()
            # Convert to format expected by enclave
            # Using hex encoding as example, adjust based on your enclave's needs
            input_data = dataset_content.hex()[:100]  # Truncate for demo
    except FileNotFoundError:
        # If we can't read the file, use the path itself
        input_data = dataset_path
    
    payload = {
        "payload": {
            "input_data": input_data
        }
    }
    
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(ENCLAVE_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Enclave call failed: {str(e)}")

@app.post("/api/train", response_model=TrainingResponse)
async def train_model(
    dataset: Optional[UploadFile] = File(None),
    datasetPath: Optional[str] = Form(None)
):
    """
    Handle training request from frontend
    Accepts either file upload or file path
    """
    print("Training request received")
    print(f"Dataset file: {dataset.filename if dataset else 'None'}")
    print(f"Dataset path: {datasetPath}")
    
    try:
        dataset_path = None
        dataset_source = None
        
        # Check if file was uploaded
        if dataset and dataset.filename:
            print(f"Processing uploaded file: {dataset.filename}")
            # Upload the file and get path
            dataset_path = await upload_dataset(dataset)
            dataset_source = dataset.filename
            print(f"File saved to: {dataset_path}")
            
        # Check if file path was provided
        elif datasetPath:
            print(f"Using provided path: {datasetPath}")
            dataset_path = datasetPath
            dataset_source = datasetPath
            
        else:
            raise HTTPException(status_code=400, detail="No dataset provided")
        
        # Compute hash of the dataset for verification
        print("Computing dataset hash...")
        dataset_hash = compute_dataset_hash(dataset_path)
        print(f"Dataset hash: {dataset_hash}")
        
        # Call enclave to train model
        print("Calling enclave...")
        enclave_response = call_enclave(dataset_path)
        print(f"Enclave response: {enclave_response}")
        
        # Extract response data
        response_data = enclave_response.get('response', {}).get('data', {})
        request_hash = response_data.get('request_hash')
        updated_weights = response_data.get('updated_weights', [])
        signature = enclave_response.get('signature')
        timestamp = enclave_response.get('response', {}).get('timestamp_ms')
        
        print(f"Request hash: {request_hash}")
        
        # Store in training history
        training_record = {
            'request_hash': request_hash,
            'dataset_path': dataset_path,
            'dataset_source': dataset_source,
            'dataset_hash': dataset_hash,
            'model_weights': updated_weights,
            'signature': signature,
            'timestamp': timestamp,
            'timestamp_iso': datetime.fromtimestamp(timestamp/1000).isoformat() if timestamp else datetime.now().isoformat()
        }
        
        training_history[request_hash] = training_record
        print(f"Training record stored. Total records: {len(training_history)}")
        
        # Return response to frontend
        return TrainingResponse(
            requestHash=request_hash,
            modelWeights=f"weights_{request_hash[:16]}.pt",
            signature=signature,
            datasetSource=dataset_source,
            timestamp=training_record['timestamp_iso']
        )
        
    except ValueError as e:
        print(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error during training: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.post("/api/verify", response_model=VerificationResponse)
async def verify_model(verify_request: VerifyRequest):
    """
    Verify if a model was trained with a specific dataset
    """
    print(f"Verification request - Dataset: {verify_request.datasetPath}, Hash: {verify_request.requestHash}")
    
    try:
        dataset_path = verify_request.datasetPath
        request_hash = verify_request.requestHash
        
        # Check if we have this training record
        if request_hash not in training_history:
            print(f"No training record found for hash: {request_hash}")
            return VerificationResponse(
                isValid=False,
                requestHash=request_hash,
                message="No training record found for this model"
            )
        
        # Get the training record
        training_record = training_history[request_hash]
        print(f"Found training record: {training_record['dataset_source']}")
        
        # Compute hash of provided dataset
        print("Computing hash of provided dataset...")
        provided_dataset_hash = compute_dataset_hash(dataset_path)
        print(f"Provided hash: {provided_dataset_hash}")
        print(f"Expected hash: {training_record['dataset_hash']}")
        
        # Compare hashes
        is_valid = provided_dataset_hash == training_record['dataset_hash']
        
        # Also check if the paths match (for user-friendly verification)
        path_matches = dataset_path == training_record['dataset_path']
        
        if is_valid:
            message = 'Dataset verified! This model was trained using the specified dataset.'
        elif path_matches:
            message = 'Dataset path matches, but content hash differs. Dataset may have been modified.'
        else:
            message = 'Verification failed. The dataset does not match the training record.'
        
        print(f"Verification result: {is_valid}")
        
        return VerificationResponse(
            isValid=is_valid,
            requestHash=request_hash,
            message=message,
            details={
                'expected_dataset': training_record['dataset_source'],
                'provided_dataset': dataset_path,
                'hash_match': is_valid,
                'path_match': path_matches
            }
        )
        
    except Exception as e:
        print(f"Error during verification: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.get("/api/training-history")
async def get_training_history():
    """
    Get all training history records
    """
    print(f"Fetching training history. Total records: {len(training_history)}")
    
    try:
        history = []
        for request_hash, record in training_history.items():
            history.append({
                'requestHash': request_hash,
                'datasetSource': record['dataset_source'],
                'modelWeights': f"weights_{request_hash[:16]}.pt",
                'signature': record['signature'],
                'timestamp': record['timestamp_iso']
            })
        
        # Sort by timestamp, newest first
        history.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return {'history': history}
        
    except Exception as e:
        print(f"Error fetching history: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        'status': 'healthy',
        'enclave_url': ENCLAVE_URL,
        'training_records': len(training_history)
    }

# Example of your existing endpoint style
@app.get("/download-dataset")
async def download_dataset(blob_id: str):
    print("blobId from python server is: ", blob_id)
    try:
        # Your existing download logic here
        # res = download_dataset_walrus(blob_id)
        # print("res is ", res)
        # return res
        return {"message": "Download dataset endpoint", "blob_id": blob_id}
    except Exception as e:
        print("Error {}", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import hashlib
import requests
import os
from datetime import datetime
from pathlib import Path
import traceback

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ENCLAVE_URL = "http://16.170.234.164:3000/process_data"
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'csv', 'json', 'txt', 'parquet'}

# Ensure upload folder exists
Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

# In-memory storage
training_history = {}  # request_hash -> training_record
dataset_cache = {}     # dataset_path -> file_content/hash

# Pydantic models
class VerifyRequest(BaseModel):
    datasetPath: str
    requestHash: str

class TrainingResponse(BaseModel):
    requestHash: str
    modelWeights: str
    signature: str
    datasetSource: str
    timestamp: str

class VerificationResponse(BaseModel):
    isValid: bool
    requestHash: str
    message: str
    details: Optional[dict] = None

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

async def upload_dataset(file: UploadFile) -> str:
    """
    Handle file upload and return the file path
    """
    if not allowed_file(file.filename):
        raise ValueError(f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")
    
    # Add timestamp to avoid collisions
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    # Save file
    content = await file.read()
    with open(filepath, 'wb') as f:
        f.write(content)
    
    return filepath

def compute_dataset_hash(dataset_path: str) -> str:
    """
    Compute SHA256 hash of dataset content
    """
    # Check if we already have this hash cached
    if dataset_path in dataset_cache:
        return dataset_cache[dataset_path]
    
    try:
        # Read the file and compute hash
        with open(dataset_path, 'rb') as f:
            file_content = f.read()
            dataset_hash = hashlib.sha256(file_content).hexdigest()
            dataset_cache[dataset_path] = dataset_hash
            return dataset_hash
    except FileNotFoundError:
        # If file doesn't exist, just hash the path string itself
        # This handles cases where frontend provides paths we can't access
        dataset_hash = hashlib.sha256(dataset_path.encode()).hexdigest()
        dataset_cache[dataset_path] = dataset_hash
        return dataset_hash

def call_enclave(dataset_path: str) -> dict:
    """
    Call the enclave with dataset and get trained model
    """
    try:
        # Read dataset content to send to enclave
        with open(dataset_path, 'rb') as f:
            dataset_content = f.read()
            # Convert to format expected by enclave
            # Using hex encoding as example, adjust based on your enclave's needs
            input_data = dataset_content.hex()[:100]  # Truncate for demo
    except FileNotFoundError:
        # If we can't read the file, use the path itself
        input_data = dataset_path
    
    payload = {
        "payload": {
            "input_data": input_data
        }
    }
    
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(ENCLAVE_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Enclave call failed: {str(e)}")

@app.post("/api/train")
async def train_model(
    dataset: Optional[UploadFile] = File(None),
    datasetPath: Optional[str] = Form(None)
):
    """
    Handle training request from frontend
    Accepts either file upload or file path
    """
    print("Training request received")
    print(f"Dataset file: {dataset.filename if dataset else 'None'}")
    print(f"Dataset path: {datasetPath}")
    
    try:
        dataset_path = None
        dataset_source = None
        
        # Check if file was uploaded
        if dataset and dataset.filename:
            print(f"Processing uploaded file: {dataset.filename}")
            # Upload the file and get path
            dataset_path = await upload_dataset(dataset)
            dataset_source = dataset.filename
            print(f"File saved to: {dataset_path}")
            
        # Check if file path was provided
        elif datasetPath:
            print(f"Using provided path: {datasetPath}")
            dataset_path = datasetPath
            dataset_source = datasetPath
            
        else:
            raise HTTPException(status_code=400, detail="No dataset provided")
        
        # Compute hash of the dataset for verification
        print("Computing dataset hash...")
        dataset_hash = compute_dataset_hash(dataset_path)
        print(f"Dataset hash: {dataset_hash}")
        
        # Call enclave to train model
        print("Calling enclave...")
        enclave_response = call_enclave(dataset_path)
        print(f"Enclave response: {enclave_response}")
        
        # Extract response data
        response_data = enclave_response.get('response', {}).get('data', {})
        request_hash = response_data.get('request_hash')
        updated_weights = response_data.get('updated_weights', [])
        signature = enclave_response.get('signature')
        timestamp = enclave_response.get('response', {}).get('timestamp_ms')
        
        print(f"Request hash: {request_hash}")
        
        # Store in training history
        training_record = {
            'request_hash': request_hash,
            'dataset_path': dataset_path,
            'dataset_source': dataset_source,
            'dataset_hash': dataset_hash,
            'model_weights': updated_weights,
            'signature': signature,
            'timestamp': timestamp,
            'timestamp_iso': datetime.fromtimestamp(timestamp/1000).isoformat() if timestamp else datetime.now().isoformat()
        }
        
        training_history[request_hash] = training_record
        print(f"Training record stored. Total records: {len(training_history)}")
        
        # Return response to frontend
        return {
            'requestHash': request_hash,
            'modelWeights': f"weights_{request_hash[:16]}.pt",
            'signature': signature,
            'datasetSource': dataset_source,
            'timestamp': training_record['timestamp_iso']
        }
        
    except ValueError as e:
        print(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error during training: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.post("/api/verify")
async def verify_model(verify_request: VerifyRequest):
    """
    Verify if a model was trained with a specific dataset
    """
    print(f"Verification request - Dataset: {verify_request.datasetPath}, Hash: {verify_request.requestHash}")
    
    try:
        dataset_path = verify_request.datasetPath
        request_hash = verify_request.requestHash
        
        # Check if we have this training record
        if request_hash not in training_history:
            print(f"No training record found for hash: {request_hash}")
            return {
                'isValid': False,
                'requestHash': request_hash,
                'message': "No training record found for this model"
            }
        
        # Get the training record
        training_record = training_history[request_hash]
        print(f"Found training record: {training_record['dataset_source']}")
        
        # Compute hash of provided dataset
        print("Computing hash of provided dataset...")
        provided_dataset_hash = compute_dataset_hash(dataset_path)
        print(f"Provided hash: {provided_dataset_hash}")
        print(f"Expected hash: {training_record['dataset_hash']}")
        
        # Compare hashes
        is_valid = provided_dataset_hash == training_record['dataset_hash']
        
        # Also check if the paths match (for user-friendly verification)
        path_matches = dataset_path == training_record['dataset_path']
        
        if is_valid:
            message = 'Dataset verified! This model was trained using the specified dataset.'
        elif path_matches:
            message = 'Dataset path matches, but content hash differs. Dataset may have been modified.'
        else:
            message = 'Verification failed. The dataset does not match the training record.'
        
        print(f"Verification result: {is_valid}")
        
        return {
            'isValid': is_valid,
            'requestHash': request_hash,
            'message': message,
            'details': {
                'expected_dataset': training_record['dataset_source'],
                'provided_dataset': dataset_path,
                'hash_match': is_valid,
                'path_match': path_matches
            }
        }
        
    except Exception as e:
        print(f"Error during verification: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.get("/api/training-history")
async def get_training_history():
    """
    Get all training history records
    """
    print(f"Fetching training history. Total records: {len(training_history)}")
    
    try:
        history = []
        for request_hash, record in training_history.items():
            history.append({
                'requestHash': request_hash,
                'datasetSource': record['dataset_source'],
                'modelWeights': f"weights_{request_hash[:16]}.pt",
                'signature': record['signature'],
                'timestamp': record['timestamp_iso']
            })
        
        # Sort by timestamp, newest first
        history.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return {'history': history}
        
    except Exception as e:
        print(f"Error fetching history: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.get("/api/health")
@app.post("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        'status': 'healthy',
        'enclave_url': ENCLAVE_URL,
        'training_records': len(training_history)
    }

@app.get("/health")
@app.post("/health")
async def health_check_alias():
    """
    Health check endpoint (alias)
    """
    return {
        'status': 'healthy',
        'enclave_url': ENCLAVE_URL,
        'training_records': len(training_history)
    }

# Example of your existing endpoint style
@app.get("/download-dataset")
async def download_dataset(blob_id: str):
    print("blobId from python server is: ", blob_id)
    try:
        # Your existing download logic here
        # res = download_dataset_walrus(blob_id)
        # print("res is ", res)
        # return res
        return {"message": "Download dataset endpoint", "blob_id": blob_id}
    except Exception as e:
        print("Error {}", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
