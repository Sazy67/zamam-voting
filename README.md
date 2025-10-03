# 🗳️ Blockchain Oylama Sistemi

Modern blockchain teknolojisi ile güvenli ve şeffaf oylama platformu. **Zama FHEVM** ile şifreli oylama desteği!

## 🚀 Özellikler

### 🗳️ Klasik Oylama Sistemi
- **Blockchain Güvenliği**: Ethereum blockchain üzerinde güvenli oylama
- **Şeffaflık**: Tüm oylar ve sonuçlar blockchain'de şeffaf şekilde saklanır
- **Kolay Kullanım**: Kullanıcı dostu arayüz ile basit oylama deneyimi
- **Admin Paneli**: Oylamaları yönetmek için kapsamlı admin arayüzü
- **Gerçek Zamanlı**: Anlık oy sayımı ve sonuç görüntüleme

### 🔐 Zama FHEVM Şifreli Oylama
- **Tam Gizlilik**: Oylar Zama FHEVM ile şifrelenir
- **Süre Kontrolü**: Saat bazında oylama süreleri
- **Otomatik Bitiş**: Süre dolduğunda otomatik sonlandırma
- **Şifreli Sayım**: Sonuçlar açıklanana kadar tamamen gizli
- **Gelişmiş Admin**: Detaylı raporlama ve yönetim

## 🛠️ Teknolojiler

- **Frontend**: Next.js, React, RainbowKit
- **Blockchain**: Ethereum, Hardhat, Solidity
- **Şifreleme**: Zama FHEVM (Fully Homomorphic Encryption)
- **Wallet**: MetaMask entegrasyonu
- **Styling**: Tailwind CSS

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

## 👑 Admin Paneli Özellikleri

### Klasik Admin (`/admin`)
- Yeni oylama oluşturma
- Oylamaları başlatma/durdurma
- Sonuçları açıklama
- Detaylı istatistikler

### Zama Admin (`/zama-admin`)
- Süre kontrollü oylama oluşturma
- Otomatik bitiş yönetimi
- Şifreli oy takibi
- Gelişmiş raporlama

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
│   ├── MultiVotingSystem.sol    # Klasik oylama sistemi
│   ├── ZamaVotingSimple.sol     # Zama FHEVM sistemi
│   └── ZamaSimpleVoting.sol     # Gelişmiş Zama sistemi
├── scripts/
│   ├── deploy-multi.js          # Klasik sistem deploy
│   └── deploy-zama-simple.js    # Zama sistem deploy
├── pages/
│   ├── index.js                 # Ana sayfa
│   ├── vote.js                  # Klasik oylama
│   ├── admin.js                 # Klasik admin
│   ├── zama-vote.js            # Zama oylama
│   └── zama-admin.js           # Zama admin
├── components/                  # React components
└── artifacts/                   # Compiled contracts
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

## 🌐 Vercel Deploy

### Otomatik Deploy
Bu proje Vercel'e otomatik deploy edilecek şekilde yapılandırılmıştır.

1. **GitHub'a push edin:**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Vercel'e bağlayın:**
   - Vercel dashboard'a gidin
   - GitHub repo'yu import edin
   - Otomatik deploy başlayacak

3. **Environment Variables (Vercel Dashboard'da):**
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: `2f5a2b1c8d3e4f5a6b7c8d9e0f1a2b3c`
   - `NEXT_PUBLIC_MULTI_CONTRACT_ADDRESS`: `0xd571Ef424422BD0F843E8026d7Fa5808879B1B81`

4. **Deploy Durumu:**
   - ✅ Contract deployed: Sepolia testnet
   - ✅ Owner: `0x8c82BaEe92C489270C89a88DF45de7F6bd864bA5`
   - ✅ Vercel config: `vercel.json` hazır
   - ✅ Production env: `.env.production` hazır

### Manuel Deploy
```bash
# Vercel CLI ile
npm i -g vercel
vercel --prod
```

## 🔗 Canlı Demo

- **Ana Sayfa**: Sistem seçimi ve genel bakış
- **Klasik Oylama**: Standart blockchain oylama
- **Zama Şifreli**: Tam gizlilik ile oylama
- **Admin Panelleri**: Her iki sistem için yönetim

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

**🔐 Powered by Zama FHEVM - Blockchain'de Tam Gizlilik!**