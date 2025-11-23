module 0x123::trainer {

    use std::string;
    use std::vector;
    use std::hash;
    use sui::object::{Self as object, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use enclave::enclave::{Self as enclave, Enclave};

    const WEIGHT_INTENT: u8 = 7;
    const EInvalidSignature: u64 = 1;

    /// Payload type used in Rust `IntentMessage<ModelWeightInput>`
    public struct ModelWeightInput has store, drop {
        input_data: vector<u8>,
    }

    /// Response payload (not strictly needed on-chain, but kept for symmetry)
    public struct WeightUpdate has store, drop {
        request_hash: vector<u8>,
        updated_weights: vector<u64>,
    }

    /// On-chain object storing weights + metadata
    public struct TrainerState has key, store {
        id: UID,
        last_request_hash: vector<u8>,
        last_weights: vector<u64>,
        last_requester: vector<u8>,
    }

    /// One-time witness — must be ALL CAPS version of module name
    public struct TRAINER has drop {}

    /// Module initializer — must NOT be `public` or `entry`
    fun init(w: TRAINER, ctx: &mut TxContext) {
        let cap = enclave::new_cap(w, ctx);

        // You can swap these PCRs with real ones later
        cap.create_enclave_config(
            string::utf8(b"trainer enclave"),
            x"00",
            x"00",
            x"00",
            ctx,
        );

        transfer::public_transfer(cap, ctx.sender());
    }

    /// Main entrypoint — verifies signature, hashes input, derives weights, updates state
    public entry fun process_request<T>(
        state: &mut TrainerState,
        input_data: vector<u8>,
        timestamp_ms: u64,
        sig: &vector<u8>,
        enclave_ref: &Enclave<T>,
        ctx: &mut TxContext
    ) {
        let requester = ctx.sender().to_bytes();

        //
        // 1. Create an owned copy of `input_data` for hashing
        //    (there is no `vector::clone` / `sub_vector` in `std::vector`,
        //     so we copy manually).
        //
        let len = vector::length(&input_data);
        let mut input_copy = vector::empty<u8>();
        let mut i = 0;
        while (i < len) {
            let b_ref = vector::borrow(&input_data, i);
            vector::push_back(&mut input_copy, *b_ref);
            i = i + 1;
        };

        //
        // 2. Hash the copied bytes (sha3_256 takes vector<u8> by value)
        //
        let hash_bytes = hash::sha3_256(input_copy);

        //
        // 3. Verify enclave signature over the original payload
        //
        let ok = enclave::verify_signature<T, ModelWeightInput>(
            enclave_ref,
            WEIGHT_INTENT,
            timestamp_ms,
            ModelWeightInput { input_data },
            sig,
        );
        assert!(ok, EInvalidSignature);

        //
        // 4. Deterministic weights from first 8 bytes of hash
        //
        let seed = bytes_to_u64(&hash_bytes);

        let mut weights = vector::empty<u64>();
        let mut j = 0;
        while (j < 10) {
            vector::push_back(&mut weights, (seed + (j as u64)) % 10000);
            j = j + 1;
        };

        //
        // 5. Persist in TrainerState
        //
        state.last_request_hash = hash_bytes;
        state.last_requester = requester;
        state.last_weights = weights;
    }

    /// Convert first 8 bytes of a hash into u64 (big-endian)
    fun bytes_to_u64(bytes: &vector<u8>): u64 {
        let mut out: u64 = 0;
        let mut i = 0;
        // assumes hash has at least 8 bytes (true for sha3_256)
        while (i < 8) {
            let b = *vector::borrow(bytes, i);
            out = (out << 8) | (b as u64);
            i = i + 1;
        };
        out
    }

    /// Mint a new TrainerState object
    public fun new_state(ctx: &mut TxContext): TrainerState {
        TrainerState {
            id: object::new(ctx),
            last_request_hash: vector::empty<u8>(),
            last_weights: vector::empty<u64>(),
            last_requester: vector::empty<u8>(),
        }
    }
}
