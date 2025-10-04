# 🔧 Vercel Environment Variables Setup

## 📍 Vercel Dashboard'a Git
https://vercel.com/suat-ayazs-projects/zamam/settings/environment-variables

## 🔑 Eklenecek Environment Variables

### 1. WalletConnect Project ID
```
Name: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
Value: [WalletConnect Cloud'dan alınacak]
```
**Nasıl Alınır:**
1. https://cloud.walletconnect.com adresine git
2. Yeni proje oluştur
3. Project ID'yi kopyala

### 2. Testnet Desteği
```
Name: NEXT_PUBLIC_ENABLE_TESTNETS
Value: true
```

### 3. Zama Chain ID
```
Name: NEXT_PUBLIC_ZAMA_CHAIN_ID
Value: 8009
```

### 4. Contract Adresleri (Deploy Sonrası Eklenecek)

**Multi Voting System (Sepolia):**
```
Name: NEXT_PUBLIC_MULTI_CONTRACT_ADDRESS
Value: [Sepolia deploy sonrası]
```

**Zama Contract (Zama Devnet):**
```
Name: NEXT_PUBLIC_ZAMA_CONTRACT_ADDRESS
Value: [Zama deploy sonrası]
```

**Zama Advanced Contract:**
```
Name: NEXT_PUBLIC_ZAMA_ADVANCED_CONTRACT_ADDRESS
Value: [Advanced contract deploy sonrası]
```

**Zama Public Key:**
```
Name: NEXT_PUBLIC_ZAMA_PUBLIC_KEY
Value: [Zama deploy sonrası]
```

## 🚀 Sonraki Adımlar

1. ✅ Proje deploy edildi: https://zamam-l39led3ux-suat-ayazs-projects.vercel.app
2. 🔑 WalletConnect Project ID al ve ekle
3. 💰 Sepolia ETH al (faucet'ten)
4. 📄 Contract'ları deploy et
5. 🔧 Contract adreslerini environment variables'a ekle
6. 🎯 Vercel'de redeploy et

## 📋 Kontrol Listesi

- [ ] WalletConnect Project ID eklendi
- [ ] Sepolia ETH alındı
- [ ] Multi Voting System deploy edildi
- [ ] Zama contract deploy edildi
- [ ] Environment variables güncellendi
- [ ] Site test edildi
- [ ] Wallet bağlantısı çalışıyor
- [ ] Voting işlemleri test edildi