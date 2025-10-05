# ZamaVote - Blockchain Voting System

🗳️ **Secure, transparent and multilingual voting system on Sepolia Testnet**

ZamaVote is a modern blockchain-based voting application that provides secure, transparent, and verifiable voting with multilingual support (Turkish/English).

## ✨ Features

- 🔐 **Secure Voting**: MetaMask wallet integration for secure authentication
- 🌐 **Multilingual**: Full Turkish/English language support with automatic translation
- ⚡ **Real-time**: Live voting results and status updates
- 🎯 **User-friendly**: Clean, modern interface with responsive design
- 👑 **Admin Panel**: Complete voting management system for administrators
- 🔍 **Transparent**: All votes recorded on Sepolia blockchain
- 📱 **Responsive**: Works perfectly on desktop and mobile devices

## 🚀 Live Demo

- **Production**: [https://zamam.vercel.app](https://zamam.vercel.app)
- **Network**: Sepolia Testnet
- **Contract**: `0xf43b398501525177c95544dc0B058d7CAA321d8F`

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contracts**: Solidity, Hardhat
- **Wallet**: MetaMask integration with ethers.js v6
- **Deployment**: Vercel
- **Translation**: Custom translation system

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask browser extension
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sazy67/zamam-voting.git
cd zamam-voting
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure environment variables**
```env
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf43b398501525177c95544dc0B058d7CAA321d8F
NEXT_PUBLIC_NETWORK_NAME=Sepolia Testnet
NEXT_PUBLIC_CHAIN_ID=11155111
```

<<<<<<< HEAD
5. **Run development server**
=======
5. **Local blockchain başlatın:**
```bash
npx hardhat node
```

6. **Contract'ları deploy edin:**

**Klasik Sistem:**
```bash
npx hardhat run scripts/deploy-multi.js --network localhost
```

**Zama FHEVM Sistemi:**
```bash
# Basit Zama sistemi
npx hardhat run scripts/deploy-zama-simple.js --network localhost

```

7. **Frontend'i başlatın:**
>>>>>>> 38bca574a6889032073643ee9521fc66298db8bd
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

<<<<<<< HEAD
## 📁 Project Structure
=======
### Ana Sayfa (`/`)
- İki sistem arasında seçim yapın
- Aktif oylamaları görün ve katılın
- Sonuçları gerçek zamanlı takip edin

### Klasik Sistem
- **Oy Verme**: `/vote` - Standart oylama arayüzü
- **Admin Panel**: `/admin` - Oylama yönetimi

### Zama FHEVM Sistemi
- **Şifreli Oy**: `/zama-vote` - Şifreli oylama arayüzü
- **Zama Admin**: `/zama-admin` - Gelişmiş admin paneli
- **Gelişmiş Şifreli**: `/zama-advanced-vote` - Çoklu seçenek şifreli oylama
- **Gelişmiş Admin**: `/zama-advanced-admin` - Tam özellikli yönetim paneli

## 👑 Admin Paneli Özellikleri

### Klasik Admin (`/admin`)
- Yeni oylama oluşturma
- Oylamaları başlatma/durdurma
- Sonuçları açıklama
- Detaylı istatistikler


## 🔧 Geliştirme

### Test Etme
```bash
npx hardhat test
```

### Farklı Network'lere Deploy

**Sepolia Testnet:**
```bash
npx hardhat run scripts/deploy-multi.js --network sepolia
npx hardhat run scripts/deploy-zama-simple.js --network sepolia
```

**Zama Devnet:**
```bash
npx hardhat run scripts/deploy-zama-simple.js --network zama
```

## 📁 Proje Yapısı
>>>>>>> 38bca574a6889032073643ee9521fc66298db8bd

```
zamam-voting/
├── contracts/
│   └── SimpleVoting.sol          # Main voting smart contract
├── pages/
<<<<<<< HEAD
│   ├── index.js                  # Main voting interface
│   ├── admin.js                  # Admin management panel
│   ├── _app.js                   # Next.js app wrapper
│   └── _document.js              # Custom document
├── utils/
│   ├── translator.js             # Translation system
│   ├── contract.js               # Contract utilities
│   └── fhevm.js                  # Blockchain utilities
├── scripts/
│   ├── deploy-sepolia.js         # Contract deployment
│   ├── authorize-voter.js        # Voter authorization
│   └── check-contract.js         # Contract verification
├── styles/
│   └── globals.css               # Global styles
└── public/
    ├── logo.svg                  # Application logo
    └── favicon.ico               # Favicon
=======
│   ├── index.js                   # Ana sayfa - sistem seçimi
│   ├── vote.js                    # Klasik oylama
│   ├── admin.js                   # Klasik admin
│   ├── zama-vote.js              # Zama basit oylama
│   ├── zama-admin.js             # Zama basit admin
├── components/                    # React components
├── test/                         # Test dosyaları
└── artifacts/                    # Compiled contracts
>>>>>>> 38bca574a6889032073643ee9521fc66298db8bd
```

## 🎮 Usage

### For Voters

1. **Connect Wallet**: Click "Connect with MetaMask" 
2. **Switch Network**: Automatically switches to Sepolia testnet
3. **View Votings**: Browse active voting proposals
4. **Cast Vote**: Select your choice and submit vote
5. **View Results**: See real-time voting results

<<<<<<< HEAD
### For Administrators

1. **Access Admin Panel**: Connect with owner wallet address
2. **Create Voting**: Set title, options, and duration
3. **Manage Votings**: Start, end, or reveal results
4. **Authorize Voters**: Grant voting permissions to addresses
5. **Delete Votings**: Remove completed or unwanted votings

### Language Switching

- Click 🇹🇷 TR / 🇺🇸 EN buttons in the header
- Interface and voting content automatically translates
- Translations work in both main page and admin panel

## 🔐 Smart Contract

The `SimpleVoting.sol` contract provides:

- **Voting Creation**: Create new voting proposals with multiple options
- **Access Control**: Owner-only administrative functions
- **Voter Authorization**: Whitelist-based voting permissions
- **Time Management**: Automatic voting duration control
- **Result Revelation**: Secure result disclosure system
- **Voting Deletion**: Remove unwanted voting proposals

### Key Functions

```solidity
function createVoting(string memory _proposal, string[] memory _options, uint256 _durationHours) external onlyOwner
function vote(uint256 _votingId, uint32 _optionIndex) external
function startVoting(uint256 _votingId) external onlyOwner
function endVoting(uint256 _votingId) external onlyOwner
function revealResults(uint256 _votingId) external onlyOwner
function authorizeVoter(address _voter) external onlyOwner
function deleteVoting(uint256 _votingId) external onlyOwner
```

## 🌐 Translation System

ZamaVote includes a comprehensive translation system:

- **Automatic Detection**: Detects Turkish content and translates to English
- **Comprehensive Coverage**: Voting titles, options, and UI elements
- **Real-time Translation**: Instant language switching
- **Extensible**: Easy to add new languages and translations

### Adding New Translations

Edit `utils/translator.js`:

```javascript
const translations = {
  'Turkish Text': 'English Translation',
  // Add more translations...
};
```

## 🚀 Deployment

### Deploy to Vercel

1. **Connect GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Deploy Smart Contract

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-sepolia.js --network sepolia

# Verify contract (optional)
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 🧪 Testing

```bash
# Run tests
npm test

# Check contract
npx hardhat run scripts/check-contract.js --network sepolia

# Create test voting
npx hardhat run scripts/create-test-voting.js --network sepolia
```
=======
>>>>>>> 38bca574a6889032073643ee9521fc66298db8bd

## 📊 Network Information

<<<<<<< HEAD
- **Network**: Sepolia Testnet
=======
🌐 **Live Demo**: https://zamam-3ef8w72sj-suat-ayazs-projects.vercel.app

### 📱 Sayfalar
- **Ana Sayfa** (`/`): Sistem seçimi ve genel bakış
- **Klasik Oylama** (`/vote`): Standart blockchain oylama
- **Admin Panelleri**: Her sistem için yönetim arayüzü

### 🎮 Demo Özellikleri
- ✅ Cüzdan bağlama (MetaMask)
- ✅ Çoklu oylama sistemi
- ✅ Gerçek zamanlı arayüz
- ✅ Responsive tasarım
- ✅ Demo veriler ile test

## 🌐 Network Bilgileri

### Zama FHEVM Testnet
- **Chain ID**: 8009
- **RPC URL**: https://devnet.zama.ai
- **Explorer**: https://explorer.devnet.zama.ai
- **Faucet**: [Zama Discord](https://discord.gg/zama)

### Sepolia Testnet
>>>>>>> 38bca574a6889032073643ee9521fc66298db8bd
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Block Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Suat AYAZ**
- Twitter: [@suatayaz_](https://x.com/suatayaz_)
- GitHub: [Sazy67](https://github.com/Sazy67)

## 🙏 Acknowledgments

- Built with Next.js and Tailwind CSS
- Deployed on Vercel
- Powered by Ethereum blockchain
- MetaMask integration for wallet connectivity

---
<<<<<<< HEAD

⭐ **Star this repository if you found it helpful!**
=======
suatayaz@gmail.com
@suatayaz_
**🔐 Powered by Zama FHEVM - Blockchain'de Tam Gizlilik!**
>>>>>>> 38bca574a6889032073643ee9521fc66298db8bd
