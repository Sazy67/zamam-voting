import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { translateVoting } from '../utils/translator';

// Language translations
const translations = {
  tr: {
    // Navigation
    dashboard: "Kontrol Paneli",
    createVoting: "Oylama Oluştur",
    manageVotings: "Oylamaları Yönet",
    voterManagement: "Oy Veren Yönetimi",
    
    // Stats
    totalVotings: "Toplam Oylama",
    activeVotings: "Aktif Oylama",
    totalVotes: "Toplam Oy",
    completedVotings: "Tamamlanan Oylama",
    
    // Status
    active: "Aktif",
    completed: "Tamamlandı",
    pending: "Beklemede",
    voted: "Oy Verildi",
    
    // Time
    hours: "saat",
    minutes: "dakika",
    timeExpired: "Süresi doldu",
    remaining: "Kalan",
    
    // Forms
    votingTitle: "Oylama Başlığı",
    votingDuration: "Oylama Süresi (Saat)",
    customDuration: "Özel süre (saat)",
    
    // Buttons
    create: "Oluştur",
    start: "Başlat",
    end: "Bitir",
    reveal: "Sonuçları Açıkla",
    delete: "Sil",
    authorize: "Yetki Ver",
    
    // Messages
    votingCreated: "Oylama başarıyla oluşturuldu!",
    votingStarted: "Oylama başlatıldı!",
    votingEnded: "Oylama bitirildi!",
    resultsRevealed: "Sonuçlar açıklandı!",
    voterAuthorized: "Oy verme yetkisi verildi!",
    votingDeleted: "Oylama başarıyla silindi!",
    
    // Errors
    createError: "Oylama oluşturulurken hata: ",
    startError: "Oylama başlatılırken hata: ",
    endError: "Oylama bitirilirken hata: ",
    revealError: "Sonuçlar açıklanırken hata: ",
    deleteError: "Oylama silinirken hata: ",
    
    // Confirmations
    confirmEnd: "Oylama süresi henüz dolmadı",
    forceEnd: "Yine de oylamayı zorla bitirmek istiyor musunuz?",
    confirmDelete: "Bu oylamayı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!",
    
    // Descriptions
    adminDesc: "Detaylı oylama parametreleri ile yeni oylama oluşturun",
    recentVotings: "Son Oylamalar"
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    createVoting: "Create Voting",
    manageVotings: "Manage Votings",
    voterManagement: "Voter Management",
    
    // Stats
    totalVotings: "Total Votings",
    activeVotings: "Active Votings",
    totalVotes: "Total Votes",
    completedVotings: "Completed Votings",
    
    // Status
    active: "Active",
    completed: "Completed",
    pending: "Pending",
    voted: "Voted",
    
    // Time
    hours: "hours",
    minutes: "minutes",
    timeExpired: "Time expired",
    remaining: "Remaining",
    
    // Forms
    votingTitle: "Voting Title",
    votingDuration: "Voting Duration (Hours)",
    customDuration: "Custom duration (hours)",
    
    // Buttons
    create: "Create",
    start: "Start",
    end: "End",
    reveal: "Reveal Results",
    delete: "Delete",
    authorize: "Authorize",
    
    // Messages
    votingCreated: "Voting created successfully!",
    votingStarted: "Voting started!",
    votingEnded: "Voting ended!",
    resultsRevealed: "Results revealed!",
    voterAuthorized: "Voter authorization granted!",
    votingDeleted: "Voting deleted successfully!",
    
    // Errors
    createError: "Error creating voting: ",
    startError: "Error starting voting: ",
    endError: "Error ending voting: ",
    revealError: "Error revealing results: ",
    deleteError: "Error deleting voting: ",
    
    // Confirmations
    confirmEnd: "Voting period has not ended yet",
    forceEnd: "Do you still want to force end the voting?",
    confirmDelete: "Are you sure you want to permanently delete this voting? This action cannot be undone!",
    
    // Descriptions
    adminDesc: "Create new voting with detailed voting parameters",
    recentVotings: "Recent Votings"
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
    "function removeVoterAuthorization(address)",
    "function hasVotedInVoting(uint256, address) view returns (bool)",
    "function canVoteInVoting(uint256, address) view returns (bool)",
    "function getTimeRemaining(uint256) view returns (uint256)",
    "function getVoters(uint256) view returns (address[])",
    "function deleteVoting(uint256)",
    "function isVotingDeleted(uint256) view returns (bool)"
];

export default function AdminPanel() {
    const [account, setAccount] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [votings, setVotings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [language, setLanguage] = useState('tr');
    
    // Form states
    const [proposal, setProposal] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [duration, setDuration] = useState(24);
    const [voterAddress, setVoterAddress] = useState('');
    
    // Stats
    const [stats, setStats] = useState({
        totalVotings: 0,
        activeVotings: 0,
        totalVotes: 0,
        completedVotings: 0
    });
    
    // Add Sepolia network to MetaMask (usually not needed as it's built-in)
    const addSepoliaNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0xaa36a7', // 11155111 in hex
                    chainName: 'Sepolia Testnet',
                    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                    nativeCurrency: {
                        name: 'Ethereum',
                        symbol: 'ETH',
                        decimals: 18,
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                }],
            });
            return true;
        } catch (error) {
            console.error('Failed to add Sepolia network:', error);
            return false;
        }
    };

    // Switch to Sepolia network
    const switchToSepoliaNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
            });
            return true;
        } catch (error) {
            if (error.code === 4902) {
                // Network not added, try to add it
                return await addSepoliaNetwork();
            }
            console.error('Failed to switch to Sepolia network:', error);
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
                console.log('Admin - Current network:', network);
                console.log('Admin - Chain ID:', network.chainId);

                // Check if we're on Sepolia network
                if (Number(network.chainId) !== 11155111) {
                    const switched = await switchToSepoliaNetwork();
                    if (!switched) {
                        alert('Lütfen MetaMask\'ta Sepolia Testnet\'e geçin!');
                        return;
                    }
                    // Reload after network switch
                    window.location.reload();
                    return;
                }

                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setAccount(address);
                
                // Check if owner
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
                console.log('Admin - Checking owner...');
                console.log('Admin - Connected address:', address);
                console.log('Admin - Contract address:', CONTRACT_ADDRESS);
                
                try {
                  const owner = await contract.owner();
                  console.log('Admin - Contract owner:', owner);
                  console.log('Admin - Address match:', address.toLowerCase() === owner.toLowerCase());
                  setIsOwner(address.toLowerCase() === owner.toLowerCase());
                  
                  if (address.toLowerCase() === owner.toLowerCase()) {
                      await loadData();
                  }
                } catch (error) {
                  console.error('Admin - Owner check failed:', error);
                  setIsOwner(false);
                }
            } catch (error) {
                console.error('Wallet connection failed:', error);
            }
        } else {
            alert('MetaMask bulunamadı! Lütfen MetaMask yükleyin.');
        }
    };
    
    // Load all data
    const loadData = async (currentLanguage = language) => {
        await Promise.all([loadVotings(currentLanguage), loadStats()]);
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
                    timeRemaining: Number(timeRemaining)
                };

                // Dil ayarına göre çeviri uygula
                if (currentLanguage === 'en') {
                    console.log('Admin - Translating voting:', votingData.proposal);
                    votingData = translateVoting(votingData, currentLanguage);
                    console.log('Admin - Translated to:', votingData.proposal);
                }

                votingList.push(votingData);
            }
            
            setVotings(votingList);
        } catch (error) {
            console.error('Error loading votings:', error);
        }
    };
    
    // Load stats
    const loadStats = async () => {
        if (!account) return;
        
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            
            const count = await contract.getVotingCount();
            let activeCount = 0;
            let totalVotes = 0;
            let completedCount = 0;
            
            for (let i = 0; i < Number(count); i++) {
                const info = await contract.getVotingInfo(i);
                const active = info[2];
                const resultsRevealed = info[3];
                const voterCount = Number(info[7]);
                
                if (active) activeCount++;
                if (resultsRevealed) completedCount++;
                totalVotes += voterCount;
            }
            
            setStats({
                totalVotings: Number(count),
                activeVotings: activeCount,
                totalVotes,
                completedVotings: completedCount
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };
    
    // Create voting
    const createVoting = async () => {
        if (!proposal.trim() || options.some(opt => !opt.trim())) {
            alert('Lütfen tüm alanları doldurun!');
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
            await loadData();
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
            await loadData();
        } catch (error) {
            console.error('Error starting voting:', error);
            alert(translations[language].startError + error.message);
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
            
            // Önce süre kontrolü yap
            const timeRemaining = await contract.getTimeRemaining(votingId);
            
            if (Number(timeRemaining) > 0) {
                const confirmEnd = confirm(
                    `${translations[language].confirmEnd} (${Math.floor(Number(timeRemaining) / 3600)} ${translations[language].hours} ${Math.floor((Number(timeRemaining) % 3600) / 60)} ${translations[language].minutes} kaldı). ` +
                    translations[language].forceEnd
                );
                
                if (!confirmEnd) {
                    setLoading(false);
                    return;
                }
            }
            
            const tx = await contract.endVoting(votingId);
            await tx.wait();
            
            alert(translations[language].votingEnded);
            await loadData();
        } catch (error) {
            console.error('Error ending voting:', error);
            
            // Hata mesajını daha anlaşılır hale getir
            let errorMessage = error.message;
            if (errorMessage.includes('Voting period not ended')) {
                errorMessage = 'Bu oylama henüz süre dolmadan bitirilemez. Lütfen sürenin dolmasını bekleyin veya contract sahibi ile iletişime geçin.';
            } else if (errorMessage.includes('Oylama zaten bitmis')) {
                errorMessage = 'Bu oylama zaten bitmiş durumda.';
            }
            
            alert(translations[language].endError + errorMessage);
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
            await loadData();
        } catch (error) {
            console.error('Error revealing results:', error);
            alert(translations[language].revealError + error.message);
        }
        setLoading(false);
    };
    
    // Authorize voter
    const authorizeVoter = async () => {
        if (!voterAddress.trim()) {
            alert('Lütfen geçerli bir adres girin!');
            return;
        }
        
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.authorizeVoter(voterAddress.trim());
            await tx.wait();
            
            alert(translations[language].voterAuthorized);
            setVoterAddress('');
        } catch (error) {
            console.error('Error authorizing voter:', error);
            alert('Yetki verirken hata: ' + error.message);
        }
        setLoading(false);
    };
    
    // Delete voting
    const deleteVoting = async (votingId) => {
        const confirmDelete = confirm(
            translations[language].confirmDelete
        );
        
        if (!confirmDelete) return;
        
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            const tx = await contract.deleteVoting(votingId);
            await tx.wait();
            
            alert(translations[language].votingDeleted);
            await loadData();
        } catch (error) {
            console.error('Error deleting voting:', error);
            alert(translations[language].deleteError + error.message);
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
        if (seconds <= 0) return translations[language].timeExpired;
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours} ${translations[language].hours} ${minutes} ${translations[language].minutes}`;
        }
        return `${minutes} ${translations[language].minutes}`;
    };
    
    useEffect(() => {
        if (account && isOwner) {
            loadData(language);
            const interval = setInterval(() => loadData(language), 30000);
            return () => clearInterval(interval);
        }
    }, [account, isOwner, language]); // language dependency eklendi
    
    if (!account) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Admin Panel</h2>
                    <p className="text-gray-400 mb-6">Yönetim paneline erişmek için cüzdanınızı bağlayın</p>
                    <button
                        onClick={connectWallet}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 font-medium"
                    >
                        MetaMask ile Bağlan
                    </button>
                </div>
            </div>
        );
    }
    
    if (!isOwner) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Erişim Reddedildi</h2>
                    <p className="text-gray-400 mb-6">Bu sayfaya sadece contract owner'ı erişebilir.</p>
                    <a 
                        href="/"
                        className="inline-block bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 font-medium"
                    >
                        Ana Sayfaya Dön
                    </a>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-30">
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
                                    <h1 className="text-2xl font-bold text-white">ZamaVote Admin</h1>
                                    <p className="text-gray-400 text-sm">Gelişmiş Yönetim Paneli</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {/* Language Switcher */}
                                <div className="flex bg-white/10 rounded-lg p-1">
                                    <button
                                        onClick={() => {
                                            setLanguage('tr');
                                            if (account) loadData('tr');
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
                                            if (account) loadData('en');
                                        }}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${language === 'en'
                                            ? 'bg-white text-purple-900'
                                            : 'text-white hover:bg-white/20'
                                            }`}
                                    >
                                        🇺🇸 EN
                                    </button>
                                </div>
                                
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Admin</p>
                                    <p className="font-mono text-white text-sm">{account.slice(0, 6)}...{account.slice(-4)}</p>
                                </div>
                                <a 
                                    href="/"
                                    className="bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    {language === 'tr' ? 'Ana Sayfa' : 'Home'}
                                </a>
                            </div>
                        </div>
                    </div>
                </header>
                
                <div className="container mx-auto px-6 py-8">
                    <div className="flex gap-8">
                        {/* Sidebar */}
                        <div className="w-64 space-y-2">
                            <nav className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-gray-800">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveSection('dashboard')}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                            activeSection === 'dashboard'
                                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <span>Dashboard</span>
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => setActiveSection('create')}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                            activeSection === 'create'
                                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Oylama Oluştur</span>
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => setActiveSection('manage')}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                            activeSection === 'manage'
                                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <span>Oylamaları Yönet</span>
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => setActiveSection('voters')}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                                            activeSection === 'voters'
                                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Oy Veren Yönetimi</span>
                                        </div>
                                    </button>
                                </div>
                            </nav>
                        </div>
                        
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Dashboard */}
                            {activeSection === 'dashboard' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                                        <p className="text-gray-400">Sistem genel durumu ve istatistikler</p>
                                    </div>
                                    
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-400 text-sm">Toplam Oylama</p>
                                                    <p className="text-3xl font-bold text-white">{stats.totalVotings}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-400 text-sm">Aktif Oylama</p>
                                                    <p className="text-3xl font-bold text-white">{stats.activeVotings}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-400 text-sm">Toplam Oy</p>
                                                    <p className="text-3xl font-bold text-white">{stats.totalVotes}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-400 text-sm">Tamamlanan</p>
                                                    <p className="text-3xl font-bold text-white">{stats.completedVotings}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Recent Votings */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                                        <h3 className="text-xl font-bold text-white mb-6">Son Oylamalar</h3>
                                        <div className="space-y-4">
                                            {votings.slice(0, 5).map((voting) => (
                                                <div key={voting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-gray-700">
                                                    <div>
                                                        <h4 className="font-medium text-white">{voting.proposal}</h4>
                                                        <p className="text-sm text-gray-400">
                                                            {voting.totalVoters} oy • {voting.active ? 'Aktif' : voting.resultsRevealed ? 'Tamamlandı' : 'Beklemede'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {voting.active && (
                                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Aktif</span>
                                                        )}
                                                        {voting.resultsRevealed && (
                                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Tamamlandı</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Create Voting */}
                            {activeSection === 'create' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Yeni Oylama Oluştur</h2>
                                        <p className="text-gray-400">Detaylı oylama parametreleri ile yeni oylama oluşturun</p>
                                    </div>
                                    
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                                        <div className="space-y-6">
                                            {/* Proposal */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                                    Oylama Başlığı *
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
                                                    Seçenekler *
                                                </label>
                                                <div className="space-y-3">
                                                    {options.map((option, index) => (
                                                        <div key={index} className="flex items-center space-x-3">
                                                            <div className="flex-1 relative">
                                                                <input
                                                                    type="text"
                                                                    value={option}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...options];
                                                                        newOptions[index] = e.target.value;
                                                                        setOptions(newOptions);
                                                                    }}
                                                                    placeholder={`Seçenek ${index + 1}`}
                                                                    className="w-full p-4 pl-12 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                                                />
                                                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                    {index + 1}
                                                                </div>
                                                            </div>
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
                                                    Oylama Süresi (Saat) *
                                                </label>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[1, 6, 12, 24, 48, 72, 168].map((hours) => (
                                                        <button
                                                            key={hours}
                                                            onClick={() => setDuration(hours)}
                                                            className={`p-3 rounded-xl border transition-all duration-300 ${
                                                                duration === hours
                                                                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-transparent'
                                                                    : 'bg-white/5 text-gray-300 border-gray-700 hover:border-gray-600'
                                                            }`}
                                                        >
                                                            {hours < 24 ? `${hours}s` : `${hours / 24}g`}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input
                                                    type="number"
                                                    value={duration}
                                                    onChange={(e) => setDuration(Number(e.target.value))}
                                                    min="1"
                                                    max="168"
                                                    className="mt-3 w-full p-4 bg-white/5 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                                    placeholder="Özel süre (saat)"
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
                                                    'Oylama Oluştur'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Manage Votings */}
                            {activeSection === 'manage' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Oylamaları Yönet</h2>
                                        <p className="text-gray-400">Mevcut oylamaları başlatın, durdurun ve sonuçları açıklayın</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {votings.map((voting) => (
                                            <div key={voting.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-white mb-2">{voting.proposal}</h3>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                                                            <span>ID: {voting.id}</span>
                                                            <span>Oy: {voting.totalVoters}</span>
                                                            <span>Oluşturulma: {voting.createdAt.toLocaleDateString('tr-TR')}</span>
                                                            {voting.active && (
                                                                <span className="text-green-400">
                                                                    Kalan: {formatTimeRemaining(voting.timeRemaining)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Options with Results */}
                                                        <div className="space-y-3 mb-6">
                                                            {voting.options.map((option, index) => (
                                                                <div key={index} className="bg-white/5 rounded-xl p-4 border border-gray-700">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-medium text-white">{option}</span>
                                                                        
                                                                        {voting.resultsRevealed ? (
                                                                            <div className="flex items-center space-x-4">
                                                                                <span className="text-gray-300 font-medium">
                                                                                    {voting.finalVotes[index]} oy
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
                                                                        ) : (
                                                                            <span className="text-gray-500 text-sm">
                                                                                Sonuçlar henüz açıklanmadı
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col space-y-2 ml-6">
                                                        {voting.active && (
                                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">Aktif</span>
                                                        )}
                                                        {voting.resultsRevealed && (
                                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Tamamlandı</span>
                                                        )}
                                                        {!voting.active && !voting.resultsRevealed && (
                                                            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">Beklemede</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                                    <div className="flex flex-wrap gap-2">
                                                        {!voting.active && !voting.resultsRevealed && (
                                                            <button
                                                                onClick={() => startVoting(voting.id)}
                                                                disabled={loading}
                                                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-medium transition-all duration-300 text-sm"
                                                            >
                                                                🚀 Başlat
                                                            </button>
                                                        )}
                                                        
                                                        {voting.active && (
                                                            <button
                                                                onClick={() => endVoting(voting.id)}
                                                                disabled={loading}
                                                                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 font-medium transition-all duration-300 text-sm"
                                                            >
                                                                ⏹️ Bitir
                                                            </button>
                                                        )}
                                                        
                                                        {!voting.active && !voting.resultsRevealed && (
                                                            <button
                                                                onClick={() => revealResults(voting.id)}
                                                                disabled={loading}
                                                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all duration-300 text-sm"
                                                            >
                                                                📊 Sonuçlar
                                                            </button>
                                                        )}
                                                        
                                                        {voting.resultsRevealed && (
                                                            <div className="flex items-center space-x-2 text-green-400 text-sm">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="font-medium">Tamamlandı</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Delete Button - Always visible */}
                                                    <button
                                                        onClick={() => deleteVoting(voting.id)}
                                                        disabled={loading}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-all duration-300 text-sm border border-red-500 flex items-center gap-1"
                                                        title="Bu oylamayı kalıcı olarak sil"
                                                    >
                                                        🗑️ Sil
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Voter Management */}
                            {activeSection === 'voters' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Oy Veren Yönetimi</h2>
                                        <p className="text-gray-400">Kullanıcılara oy verme yetkisi verin veya kaldırın</p>
                                    </div>
                                    
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
                                        <h3 className="text-xl font-bold text-white mb-6">Yetki Ver</h3>
                                        <div className="flex space-x-4">
                                            <input
                                                type="text"
                                                value={voterAddress}
                                                onChange={(e) => setVoterAddress(e.target.value)}
                                                placeholder="0x... (Ethereum adresi)"
                                                className="flex-1 p-4 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                            />
                                            <button
                                                onClick={authorizeVoter}
                                                disabled={loading}
                                                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 font-medium transition-all duration-300"
                                            >
                                                Yetki Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}