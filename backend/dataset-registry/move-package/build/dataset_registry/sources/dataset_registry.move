module dataset_registry::dataset_registry {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::transfer;

    struct DatasetRegistered has copy, drop {
        dataset_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        merkle_root: vector<u8>,
        zk_proof: vector<u8>,
        proof_system: vector<u8>,
        uploader: address
    }

    struct Dataset has key {
        id: UID,
        dataset_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        merkle_root: vector<u8>,
        zk_proof: vector<u8>,
        proof_system: vector<u8>,
        uploader: address,
        created_at: u64
    }

    public entry fun register_dataset(
        dataset_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        merkle_root: vector<u8>,
        zk_proof: vector<u8>,
        proof_system: vector<u8>,
        clock_obj: &Clock,         // 👈 ADD THIS
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // 📌 Fetch timestamp correctly
        let ts = clock::timestamp_ms(clock_obj);

        let dataset = Dataset {
            id: object::new(ctx),
            dataset_id,
            walrus_blob_id,
            merkle_root,
            zk_proof,
            proof_system,
            uploader: sender,
            created_at: ts
        };

        transfer::share_object(dataset);

        event::emit(DatasetRegistered {
            dataset_id,
            walrus_blob_id,
            merkle_root,
            zk_proof,
            proof_system,
            uploader: sender
        });
    }
}
