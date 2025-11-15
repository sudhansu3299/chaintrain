module dataset_registry::dataset_registry {
    use sui::object;
    use sui::tx_context;
    use sui::event;
    use sui::clock;
    use sui::transfer;

    public struct DatasetRegistered has copy, drop {
        dataset_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        merkle_root: vector<u8>,
        zk_proof: vector<u8>,
        proof_system: vector<u8>,
        uploader: address
    }

    public struct Dataset has key {
        id: UID,
        dataset_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        merkle_root: vector<u8>,
        zk_proof: vector<u8>,
        proof_system: vector<u8>,
        uploader: address,
        created_at: u64
    }

    public fun register_dataset(
        dataset_id: vector<u8>,
        walrus_blob_id: vector<u8>,
        merkle_root: vector<u8>,
        zk_proof: vector<u8>,
        proof_system: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let ts = clock::now_millis();

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
