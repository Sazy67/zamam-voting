import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { translateVoting } from '../utils/translator';

// Language translations
const translations = {
  tr: {
    title: "ZamaVote",
    subtitle: "Tam Homomorfik Şifreleme ile Oylama",
    heroTitle: "Blockchain Üzerinde Gizli Oylama",
    heroSubtitle: "Fully Homomorphic Encryption ile güvenli, şeffaf ve gizli oylama sistemi. Oylarınız şifreli kalır, sonuçlar doğrulanabilir.",
    connectWallet: "MetaMask ile Bağlan",
    poweredBy: "Geliştiren: Suat AYAZ",
    features: {
      privacy: { title: "Tam Gizlilik", desc: "FHE ile oylarınız şifreli kalır" },
      verifiable: { title: "Doğrulanabilir", desc: "Blockchain üzerinde şeffaf" },
      secure: { title: "Hızlı & Güvenli", desc: "Anında sonuç, maksimum güvenlik" }
    },
    connectedAccount: "Bağlı Hesap",
    admin: "Admin",
    vote: "Oy Ver",
    management: "Yönetim",
    activeVotings: "Aktif Oylamalar",
    votingsFound: "oylama bulundu",
    noVotings: "Henüz oylama bulunmuyor",
    noVotingsDesc: "Yeni oylamalar oluşturulduğunda burada görünecek.",
    // Voting status
    active: "Aktif",
    resultsRevealed: "Sonuçlar Açık",
    hasVoted: "Oy Verildi",
    votes: "oy",
    voteButton: "Oy Ver",
    // Admin panel
    adminPanel: "Yönetim Paneli",
    adminDesc: "Yeni oylamalar oluşturun ve mevcut oylamaları yönetin",
    createVoting: "Yeni Oylama Oluştur",
    votingTitle: "Oylama Başlığı",
    duration: "Süre (Saat)",
    createButton: "Oylama Oluştur",
    // Alerts
    votingCreated: "Oylama başarıyla oluşturuldu!",
    votingStarted: "Oylama başlatıldı!",
    voteRecorded: "Oyunuz başarıyla kaydedildi!",
    votingEnded: "Oylama bitirildi!",
    resultsRevealed: "Sonuçlar açıklandı!",
    fillAllFields: "Lütfen tüm alanları doldurun!",
    createError: "Oylama oluşturulurken hata: ",
    startError: "Oylama başlatılırken hata: ",
    voteError: "Oy verirken hata: ",
    endError: "Oylama bitirilirken hata: ",
    revealError: "Sonuçlar açıklanırken hata: ",
    metamaskNotFound: "MetaMask bulunamadı! Lütfen MetaMask yükleyin."
  },
  en: {
    title: "ZamaVote",
    subtitle: "Fully Homomorphic Encryption Voting",
    heroTitle: "Private Voting on Blockchain",
    heroSubtitle: "Secure, transparent and confidential voting system with Fully Homomorphic Encryption. Your votes remain encrypted, results are verifiable.",
    connectWallet: "Connect with MetaMask",
    poweredBy: "Developed by: Suat AYAZ",
    features: {
      privacy: { title: "Full Privacy", desc: "Your votes stay encrypted with FHE" },
      verifiable: { title: "Verifiable", desc: "Transparent on blockchain" },
      secure: { title: "Fast & Secure", desc: "Instant results, maximum security" }
    },
    connectedAccount: "Connected Account",
    admin: "Admin",
    vote: "Vote",
    management: "Management",
    activeVotings: "Active Votings",
    votingsFound: "votings found",
    noVotings: "No votings yet",
    noVotingsDesc: "New votings will appear here when created.",
    // Voting status
    active: "Active",
    resultsRevealed: "Results Revealed",
    hasVoted: "Voted",
    votes: "votes",
    voteButton: "Vote",
    // Admin panel
    adminPanel: "Management Panel",
    adminDesc: "Create new votings and manage existing ones",
    createVoting: "Create New Voting",
    votingTitle: "Voting Title",
    duration: "Duration (Hours)",
    createButton: "Create Voting",
    // Alerts
    votingCreated: "Voting created successfully!",
    votingStarted: "Voting started!",
    voteRecorded: "Your vote has been recorded successfully!",
    votingEnded: "Voting ended!",
    resultsRevealed: "Results revealed!",
    fillAllFields: "Please fill all fields!",
    createError: "Error creating voting: ",
    startError: "Error starting voting: ",
    voteError: "Error casting vote: ",
    endError: "Error ending voting: ",
    revealError: "Error revealing results: ",
    metamaskNotFound: "MetaMask not found! Please install MetaMask."
  }
};

