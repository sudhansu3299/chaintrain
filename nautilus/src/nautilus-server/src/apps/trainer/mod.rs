// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
use crate::common::IntentMessage;
use crate::common::{to_signed_response, IntentScope, ProcessDataRequest, ProcessedDataResponse};
use crate::AppState;
use crate::EnclaveError;
use axum::extract::State;
use axum::Json;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use sha2::{Sha256, Digest};

/// ====
/// Core Nautilus server logic with model weight modification
/// ====

/// Inner type T for IntentMessage<T>
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelWeightResponse {
    pub request_hash: String,
    pub updated_weights: Vec<f64>,
}

/// Inner type T for ProcessDataRequest<T>
#[derive(Debug, Serialize, Deserialize)]
pub struct ModelWeightRequest {
    pub input_data: String,
}

pub async fn process_data(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ProcessDataRequest<ModelWeightRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<ModelWeightResponse>>>, EnclaveError> {
    
    // Step 1: Generate hash of the request
    let request_serialized = serde_json::to_string(&request.payload)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to serialize request: {}", e)))?;
    
    let mut hasher = Sha256::new();
    hasher.update(request_serialized.as_bytes());
    let hash_result = hasher.finalize();
    let request_hash = format!("{:x}", hash_result);
    
    // Step 2: Generate and change model weights
    // Using the hash as a seed to deterministically generate weights
    let hash_seed = u64::from_str_radix(&request_hash[..16], 16)
        .unwrap_or(0);
    
    // Generate initial weights from the hash seed
    let num_weights = 10; // You can adjust this or make it configurable
    let updated_weights: Vec<f64> = (0..num_weights)
        .map(|i| {
            // Generate weight based on hash and position
            let value = ((hash_seed.wrapping_add(i as u64) % 10000) as f64) / 10000.0;
            value
        })
        .collect();
    
    // Step 3: Get current timestamp
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get current timestamp: {}", e)))?
        .as_millis() as u64;
    
    // Step 4: Create and return the response
    Ok(Json(to_signed_response(
        &state.eph_kp,
        ModelWeightResponse {
            request_hash,
            updated_weights,
        },
        current_timestamp,
        IntentScope::ProcessData,
    )))
}