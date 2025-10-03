# 🚀 Deployment Guide - Gizli Oy Sistemi

## 📋 Ön Gereksinimler

### 1. Gerekli Hesaplar
- **Vercel Account**: [vercel.com](https://vercel.com)
- **WalletConnect Project**: [cloud.walletconnect.com](https://cloud.walletconnect.com)
- **Infura Account**: [infura.io](https://infura.io) (Sepolia RPC için)
- **MetaMask Wallet**: Sepolia ETH ile

### 2. Environment Variables

Vercel dashboard'da aşağıdaki environment variable'ları ekleyin:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key

# Frontend Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ENABLE_TESTNETS=true

# Multi Voting System (Sepolia)
NEXT_PUBLIC_MULTI_CONTRACT_ADDRESS=will_be_set_after_deployment

# Zama FHEVM Configuration
NEXT_PUBLIC_ZAMA_CHAIN_ID=8009
NEXT_PUBLIC_ZAMA_CONTRACT_ADDRESS=will_be_set_after_deployment
NEXT_PUBLIC_ZAMA_PUBLIC_KEY=will_be_set_after_deployment
```

## 🔧 Deployment Adımları

### 1. Contract'ları Deploy Et

```bash
# Sepolia'ya Multi Voting System deploy et
npm run deploy-multi

# Zama'ya Simple Voting deploy et  
npm run deploy-zama-simple
```

### 2. Contract Adreslerini Güncelle

Deploy sonrası çıkan contract adreslerini Vercel environment variables'a ekle:
- `NEXT_PUBLIC_MULTI_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_ZAMA_CONTRACT_ADDRESS`

### 3. Vercel'e Deploy Et

```bash
# Vercel CLI ile
vercel --prod

# Veya GitHub'a push yaparak otomatik deploy
git add .
git commit -m "Production deployment"
git push origin main
```

## 🌐 Test Ağları

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: https://ethereum-sepolia-rpc.publicnode.com
- **Faucet**: https://sepoliafaucet.com

### Zama FHEVM Devnet
- **Chain ID**: 8009
- **RPC**: https://devnet.zama.ai
- **Faucet**: https://faucet.zama.ai

## 🔍 Doğrulama

Deploy sonrası kontrol edilecekler:
- [ ] Ana sayfa yükleniyor
- [ ] Wallet bağlantısı çalışıyor
- [ ] Contract'lar doğru network'te
- [ ] Voting işlemleri çalışıyor
- [ ] Admin paneli erişilebilir

## 🚨 Güvenlik Notları

- Private key'leri asla commit etmeyin
- Production'da gerçek private key kullanın
- Environment variables'ı güvenli tutun
- Contract'ları verify edin