// Contract bilgileri - Sepolia Testnet
const CONTRACT_ADDRESS = "0xf43b398501525177c95544dc0B058d7CAA321d8F";
const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function getVotingCount() view returns (uint256)",
  "function getVotingInfo(uint256) view returns (string, string[], bool, bool, uint32[], uint256, uint256, uint256)",
  "function createVoting(string, string[], uint256) returns (uint256)",
  "function vote(uint256, uint32)",
  "function startVoting(uint256)",
  "function endVoting(uint256)",
  "function revealResults(uint256)",
  "function authorizeVoter(address)",
  "function hasVotedInVoting(uint256, address) view returns (bool)",
  "function canVoteInVoting(uint256, address) view returns (bool)",
  "function getTimeRemaining(uint256) view returns (uint256)",
  "function isVotingDeleted(uint256) view returns (bool)"
];

export default function Home() {
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('vote');
  const [language, setLanguage] = useState('tr');

  // Admin form states
  const [proposal, setProposal] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(24);

  // Add Zama network to MetaMask
  const addZamaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x1F49', // 8009 in hex
          chainName: 'Zama Devnet',
          rpcUrls: ['https://devnet.zama.ai'],
          nativeCurrency: {
            name: 'ZAMA',
            symbol: 'ZAMA',
            decimals: 18,
          },
          blockExplorerUrls: ['https://explorer.zama.ai'],
        }],
      });
      return true;
    } catch (error) {
      console.error('Failed to add Zama network:', error);
      return false;
    }
  };

  // Switch to Zama network
  const switchToZamaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1F49' }], // 8009 in hex
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, try to add it
        return await addZamaNetwork();
      }
      console.error('Failed to switch to Zama network:', error);
      return false;
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        console.log('Current network:', network);
        console.log('Chain ID:', network.chainId);

        // Check if we're on Sepolia network
        if (Number(network.chainId) !== 11155111) {
          console.log('Wrong network detected, switching to Sepolia...');
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
            });
            // Network değişikliği sonrası yeniden bağlan
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
            return;
          } catch (switchError) {
            console.error('Network switch failed:', switchError);
            alert('Lütfen MetaMask\'ta Sepolia Testnet\'e geçin');
            return;
          }
        }

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Check if owner
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        console.log('Checking owner...');
        console.log('Connected address:', address);
        console.log('Contract address:', CONTRACT_ADDRESS);

        try {
          const owner = await contract.owner();
          console.log('Contract owner:', owner);
          console.log('Address match:', address.toLowerCase() === owner.toLowerCase());
          setIsOwner(address.toLowerCase() === owner.toLowerCase());
        } catch (error) {
          console.error('Owner check failed:', error);
          setIsOwner(false);
        }

        await loadVotings();
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert(translations[language].metamaskNotFound);
    }
  };

  // Load votings
  const loadVotings = async (currentLanguage = language) => {
    if (!account) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const count = await contract.getVotingCount();
      const votingList = [];

      for (let i = 0; i < Number(count); i++) {
        // Check if voting is deleted
        const isDeleted = await contract.isVotingDeleted(i);
        if (isDeleted) continue; // Skip deleted votings

        const info = await contract.getVotingInfo(i);
        const timeRemaining = await contract.getTimeRemaining(i);
        const hasVoted = await contract.hasVotedInVoting(i, account);

        // Skip if proposal is empty (deleted voting)
        if (!info[0]) continue;

        let votingData = {
          id: i,
          proposal: info[0],
          options: info[1],
          active: info[2],
          resultsRevealed: info[3],
          finalVotes: info[4].map(v => Number(v)),
          createdAt: new Date(Number(info[5]) * 1000),
          endTime: new Date(Number(info[6]) * 1000),
          totalVoters: Number(info[7]),
          timeRemaining: Number(timeRemaining),
          hasVoted
        };

        // Dil ayarına göre çeviri uygula
        if (currentLanguage === 'en') {
          console.log('Translating voting:', votingData.proposal);
          votingData = translateVoting(votingData, currentLanguage);
          console.log('Translated to:', votingData.proposal);
        }

        votingList.push(votingData);
      }

      setVotings(votingList);
    } catch (error) {
      console.error('Error loading votings:', error);
    }
  };

  // Create voting
  const createVoting = async () => {
    if (!proposal.trim() || options.some(opt => !opt.trim())) {
      alert(translations[language].fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const validOptions = options.filter(opt => opt.trim());
      const tx = await contract.createVoting(proposal.trim(), validOptions, duration);
      await tx.wait();

      alert(translations[language].votingCreated);
      setProposal('');
      setOptions(['', '']);
      await loadVotings();
    } catch (error) {
      console.error('Error creating voting:', error);
      alert(translations[language].createError + error.message);
    }
    setLoading(false);
  };

  // Start voting
  const startVoting = async (votingId) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.startVoting(votingId);
      await tx.wait();

      alert(translations[language].votingStarted);
      await loadVotings();
    } catch (error) {
      console.error('Error starting voting:', error);
      alert(translations[language].startError + error.message);
    }
    setLoading(false);
  };

  // Cast vote
  const castVote = async (votingId, optionIndex) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.vote(votingId, optionIndex);
      await tx.wait();

      alert(translations[language].voteRecorded);
      await loadVotings();
    } catch (error) {
      console.error('Error casting vote:', error);
      alert(translations[language].voteError + error.message);
    }
    setLoading(false);
  };

  // End voting
  const endVoting = async (votingId) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.endVoting(votingId);
      await tx.wait();

      alert(translations[language].votingEnded);
      await loadVotings();
    } catch (error) {
      console.error('Error ending voting:', error);
      alert(translations[language].endError + error.message);
    }
    setLoading(false);
  };

  // Reveal results
  const revealResults = async (votingId) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.revealResults(votingId);
      await tx.wait();

      alert(translations[language].resultsRevealed);
      await loadVotings();
    } catch (error) {
      console.error('Error revealing results:', error);
      alert(translations[language].revealError + error.message);
    }
    setLoading(false);
  };

  // Add option
  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  // Remove option
  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return language === 'tr' ? 'Süresi doldu' : 'Time expired';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return language === 'tr'
        ? `${hours} saat ${minutes} dakika`
        : `${hours} hours ${minutes} minutes`;
    }
    return language === 'tr'
      ? `${minutes} dakika`
      : `${minutes} minutes`;
  };

  useEffect(() => {
    if (account) {
      loadVotings(language);
      const interval = setInterval(() => loadVotings(language), 30000);
      return () => clearInterval(interval);
    }
  }, [account, language]); // language dependency eklendi

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/logo.svg" alt="ZamaVote Logo" className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{translations[language].title}</h1>
                  <p className="text-gray-400 text-sm">{translations[language].subtitle}</p>
                </div>
              </div>

              {/* Language & Social Links */}
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setLanguage('tr');
                      if (account) loadVotings('tr');
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${language === 'tr'
                      ? 'bg-white text-purple-900'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    🇹🇷 TR
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      if (account) loadVotings('en');
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${language === 'en'
                      ? 'bg-white text-purple-900'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    🇺🇸 EN
                  </button>
                </div>

                {/* X (Twitter) Link */}
                <a
                  href="https://x.com/suatayaz_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-sm">@suatayaz_</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          {!account && (
            <div className="text-center mb-12">
              <div className="max-w-4xl mx-auto">
                {/* Hero Logo */}
                <div className="flex justify-center mb-8">
                  <img src="/logo.svg" alt="ZamaVote Logo" className="w-32 h-32 animate-pulse" />
                </div>
                <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                  {translations[language].heroTitle.split(' ').slice(0, -2).join(' ')}
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> {translations[language].heroTitle.split(' ').slice(-2).join(' ')}</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  {translations[language].heroSubtitle}
                </p>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{translations[language].features.privacy.title}</h3>
                    <p className="text-gray-400 text-sm">{translations[language].features.privacy.desc}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{translations[language].features.verifiable.title}</h3>
                    <p className="text-gray-400 text-sm">{translations[language].features.verifiable.desc}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{translations[language].features.secure.title}</h3>
                    <p className="text-gray-400 text-sm">{translations[language].features.secure.desc}</p>
                  </div>
                </div>

                {/* Connect Button */}
                <button
                  onClick={connectWallet}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl text-white font-semibold text-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>{translations[language].connectWallet}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          {account && (
            <div className="max-w-7xl mx-auto">
              {/* Account Info */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
                      <img src="/logo.svg" alt="ZamaVote Logo" className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{translations[language].connectedAccount}</p>
                      <p className="font-mono text-white text-sm">{account.slice(0, 6)}...{account.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isOwner && (
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 16L3 5l5.5-3L12 4l3.5-2L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1-1.4L12 8.5 8.9 7.2 6.8 8.6 7.7 14z" />
                        </svg>
                        <span>{translations[language].admin}</span>
                      </span>
                    )}
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
                      Sepolia Testnet
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl mb-8 border border-gray-800 overflow-hidden">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('vote')}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${activeTab === 'vote'
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{translations[language].vote}</span>
                    </div>
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${activeTab === 'admin'
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{translations[language].management}</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Vote Tab */}
              {activeTab === 'vote' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white">{translations[language].activeVotings}</h2>
                    <div className="text-sm text-gray-400">
                      {votings.length} {translations[language].votingsFound}
                    </div>
                  </div>

                  {votings.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-800">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{translations[language].noVotings}</h3>
                      <p className="text-gray-400">{translations[language].noVotingsDesc}</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {votings.map((voting) => (
                        <div key={voting.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-white mb-3">
                                {voting.proposal}
                              </h3>
                              <div className="flex items-center space-x-6 text-sm text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  <span>ID: {voting.id}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>{voting.totalVoters} {translations[language].votes}</span>
                                </span>
                                {voting.active && (
                                  <span className="flex items-center space-x-1 text-green-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formatTimeRemaining(voting.timeRemaining)}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              {voting.active && (
                                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
                                  {translations[language].active}
                                </span>
                              )}
                              {voting.resultsRevealed && (
                                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
                                  {translations[language].resultsRevealed}
                                </span>
                              )}
                              {voting.hasVoted && (
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
                                  {translations[language].hasVoted}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Options */}
                          <div className="space-y-4">
                            {voting.options.map((option, index) => (
                              <div key={index} className="bg-white/5 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-white text-lg">{option}</span>

                                  {voting.resultsRevealed ? (
                                    <div className="flex items-center space-x-4">
                                      <span className="text-gray-300 font-medium">
                                        {voting.finalVotes[index]} {translations[language].votes}
                                      </span>
                                      <div className="w-32 bg-gray-700 rounded-full h-3">
                                        <div
                                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                                          style={{
                                            width: `${voting.totalVoters > 0
                                              ? (voting.finalVotes[index] / voting.totalVoters) * 100
                                              : 0}%`
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-gray-400 text-sm min-w-[3rem]">
                                        {voting.totalVoters > 0
                                          ? Math.round((voting.finalVotes[index] / voting.totalVoters) * 100)
                                          : 0}%
                                      </span>
                                    </div>
                                  ) : voting.active && !voting.hasVoted ? (
                                    <button
                                      onClick={() => castVote(voting.id, index)}
                                      disabled={loading}
                                      className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 font-medium transition-all duration-300 transform hover:scale-105"
                                    >
                                      {translations[language].voteButton}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Admin Actions */}
                          {isOwner && (
                            <div className="mt-6 pt-6 border-t border-gray-700 flex flex-wrap gap-3">
                              {!voting.active && !voting.resultsRevealed && (
                                <button
                                  onClick={() => startVoting(voting.id)}
                                  disabled={loading}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-medium transition-all duration-300"
                                >
                                  🚀 Başlat
                                </button>
                              )}

                              {voting.active && (
                                <button
                                  onClick={() => endVoting(voting.id)}
                                  disabled={loading}
                                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 font-medium transition-all duration-300"
                                >
                                  ⏹️ Bitir
                                </button>
                              )}

                              {!voting.active && !voting.resultsRevealed && (
                                <button
                                  onClick={() => revealResults(voting.id)}
                                  disabled={loading}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all duration-300"
                                >
                                  📊 Sonuçları Açıkla
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Admin Tab */}
              {activeTab === 'admin' && isOwner && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">{translations[language].adminPanel}</h2>
                    <p className="text-gray-400">{translations[language].adminDesc}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                    <h3 className="text-2xl font-bold text-white mb-6">{translations[language].createVoting}</h3>

                    <div className="space-y-6">
                      {/* Proposal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          {translations[language].votingTitle}
                        </label>
                        <input
                          type="text"
                          value={proposal}
                          onChange={(e) => setProposal(e.target.value)}
                          placeholder="Örn: Blockchain teknolojisi gelecekte yaygınlaşacak mı?"
                          className="w-full p-4 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>

                      {/* Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Seçenekler
                        </label>
                        <div className="space-y-3">
                          {options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...options];
                                  newOptions[index] = e.target.value;
                                  setOptions(newOptions);
                                }}
                                placeholder={`Seçenek ${index + 1}`}
                                className="flex-1 p-4 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                              />
                              {options.length > 2 && (
                                <button
                                  onClick={() => removeOption(index)}
                                  className="text-red-400 hover:text-red-300 p-2 transition-colors"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {options.length < 10 && (
                          <button
                            onClick={addOption}
                            className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Seçenek Ekle</span>
                          </button>
                        )}
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          {translations[language].duration}
                        </label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="1"
                          max="168"
                          className="w-full p-4 bg-white/5 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>

                      {/* Create Button */}
                      <button
                        onClick={createVoting}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 font-medium text-lg transition-all duration-300 transform hover:scale-105"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Oluşturuluyor...</span>
                          </div>
                        ) : (
                          translations[language].createButton
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-black/20 backdrop-blur-xl mt-16">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/logo.svg" alt="ZamaVote Logo" className="w-8 h-8" />
                </div>
                <span className="text-gray-400">© 2025 ZamaVote. Powered by Zama FHE  (Suat AYAZ) </span>
              </div>

              {/* Developer Credit - Footer */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">|</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Geliştiren:</span>
                  <a
                    href="https://x.com/suatayaz_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-purple-400 transition-colors font-medium"
                  >
                    @suatayaz_
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <a
                  href="https://x.com/suatayaz_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  X (Twitter)
                </a>
                <a
                  href="https://zama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Zama.ai
                </a>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400 text-sm">Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
