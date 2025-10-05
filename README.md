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

5. **Run development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
zamam-voting/
├── contracts/
│   └── SimpleVoting.sol          # Main voting smart contract
├── pages/
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
```

## 🎮 Usage

### For Voters

1. **Connect Wallet**: Click "Connect with MetaMask" 
2. **Switch Network**: Automatically switches to Sepolia testnet
3. **View Votings**: Browse active voting proposals
4. **Cast Vote**: Select your choice and submit vote
5. **View Results**: See real-time voting results

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

## 📊 Network Information

- **Network**: Sepolia Testnet
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

⭐ **Star this repository if you found it helpful!**

---

# 🇹🇷 ZamaVote - Blockchain Oylama Sistemi

🗳️ **Sepolia Testnet üzerinde güvenli, şeffaf ve çok dilli oylama sistemi**

ZamaVote, güvenli, şeffaf ve doğrulanabilir oylama sağlayan modern bir blockchain tabanlı oylama uygulamasıdır. Türkçe/İngilizce çok dilli desteği ile gelir.

## ✨ Özellikler

- 🔐 **Güvenli Oylama**: Güvenli kimlik doğrulama için MetaMask cüzdan entegrasyonu
- 🌐 **Çok Dilli**: Otomatik çeviri ile tam Türkçe/İngilizce dil desteği
- ⚡ **Gerçek Zamanlı**: Canlı oylama sonuçları ve durum güncellemeleri
- 🎯 **Kullanıcı Dostu**: Responsive tasarım ile temiz, modern arayüz
- 👑 **Admin Paneli**: Yöneticiler için eksiksiz oylama yönetim sistemi
- 🔍 **Şeffaf**: Tüm oylar Sepolia blockchain'inde kayıtlı
- 📱 **Responsive**: Masaüstü ve mobilde mükemmel çalışır

## 🚀 Canlı Demo

- **Production**: [https://zamam.vercel.app](https://zamam.vercel.app)
- **Network**: Sepolia Testnet
- **Contract**: `0xf43b398501525177c95544dc0B058d7CAA321d8F`

## 🛠️ Teknoloji Yığını

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Akıllı Kontratlar**: Solidity, Hardhat
- **Cüzdan**: ethers.js v6 ile MetaMask entegrasyonu
- **Deployment**: Vercel
- **Çeviri**: Özel çeviri sistemi

## 📋 Gereksinimler

- Node.js 18+ 
- MetaMask tarayıcı eklentisi
- Sepolia testnet ETH ([Sepolia Faucet](https://sepoliafaucet.com/)'ten alın)

## 🔧 Kurulum

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/Sazy67/zamam-voting.git
cd zamam-voting
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment kurulumu**
```bash
cp .env.example .env.local
```

4. **Environment değişkenlerini yapılandırın**
```env
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf43b398501525177c95544dc0B058d7CAA321d8F
NEXT_PUBLIC_NETWORK_NAME=Sepolia Testnet
NEXT_PUBLIC_CHAIN_ID=11155111
```

5. **Geliştirme sunucusunu çalıştırın**
```bash
npm run dev
```

Uygulamayı görmek için [http://localhost:3000](http://localhost:3000) adresini ziyaret edin.

## 📁 Proje Yapısı

```
zamam-voting/
├── contracts/
│   └── SimpleVoting.sol          # Ana oylama akıllı kontratı
├── pages/
│   ├── index.js                  # Ana oylama arayüzü
│   ├── admin.js                  # Admin yönetim paneli
│   ├── _app.js                   # Next.js app wrapper
│   └── _document.js              # Özel document
├── utils/
│   ├── translator.js             # Çeviri sistemi
│   ├── contract.js               # Kontrat yardımcıları
│   └── fhevm.js                  # Blockchain yardımcıları
├── scripts/
│   ├── deploy-sepolia.js         # Kontrat deployment
│   ├── authorize-voter.js        # Oy veren yetkilendirme
│   └── check-contract.js         # Kontrat doğrulama
├── styles/
│   └── globals.css               # Global stiller
└── public/
    ├── logo.svg                  # Uygulama logosu
    └── favicon.ico               # Favicon
