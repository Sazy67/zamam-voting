import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

const ZAMA_ADVANCED_ABI = [
    "function owner() view returns (address)",
    "function getVotingCount() view returns (uint256)",
    "function getAllVotingIds() view returns (uint256[])",
    "function getVotingInfo(uint256) view returns (string, string[], bool, bool, uint32[], uint256, uint256, uint256)",
    "function createAdvancedVoting(string, string[], uint256, uint256, bool, bool) returns (uint256)",
    "function createSimpleVoting(string, uint256) returns (uint256)",
    "function startVoting(uint256)",
    "function endVoting(uint256)",
    "function revealResults(uint256)",
    "function authorizeVoter(address)",
    "function authorizeMultipleVoters(address[])",
    "function revokeVoter(address)",
    "function extendVotingTime(uint256, uint256)",
    "function emergencyPause(uint256)",
    "function canVoteInVoting(uint256, address) view returns (bool)",
    "function getVoters(uint256) view returns (address[])",
    "function getWinner(uint256) view returns (string, uint32)",
    "function getTimeRemaining(uint256) view returns (uint256)"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ZAMA_ADVANCED_CONTRACT_ADDRESS || "0x...";

export default function ZamaAdvancedAdmin() {
    const { address, isConnected } = useAccount();
    const { writeContract } = useWriteContract();
    
    const [votings, setVotings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('create');
    
    // Form states
    const [proposal, setProposal] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [duration, setDuration] = useState(24);
    const [minVotes, setMinVotes] = useState(0);
    const [requiresMinVotes, setRequiresMinVotes] = useState(false);
    const [allowRevote, setAllowRevote] = useState(false);
    const [voterAddress, setVoterAddress] = useState('');
    const [multipleVoters, setMultipleVoters] = useState('');
    
    // Contract reads
    const { data: isOwner } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ZAMA_ADVANCED_ABI,
        functionName: 'owner',
        query: {
            select: (data) => data?.toLowerCase() === address?.toLowerCase()
        }
    });
    
    const { data: votingCount } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ZAMA_ADVANCED_ABI,
        functionName: 'getVotingCount'
    });
    
    // Demo oylamaları yükle
    const loadVotings = async () => {
        if (!votingCount) return;
        
        setLoading(true);
        try {
            // Demo oylamaları oluştur
            const demoVotings = [];
            const count = Number(votingCount) || 5;
            
            for (let i = 0; i < count; i++) {
                const now = Date.now();
                const states = ['pending', 'active', 'ended', 'revealed'];
                const state = states[i % states.length];
                
                demoVotings.push({
                    id: i,
                    proposal: `Demo Oylama #${i + 1}: ${
                        i === 0 ? "Blockchain teknolojisi gelecekte yaygınlaşacak mı?" :
                        i === 1 ? "Hangi programlama dili en popüler olacak?" :
                        i === 2 ? "En iyi kripto para birimi hangisidir?" :
                        i === 3 ? "Web3 teknolojileri ne zaman mainstream olacak?" :
                        "DeFi protokolleri geleneksel bankacılığı değiştirecek mi?"
                    }`,
                    options: i % 2 === 0 ? ["Evet", "Hayır"] : 
                            i === 1 ? ["JavaScript", "Python", "Rust"] :
                            i === 2 ? ["Bitcoin", "Ethereum", "Solana"] :
                            ["2024", "2025", "2026", "Daha sonra"],
                    active: state === 'active',
                    resultsRevealed: state === 'revealed',
                    finalVotes: state === 'revealed' ? 
                        (i % 2 === 0 ? [67, 43] : [34, 28, 22, 16]) : 
                        [],
                    createdAt: new Date(now - (i + 1) * 24 * 60 * 60 * 1000),
                    endTime: new Date(now + (state === 'active' ? 12 : -12) * 60 * 60 * 1000),
                    totalVoters: state === 'revealed' ? 110 + i * 10 : Math.floor(Math.random() * 30),
                    timeRemaining: state === 'active' ? 12 * 60 * 60 - (i * 2 * 60 * 60) : 0
                });
            }
            
            setVotings(demoVotings);
        } catch (error) {
            console.error('Demo oylamalar yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (votingCount) {
            loadVotings();
        }
    }, [votingCount]);
    
    // Seçenek ekleme/çıkarma
    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };
    
    const removeOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };
    
    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };
    
    // Gelişmiş oylama oluştur
    const createAdvancedVoting = async () => {
        if (!proposal.trim() || options.some(opt => !opt.trim())) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }
        
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'createAdvancedVoting',
                args: [
                    proposal,
                    options.filter(opt => opt.trim()),
                    duration,
                    minVotes,
                    requiresMinVotes,
                    allowRevote
                ]
            });
            
            // Form'u temizle
            setProposal('');
            setOptions(['', '']);
            setDuration(24);
            setMinVotes(0);
            setRequiresMinVotes(false);
            setAllowRevote(false);
            
            alert('Gelişmiş oylama oluşturuldu!');
            loadVotings();
        } catch (error) {
            console.error('Oylama oluşturulamadı:', error);
            alert('Hata: ' + error.message);
        }
    };
    
    // Basit oylama oluştur
    const createSimpleVoting = async () => {
        if (!proposal.trim()) {
            alert('Lütfen öneri girin');
            return;
        }
        
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'createSimpleVoting',
                args: [proposal, duration]
            });
            
            setProposal('');
            alert('Basit oylama oluşturuldu!');
            loadVotings();
        } catch (error) {
            console.error('Oylama oluşturulamadı:', error);
            alert('Hata: ' + error.message);
        }
    };
    
    // Oylama yönetimi
    const startVoting = async (votingId) => {
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'startVoting',
                args: [votingId]
            });
            alert('Oylama başlatıldı!');
            loadVotings();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };
    
    const endVoting = async (votingId) => {
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'endVoting',
                args: [votingId]
            });
            alert('Oylama sonlandırıldı!');
            loadVotings();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };
    
    const revealResults = async (votingId) => {
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'revealResults',
                args: [votingId]
            });
            alert('Sonuçlar açıklandı!');
            loadVotings();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };
    
    // Seçmen yönetimi
    const authorizeVoter = async () => {
        if (!voterAddress.trim()) {
            alert('Lütfen geçerli bir adres girin');
            return;
        }
        
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'authorizeVoter',
                args: [voterAddress]
            });
            setVoterAddress('');
            alert('Seçmen yetkilendirildi!');
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };
    
    const authorizeMultipleVoters = async () => {
        const addresses = multipleVoters.split('\n').map(addr => addr.trim()).filter(addr => addr);
        
        if (addresses.length === 0) {
            alert('Lütfen en az bir adres girin');
            return;
        }
        
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'authorizeMultipleVoters',
                args: [addresses]
            });
            setMultipleVoters('');
            alert(`${addresses.length} seçmen yetkilendirildi!`);
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };
    
    const formatTimeRemaining = (seconds) => {
        if (seconds <= 0) return 'Süresi dolmuş';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours} saat ${minutes} dakika`;
        }
        return `${minutes} dakika`;
    };
    
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">🔐 Zama Advanced Admin</h1>
                    <p className="text-xl">Lütfen cüzdanınızı bağlayın</p>
                </div>
            </div>
        );
    }
    
    if (!isOwner) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">⛔ Erişim Reddedildi</h1>
                    <p className="text-xl">Bu sayfaya sadece contract owner'ı erişebilir</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        🔐 Zama Advanced Admin Panel
                    </h1>
                    <p className="text-xl text-blue-200">
                        Gelişmiş şifreli oylama sistemi yönetimi
                    </p>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-1">
                        {[
                            { id: 'create', label: '🗳️ Oylama Oluştur', icon: '🗳️' },
                            { id: 'manage', label: '⚙️ Yönetim', icon: '⚙️' },
                            { id: 'voters', label: '👥 Seçmenler', icon: '👥' },
                            { id: 'analytics', label: '📊 Analitik', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-purple-900 shadow-lg'
                                        : 'text-white hover:bg-white/20'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Tab Content */}
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'create' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Gelişmiş Oylama */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-6">🚀 Gelişmiş Oylama</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Öneri</label>
                                        <input
                                            type="text"
                                            value={proposal}
                                            onChange={(e) => setProposal(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60"
                                            placeholder="Oylama konusunu girin..."
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Seçenekler ({options.length}/10)
                                        </label>
                                        {options.map((option, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(index, e.target.value)}
                                                    className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-white/60"
                                                    placeholder={`Seçenek ${index + 1}`}
                                                />
                                                {options.length > 2 && (
                                                    <button
                                                        onClick={() => removeOption(index)}
                                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                    >
                                                        ❌
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {options.length < 10 && (
                                            <button
                                                onClick={addOption}
                                                className="w-full p-2 border-2 border-dashed border-white/40 text-white rounded-lg hover:border-white/60"
                                            >
                                                ➕ Seçenek Ekle
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Süre (Saat)</label>
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(Number(e.target.value))}
                                                className="w-full p-3 rounded-lg bg-white/20 text-white"
                                                min="1"
                                                max="168"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Min. Oy</label>
                                            <input
                                                type="number"
                                                value={minVotes}
                                                onChange={(e) => setMinVotes(Number(e.target.value))}
                                                className="w-full p-3 rounded-lg bg-white/20 text-white"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="flex items-center text-white">
                                            <input
                                                type="checkbox"
                                                checked={requiresMinVotes}
                                                onChange={(e) => setRequiresMinVotes(e.target.checked)}
                                                className="mr-2"
                                            />
                                            Minimum oy sayısı zorunlu
                                        </label>
                                        
                                        <label className="flex items-center text-white">
                                            <input
                                                type="checkbox"
                                                checked={allowRevote}
                                                onChange={(e) => setAllowRevote(e.target.checked)}
                                                className="mr-2"
                                            />
                                            Oy değiştirmeye izin ver
                                        </label>
                                    </div>
                                    
                                    <button
                                        onClick={createAdvancedVoting}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                                    >
                                        🚀 Gelişmiş Oylama Oluştur
                                    </button>
                                </div>
                            </div>
                            
                            {/* Basit Oylama */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-6">⚡ Hızlı Oylama</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Öneri</label>
                                        <input
                                            type="text"
                                            value={proposal}
                                            onChange={(e) => setProposal(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60"
                                            placeholder="Evet/Hayır oylaması için öneri..."
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Süre (Saat)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            className="w-full p-3 rounded-lg bg-white/20 text-white"
                                            min="1"
                                            max="168"
                                        />
                                    </div>
                                    
                                    <div className="bg-blue-500/20 p-4 rounded-lg">
                                        <p className="text-blue-200 text-sm">
                                            ℹ️ Basit oylama otomatik olarak "EVET" ve "HAYIR" seçenekleri ile oluşturulur.
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={createSimpleVoting}
                                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
                                    >
                                        ⚡ Hızlı Oylama Oluştur
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'manage' && (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">⚙️ Oylama Yönetimi</h2>
                            
                            {loading ? (
                                <div className="text-center text-white">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                    <p>Oylamalar yükleniyor...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {votings.map((voting) => (
                                        <div key={voting.id} className="bg-white/10 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{voting.proposal}</h3>
                                                    <p className="text-blue-200">
                                                        Seçenekler: {voting.options.join(', ')}
                                                    </p>
                                                    <p className="text-sm text-gray-300">
                                                        Oluşturulma: {voting.createdAt.toLocaleString('tr-TR')}
                                                    </p>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        voting.active 
                                                            ? 'bg-green-500 text-white' 
                                                            : voting.resultsRevealed 
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-500 text-white'
                                                    }`}>
                                                        {voting.active ? '🟢 Aktif' : voting.resultsRevealed ? '📊 Tamamlandı' : '⏸️ Beklemede'}
                                                    </div>
                                                    <p className="text-sm text-gray-300 mt-1">
                                                        {formatTimeRemaining(voting.timeRemaining)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 flex-wrap">
                                                {!voting.active && !voting.resultsRevealed && (
                                                    <button
                                                        onClick={() => startVoting(voting.id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        ▶️ Başlat
                                                    </button>
                                                )}
                                                
                                                {voting.active && (
                                                    <button
                                                        onClick={() => endVoting(voting.id)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                    >
                                                        ⏹️ Durdur
                                                    </button>
                                                )}
                                                
                                                {!voting.active && !voting.resultsRevealed && (
                                                    <button
                                                        onClick={() => revealResults(voting.id)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        📊 Sonuçları Açıkla
                                                    </button>
                                                )}
                                                
                                                <div className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                                                    👥 {voting.totalVoters} oy
                                                </div>
                                            </div>
                                            
                                            {voting.resultsRevealed && (
                                                <div className="mt-4 bg-white/10 rounded-lg p-3">
                                                    <h4 className="font-semibold text-white mb-2">📊 Sonuçlar:</h4>
                                                    {voting.options.map((option, index) => (
                                                        <div key={index} className="flex justify-between text-white">
                                                            <span>{option}:</span>
                                                            <span className="font-semibold">{voting.finalVotes[index]} oy</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {votings.length === 0 && (
                                        <div className="text-center text-white py-8">
                                            <p className="text-xl">Henüz oylama oluşturulmamış</p>
                                            <p className="text-gray-300">İlk oylamanızı oluşturmak için "Oylama Oluştur" sekmesini kullanın</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'voters' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Tekil Seçmen */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-6">👤 Seçmen Yetkilendir</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Seçmen Adresi</label>
                                        <input
                                            type="text"
                                            value={voterAddress}
                                            onChange={(e) => setVoterAddress(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60"
                                            placeholder="0x..."
                                        />
                                    </div>
                                    
                                    <button
                                        onClick={authorizeVoter}
                                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
                                    >
                                        ✅ Yetkilendir
                                    </button>
                                </div>
                            </div>
                            
                            {/* Toplu Seçmen */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-6">👥 Toplu Yetkilendirme</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-semibold mb-2">
                                            Seçmen Adresleri (Her satıra bir adres)
                                        </label>
                                        <textarea
                                            value={multipleVoters}
                                            onChange={(e) => setMultipleVoters(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 h-32"
                                            placeholder="0x123...&#10;0x456...&#10;0x789..."
                                        />
                                    </div>
                                    
                                    <button
                                        onClick={authorizeMultipleVoters}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                                    >
                                        🚀 Toplu Yetkilendir
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'analytics' && (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">📊 Sistem Analitikleri</h2>
                            
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-white">{votings.length}</div>
                                    <div className="text-blue-200">Toplam Oylama</div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-white">
                                        {votings.filter(v => v.active).length}
                                    </div>
                                    <div className="text-green-200">Aktif Oylama</div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-white">
                                        {votings.reduce((sum, v) => sum + v.totalVoters, 0)}
                                    </div>
                                    <div className="text-purple-200">Toplam Oy</div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-white">📈 Oylama Geçmişi</h3>
                                
                                {votings.map((voting) => (
                                    <div key={voting.id} className="bg-white/10 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-white">{voting.proposal}</h4>
                                                <p className="text-sm text-gray-300">
                                                    {voting.createdAt.toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-white">
                                                    {voting.totalVoters} oy
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {voting.options.length} seçenek
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {voting.resultsRevealed && (
                                            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {voting.options.map((option, index) => (
                                                    <div key={index} className="bg-white/10 rounded p-2 text-center">
                                                        <div className="text-sm text-gray-300">{option}</div>
                                                        <div className="font-bold text-white">
                                                            {voting.finalVotes[index]}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}