# Verifiable AI System

A blockchain-powered platform for verifying AI training datasets and models using Sui blockchain, Walrus storage, and Nautilus zk-proofs.

## 🚀 Features

- **Dataset Registry**: Upload and register AI training datasets with Merkle tree verification
- **Wallet Integration**: Connect Sui wallet to interact with the blockchain
- **zk-Proof Verification**: Generate and verify zero-knowledge proofs using Nautilus
- **Model Lineage**: Track the complete lineage from datasets to trained models
- **Governance Dashboard**: Monitor compliance and system health with interactive charts
- **Lineage Explorer**: Visualize dataset-model-proof relationships with interactive graphs

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Blockchain**: Sui blockchain (@mysten/sui.js, @mysten/wallet-kit)
- **Storage**: Walrus decentralized storage
- **Proofs**: Nautilus zk-proof system
- **Visualization**: React Flow, Recharts
- **State Management**: TanStack Query

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔌 Wallet Connection

1. Click "Connect Wallet" in the top navigation bar
2. Select your Sui wallet (Sui Wallet, Suiet, or Ethos)
3. Approve the connection
4. Your wallet address will be displayed in the navbar

## 📱 Navigation

### Dashboard (`/`)
- View system metrics and statistics
- See recent datasets, models, and proofs
- Monitor overall system health

### Upload Dataset (`/upload`)
Multi-step wizard for uploading datasets:
1. Select file and enter dataset name
2. File chunking
3. Upload to Walrus storage
4. Merkle tree generation
5. zk-proof generation
6. Registration on Sui blockchain

### Datasets (`/datasets`)
- Browse all registered datasets in table view
- Search by dataset name or ID
- Filter and paginate results
- Click to view detailed information

### Models (`/models`)
- View all registered AI models
- See model hashes and training dependencies
- Check verification status
- Click for detailed model information

### Proofs (`/proofs`)
- Explorer all zk-proofs
- View proof status and verification results
- Access Nautilus proof URLs
- Link to related datasets/models

### Lineage Explorer (`/lineage`)
- Interactive graph visualization
- Shows relationships: Dataset → Model → Proof
- Click nodes to navigate to details
- Drag to rearrange layout

### Governance (`/governance`)
- View compliance dashboard
- Interactive charts showing verification rates
- Monitor system compliance score
- Flag datasets and request reviews

### About (`/about`)
- Learn about the system architecture
- Understand the verification flow
- See how Sui + Walrus + Nautilus integrate

## 🔧 Configuration

### Sui Network
The app is configured to use Sui testnet by default. To change networks:

```typescript
// src/lib/sui.ts
export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"), // or "mainnet", "devnet"
});
```

### Package ID
Update the package ID after deploying your Sui smart contracts:

```typescript
// src/lib/sui.ts
export const PACKAGE_ID = "0x..."; // Your deployed package ID
```

## 🎨 Theme

The app supports dark and light themes:
- Toggle theme using the sun/moon icon in the navbar
- Theme preference is saved to localStorage
- Dark theme is default

## 🔐 Security

- All wallet interactions use official Sui wallet adapters
- No private keys are stored or transmitted
- All transactions require wallet approval
- zk-proofs ensure data integrity without revealing sensitive information

## 📊 API Integration

The app includes a mock API layer (`src/lib/api.ts`) with stubbed functions ready to be connected to:
- Sui blockchain RPC calls
- Walrus storage API
- Nautilus proof generation service

Replace mock implementations with actual API calls as services become available.

## 🧪 Development

### Mock Data
The app includes mock data for development:
- 3 sample datasets
- 2 sample models
- 3 sample proofs

### Adding New Features
1. Create new pages in `src/pages/`
2. Add routes in `src/App.tsx`
3. Create reusable components in `src/components/`
4. Update navigation in `src/components/Sidebar.tsx`

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