```

## 🎮 Kullanım

### Oy Verenler İçin

1. **Cüzdan Bağla**: "MetaMask ile Bağlan" butonuna tıklayın
2. **Network Değiştir**: Otomatik olarak Sepolia testnet'e geçer
3. **Oylamaları Görüntüle**: Aktif oylama önerilerini inceleyin
4. **Oy Ver**: Seçiminizi yapın ve oyunuzu gönderin
5. **Sonuçları Görüntüle**: Gerçek zamanlı oylama sonuçlarını görün

### Yöneticiler İçin

1. **Admin Paneline Erişim**: Sahip cüzdan adresi ile bağlanın
2. **Oylama Oluştur**: Başlık, seçenekler ve süre belirleyin
3. **Oylamaları Yönet**: Oylamaları başlatın, bitirin veya sonuçları açıklayın
4. **Oy Veren Yetkilendir**: Adreslere oylama izni verin
5. **Oylamaları Sil**: Tamamlanan veya istenmeyen oylamaları kaldırın

### Dil Değiştirme

- Header'daki 🇹🇷 TR / 🇺🇸 EN butonlarına tıklayın
- Arayüz ve oylama içeriği otomatik olarak çevrilir
- Çeviriler hem ana sayfada hem admin panelinde çalışır

## 🔐 Akıllı Kontrat

`SimpleVoting.sol` kontratı şunları sağlar:

- **Oylama Oluşturma**: Çoklu seçenekli yeni oylama önerileri oluşturma
- **Erişim Kontrolü**: Sadece sahip için yönetici fonksiyonları
- **Oy Veren Yetkilendirme**: Whitelist tabanlı oylama izinleri
- **Zaman Yönetimi**: Otomatik oylama süresi kontrolü
- **Sonuç Açıklama**: Güvenli sonuç açıklama sistemi
- **Oylama Silme**: İstenmeyen oylama önerilerini kaldırma

### Ana Fonksiyonlar

```solidity
function createVoting(string memory _proposal, string[] memory _options, uint256 _durationHours) external onlyOwner
function vote(uint256 _votingId, uint32 _optionIndex) external
function startVoting(uint256 _votingId) external onlyOwner
function endVoting(uint256 _votingId) external onlyOwner
function revealResults(uint256 _votingId) external onlyOwner
function authorizeVoter(address _voter) external onlyOwner
function deleteVoting(uint256 _votingId) external onlyOwner
```

## 🌐 Çeviri Sistemi

ZamaVote kapsamlı bir çeviri sistemi içerir:

- **Otomatik Algılama**: Türkçe içeriği algılar ve İngilizce'ye çevirir
- **Kapsamlı Kapsama**: Oylama başlıkları, seçenekler ve UI öğeleri
- **Gerçek Zamanlı Çeviri**: Anında dil değiştirme
- **Genişletilebilir**: Yeni diller ve çeviriler eklenmesi kolay

### Yeni Çeviriler Ekleme

`utils/translator.js` dosyasını düzenleyin:

```javascript
const translations = {
  'Türkçe Metin': 'English Translation',
  // Daha fazla çeviri ekleyin...
};
```

## 🚀 Deployment

### Vercel'e Deploy

1. **GitHub repository'sini Vercel'e bağlayın**
2. **Vercel dashboard'unda environment değişkenlerini ayarlayın**
3. **Main branch'e push'ta otomatik deploy**

### Akıllı Kontrat Deploy

```bash
# Sepolia testnet'e deploy
npx hardhat run scripts/deploy-sepolia.js --network sepolia

# Kontratı doğrula (opsiyonel)
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 🧪 Test Etme

```bash
# Testleri çalıştır
npm test

# Kontratı kontrol et
npx hardhat run scripts/check-contract.js --network sepolia

# Test oylaması oluştur
npx hardhat run scripts/create-test-voting.js --network sepolia
```

## 📊 Network Bilgileri

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Block Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch'inizi oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Suat AYAZ**
- Twitter: [@suatayaz_](https://x.com/suatayaz_)
- GitHub: [Sazy67](https://github.com/Sazy67)

## 🙏 Teşekkürler

- Next.js ve Tailwind CSS ile geliştirildi
- Vercel'de deploy edildi
- Ethereum blockchain ile güçlendirildi
- Cüzdan bağlantısı için MetaMask entegrasyonu

---

⭐ **Bu repository'yi faydalı bulduysanız yıldızlamayı unutmayın!**