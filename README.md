# 🗳️ Blockchain Gizli Oylama Sistemi

Modern blockchain teknolojisi ile güvenli ve şeffaf oylama platformu. **Zama FHEVM** ile şifreli oylama desteği!

## 🚀 Özellikler


### 🔐 Zama FHEVM Şifreli Oylama
- **Tam Gizlilik**: Oylar Zama FHEVM ile şifrelenir
- **Süre Kontrolü**: Saat bazında oylama süreleri
- **Otomatik Bitiş**: Süre dolduğunda otomatik sonlandırma
- **Şifreli Sayım**: Sonuçlar açıklanana kadar tamamen gizli
- **Gelişmiş Admin**: Detaylı raporlama ve yönetim

## 🛠️ Teknolojiler

- **Frontend**: Next.js, React, RainbowKit, Wagmi
- **Blockchain**: Ethereum, Hardhat, Solidity
- **Şifreleme**: Zama FHEVM (Fully Homomorphic Encryption)
- **Wallet**: MetaMask entegrasyonu
- **Styling**: Tailwind CSS, Custom CSS
- **Testing**: Hardhat, Chai, Mocha

## 📦 Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repo-url>
cd blockchain-voting
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve gerekli değerleri girin
```

4. **Contract'ları derleyin:**
```bash
npx hardhat compile
```

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
```bash
npm run dev
```

## 🌐 Kullanım

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

```
├── contracts/
│   ├── MultiVotingSystem.sol      # Klasik oylama sistemi
│   ├── ZamaVotingSimple.sol       # Zama FHEVM basit sistem
│   ├── ZamaSimpleVoting.sol       # Zama FHEVM gelişmiş sistem
│   └── ZamaAdvancedVoting.sol     # Zama FHEVM tam özellikli sistem
├── scripts/
│   ├── deploy-multi.js            # Klasik sistem deploy
│   ├── deploy-zama-simple.js      # Zama basit sistem deploy
│   └── deploy-zama-advanced-v2.js # Zama gelişmiş sistem deploy
├── pages/
│   ├── index.js                   # Ana sayfa - sistem seçimi
│   ├── vote.js                    # Klasik oylama
│   ├── admin.js                   # Klasik admin
│   ├── zama-vote.js              # Zama basit oylama
│   ├── zama-admin.js             # Zama basit admin
├── components/                    # React components
├── test/                         # Test dosyaları
└── artifacts/                    # Compiled contracts
```

## 🔒 Güvenlik Özellikleri

### Klasik Sistem
- Blockchain immutability
- OpenZeppelin standartları
- Admin yetki kontrolü
- Tek oy garantisi

### Zama FHEVM Sistemi
- **Homomorphic Encryption**: Oylar şifreli olarak işlenir
- **Zero Knowledge**: Sonuçlar açıklanana kadar gizli
- **Süre Güvenliği**: Otomatik bitiş mekanizması
- **Admin Şeffaflığı**: Detaylı audit trail


## 🔗 Canlı Demo

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
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/...
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/zama-enhancement`)
3. Commit edin (`git commit -m 'Add Zama FHEVM feature'`)
4. Push edin (`git push origin feature/zama-enhancement`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorun yaşarsanız:
- Issue açın
- Zama FHEVM dokümantasyonunu kontrol edin
- Community'ye katılın

---
suatayaz@gmail.com
@suatayaz_
**🔐 Powered by Zama FHEVM - Blockchain'de Tam Gizlilik!**
