import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';

const ZAMA_ADVANCED_ABI = [
    "function getVotingCount() view returns (uint256)",
    "function getAllVotingIds() view returns (uint256[])",
    "function getVotingInfo(uint256) view returns (string, string[], bool, bool, uint32[], uint256, uint256, uint256)",
    "function hasVoted(uint256, address) view returns (bool)",
    "function canVoteInVoting(uint256, address) view returns (bool)",
    "function vote(uint256, uint32)",
    "function revote(uint256, uint32)",
    "function getTimeRemaining(uint256) view returns (uint256)",
    "function getWinner(uint256) view returns (string, uint32)",
    "function getVoters(uint256) view returns (address[])"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ZAMA_ADVANCED_CONTRACT_ADDRESS || "0x...";

export default function ZamaAdvancedVote() {
    const { address, isConnected } = useAccount();
    const { writeContract } = useWriteContract();
    
    const [votings, setVotings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVoting, setSelectedVoting] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [filter, setFilter] = useState('active'); // active, completed, all
    
    // Contract reads
    const { data: votingCount } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ZAMA_ADVANCED_ABI,
        functionName: 'getVotingCount'
    });
    
    // Basit demo verisi - gerçek implementasyon için contract çağrıları gerekli
    const loadVotings = async () => {
        if (!votingCount) return;
        
        setLoading(true);
        try {
            // Demo oylamaları oluştur
            const demoVotings = [];
            const count = Number(votingCount) || 3; // En az 3 demo oylama
            
            for (let i = 0; i < count; i++) {
                const now = Date.now();
                const isActive = i < 2; // İlk 2 oylama aktif
                const hasResults = i === 2; // Son oylama tamamlanmış
                
                demoVotings.push({
                    id: i,
                    proposal: i === 0 ? "Blockchain teknolojisi gelecekte yaygınlaşacak mı?" :
                             i === 1 ? "Hangi programlama dili en popüler olacak?" :
                             "En iyi kripto para birimi hangisidir?",
                    options: i === 0 ? ["Evet", "Hayır"] :
                            i === 1 ? ["JavaScript", "Python", "Rust", "Go"] :
                            ["Bitcoin", "Ethereum", "Solana", "Cardano"],
                    active: isActive,
                    resultsRevealed: hasResults,
                    finalVotes: hasResults ? [45, 32, 23, 15] : [0, 0, 0, 0],
                    createdAt: new Date(now - (i + 1) * 24 * 60 * 60 * 1000),
                    endTime: new Date(now + (isActive ? 24 : -24) * 60 * 60 * 1000),
                    totalVoters: hasResults ? 115 : Math.floor(Math.random() * 50),
                    hasVoted: i === 2, // Son oylamada oy vermiş
                    canVote: isActive && address && i !== 2,
                    timeRemaining: isActive ? 24 * 60 * 60 - (i * 6 * 60 * 60) : 0,
                    winner: hasResults ? { name: "Bitcoin", votes: 45 } : null
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
        if (votingCount && address) {
            loadVotings();
        }
    }, [votingCount, address]);
    
    // Oy verme
    const castVote = async (votingId, optionIndex) => {
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'vote',
                args: [votingId, optionIndex]
            });
            
            alert('🎉 Oyunuz başarıyla kaydedildi!');
            setSelectedVoting(null);
            setSelectedOption(null);
            loadVotings();
        } catch (error) {
            console.error('Oy verilemedi:', error);
            alert('Hata: ' + error.message);
        }
    };
    
    // Oy değiştirme
    const changeVote = async (votingId, optionIndex) => {
        try {
            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: ZAMA_ADVANCED_ABI,
                functionName: 'revote',
                args: [votingId, optionIndex]
            });
            
            alert('🔄 Oyunuz başarıyla değiştirildi!');
            setSelectedVoting(null);
            setSelectedOption(null);
            loadVotings();
        } catch (error) {
            console.error('Oy değiştirilemedi:', error);
            alert('Hata: ' + error.message);
        }
    };
    
    // Filtrelenmiş oylamalar
    const filteredVotings = votings.filter(voting => {
        switch (filter) {
            case 'active':
                return voting.active && voting.timeRemaining > 0;
            case 'completed':
                return voting.resultsRevealed;
            case 'canVote':
                return voting.active && voting.canVote && !voting.hasVoted && voting.timeRemaining > 0;
            default:
                return true;
        }
    });
    
    const formatTimeRemaining = (seconds) => {
        if (seconds <= 0) return 'Süresi dolmuş';
        
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days} gün ${hours} saat`;
        } else if (hours > 0) {
            return `${hours} saat ${minutes} dakika`;
        }
        return `${minutes} dakika`;
    };
    
    const getVotingStatus = (voting) => {
        if (voting.resultsRevealed) {
            return { text: '📊 Tamamlandı', color: 'bg-blue-500' };
        } else if (voting.active && voting.timeRemaining > 0) {
            return { text: '🟢 Aktif', color: 'bg-green-500' };
        } else if (voting.timeRemaining <= 0) {
            return { text: '⏰ Süresi Dolmuş', color: 'bg-red-500' };
        } else {
            return { text: '⏸️ Beklemede', color: 'bg-gray-500' };
        }
    };
    
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">🔐 Zama Advanced Voting</h1>
                    <p className="text-xl mb-8">Gelişmiş şifreli oylama sistemi</p>
                    <p className="text-lg">Lütfen cüzdanınızı bağlayın</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        🔐 Zama Advanced Voting
                    </h1>
                    <p className="text-xl text-blue-200 mb-6">
                        Tam gizlilik ile gelişmiş oylama deneyimi
                    </p>
                    
                    {/* Filter Buttons */}
                    <div className="flex justify-center gap-4 mb-6">
                        {[
                            { id: 'active', label: '🟢 Aktif Oylamalar', count: votings.filter(v => v.active && v.timeRemaining > 0).length },
                            { id: 'canVote', label: '🗳️ Oy Verebilirim', count: votings.filter(v => v.active && v.canVote && !v.hasVoted && v.timeRemaining > 0).length },
                            { id: 'completed', label: '📊 Tamamlanan', count: votings.filter(v => v.resultsRevealed).length },
                            { id: 'all', label: '📋 Tümü', count: votings.length }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.id}
                                onClick={() => setFilter(filterOption.id)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    filter === filterOption.id
                                        ? 'bg-white text-purple-900 shadow-lg'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                {filterOption.label} ({filterOption.count})
                            </button>
                        ))}
                    </div>
                </div>
                
                {loading ? (
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-xl">Oylamalar yükleniyor...</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {filteredVotings.length === 0 ? (
                            <div className="text-center text-white py-12">
                                <div className="text-6xl mb-4">🗳️</div>
                                <h2 className="text-2xl font-bold mb-2">
                                    {filter === 'active' && 'Aktif oylama bulunamadı'}
                                    {filter === 'canVote' && 'Oy verebileceğiniz oylama yok'}
                                    {filter === 'completed' && 'Tamamlanan oylama bulunamadı'}
                                    {filter === 'all' && 'Henüz oylama oluşturulmamış'}
                                </h2>
                                <p className="text-gray-300">
                                    {filter === 'canVote' 
                                        ? 'Yetkiniz olmayabilir veya zaten oy vermiş olabilirsiniz'
                                        : 'Yeni oylamalar için tekrar kontrol edin'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredVotings.map((voting) => {
                                    const status = getVotingStatus(voting);
                                    
                                    return (
                                        <div key={voting.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-bold text-white mb-2">
                                                        {voting.proposal}
                                                    </h2>
                                                    <p className="text-blue-200 mb-2">
                                                        {voting.options.length} seçenek • {voting.totalVoters} oy
                                                    </p>
                                                    <p className="text-sm text-gray-300">
                                                        Bitiş: {voting.endTime.toLocaleString('tr-TR')}
                                                    </p>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${status.color}`}>
                                                        {status.text}
                                                    </div>
                                                    <p className="text-sm text-gray-300 mt-1">
                                                        {formatTimeRemaining(voting.timeRemaining)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Seçenekler */}
                                            <div className="grid gap-3 mb-4">
                                                {voting.options.map((option, index) => {
                                                    const voteCount = voting.resultsRevealed ? voting.finalVotes[index] : null;
                                                    const percentage = voting.resultsRevealed && voting.totalVoters > 0 
                                                        ? (voteCount / voting.totalVoters * 100).toFixed(1) 
                                                        : 0;
                                                    
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                                                selectedVoting === voting.id && selectedOption === index
                                                                    ? 'border-yellow-400 bg-yellow-400/20'
                                                                    : voting.resultsRevealed
                                                                        ? 'border-gray-500 bg-gray-500/20'
                                                                        : voting.active && voting.canVote && !voting.hasVoted && voting.timeRemaining > 0
                                                                            ? 'border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/20'
                                                                            : 'border-gray-600 bg-gray-600/20'
                                                            }`}
                                                            onClick={() => {
                                                                if (voting.active && voting.canVote && voting.timeRemaining > 0) {
                                                                    setSelectedVoting(voting.id);
                                                                    setSelectedOption(index);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-white font-semibold text-lg">
                                                                    {option}
                                                                </span>
                                                                
                                                                {voting.resultsRevealed && (
                                                                    <div className="text-right">
                                                                        <div className="text-white font-bold text-xl">
                                                                            {voteCount} oy
                                                                        </div>
                                                                        <div className="text-blue-200 text-sm">
                                                                            %{percentage}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {voting.resultsRevealed && (
                                                                <div className="mt-2 bg-gray-700 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Kazanan */}
                                            {voting.resultsRevealed && voting.winner && (
                                                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center justify-center text-white">
                                                        <span className="text-2xl mr-2">🏆</span>
                                                        <span className="text-lg font-bold">
                                                            Kazanan: {voting.winner.name} ({voting.winner.votes} oy)
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Aksiyon Butonları */}
                                            <div className="flex gap-3 flex-wrap">
                                                {voting.active && voting.canVote && !voting.hasVoted && voting.timeRemaining > 0 && selectedVoting === voting.id && selectedOption !== null && (
                                                    <button
                                                        onClick={() => castVote(voting.id, selectedOption)}
                                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
                                                    >
                                                        🗳️ Oy Ver: {voting.options[selectedOption]}
                                                    </button>
                                                )}
                                                
                                                {voting.active && voting.hasVoted && voting.timeRemaining > 0 && selectedVoting === voting.id && selectedOption !== null && (
                                                    <button
                                                        onClick={() => changeVote(voting.id, selectedOption)}
                                                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all"
                                                    >
                                                        🔄 Oy Değiştir: {voting.options[selectedOption]}
                                                    </button>
                                                )}
                                                
                                                {voting.hasVoted && (
                                                    <div className="px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-200 rounded-lg">
                                                        ✅ Oy verdiniz
                                                    </div>
                                                )}
                                                
                                                {!voting.canVote && voting.active && (
                                                    <div className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-200 rounded-lg">
                                                        ❌ Oy verme yetkiniz yok
                                                    </div>
                                                )}
                                                
                                                {voting.timeRemaining <= 0 && voting.active && (
                                                    <div className="px-4 py-2 bg-gray-600/20 border border-gray-500/30 text-gray-200 rounded-lg">
                                                        ⏰ Süre dolmuş
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}