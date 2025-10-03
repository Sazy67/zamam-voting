import '../styles/globals.css';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, coinbaseWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';

// Localhost development chain
const localhost = {
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

// Zama FHEVM testnet chain
const zamaTestnet = {
  id: 8009,
  name: 'Zama Devnet',
  network: 'zama-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZAMA',
    symbol: 'ZAMA',
  },
  rpcUrls: {
    public: { http: ['https://devnet.zama.ai'] },
    default: { http: ['https://devnet.zama.ai'] },
  },
  blockExplorers: {
    default: { name: 'Zama Explorer', url: 'https://explorer.devnet.zama.ai' },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains(
  [localhost, sepolia, zamaTestnet],
  [publicProvider()]
);

// Leap Wallet ve diğer cüzdanları ekle
const connectors = connectorsForWallets([
  {
    groupName: 'Önerilen',
    wallets: [
      injectedWallet({ chains }), // Leap Wallet burada algılanacak
      metaMaskWallet({ projectId: 'YOUR_PROJECT_ID', chains }),
      walletConnectWallet({ projectId: 'YOUR_PROJECT_ID', chains }),
      coinbaseWallet({ appName: 'Gizli Oy Sistemi', chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}