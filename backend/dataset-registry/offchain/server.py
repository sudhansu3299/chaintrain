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



if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
