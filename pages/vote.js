import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import multiContractArtifact from '../artifacts/contracts/MultiVotingSystem.sol/MultiVotingSystem.json';

// Contract address from environment variable
const getContractAddress = () => {
  return process.env.NEXT_PUBLIC_MULTI_CONTRACT_ADDRESS || 
         (typeof window !== 'undefined' ? null : '0x0D9ac45Cd4582ae467C2dB9c77f0B3B11B991413');
};

export default function VotePage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const contractAddress = getContractAddress();

  // Contract reads
  const { data: allVotingIds } = useContractRead({
    address: contractAddress,
    abi: multiContractArtifact.abi,
    functionName: 'getAllVotingIds',
    watch: true,
    enabled: !!contractAddress,
  });

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🗳️ Oylama Sistemi</h1>
        <ConnectButton />
      </div>

      {!isConnected ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Lütfen cüzdanınızı bağlayın</h2>
          <p>Oylamalara katılmak için cüzdanınızı bağlamanız gerekiyor.</p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e6f3ff', borderRadius: '8px' }}>
            <h3>👋 Hoş Geldiniz!</h3>
            <p>Aşağıdaki aktif oylamalara katılabilirsiniz. Her oylama için sadece bir kez oy verebilirsiniz.</p>
          </div>

          {!allVotingIds || allVotingIds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed #ccc' }}>
              <h3>📭 Henüz Oylama Yok</h3>
              <p>Şu anda aktif bir oylama bulunmuyor.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {allVotingIds.map((votingId) => (
                <VotingCard 
                  key={votingId.toString()} 
                  votingId={votingId} 
                  contractAddress={contractAddress}
                  contractAbi={multiContractArtifact.abi}
                  userAddress={address}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Voting Card Component for Users
function VotingCard({ votingId, contractAddress, contractAbi, userAddress }) {
  // Voting info oku
  const { data: votingInfo } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVotingInfo',
    args: [votingId],
    watch: true,
  });

  // Has voted check
  const { data: hasVoted } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'hasVoted',
    args: [votingId, userAddress],
    enabled: !!userAddress,
    watch: true,
  });

  // Vote actions
  const { config: voteYesConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'vote',
    args: [votingId, true],
  });

  const { config: voteNoConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'vote',
    args: [votingId, false],
  });

  const { write: voteYes, isLoading: voteYesLoading } = useContractWrite({
    ...voteYesConfig,
    onSuccess: () => alert('✅ EVET oyunuz başarıyla kaydedildi!'),
    onError: (error) => alert('❌ Hata: ' + error.message),
  });

  const { write: voteNo, isLoading: voteNoLoading } = useContractWrite({
    ...voteNoConfig,
    onSuccess: () => alert('✅ HAYIR oyunuz başarıyla kaydedildi!'),
    onError: (error) => alert('❌ Hata: ' + error.message),
  });

  if (!votingInfo) {
    return <div>Yükleniyor...</div>;
  }

  const [proposal, active, resultsRevealed, finalYesVotes, finalNoVotes, createdAt] = votingInfo;

  // Sadece aktif oylamaları ve sonuçları göster
  if (!active && !resultsRevealed) {
    return null; // Beklemedeki oylamaları gösterme
  }

  return (
    <div style={{ 
      border: '2px solid #ddd', 
      padding: '20px', 
      borderRadius: '12px',
      backgroundColor: active ? '#fff8e1' : '#f3e5f5'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>#{votingId.toString()}</h3>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '16px', 
            backgroundColor: active ? '#4caf50' : '#2196f3',
            color: 'white',
            fontSize: '12px'
          }}>
            {active ? '🟢 Aktif Oylama' : '📊 Sonuçlar Açıklandı'}
          </span>
        </div>
        
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          {proposal}
        </div>

        <div style={{ fontSize: '12px', color: '#666' }}>
          📅 Oluşturulma: {new Date(Number(createdAt) * 1000).toLocaleDateString('tr-TR')}
        </div>
      </div>

      {/* Oy Verme Arayüzü */}
      {active && !hasVoted && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '15px', color: '#333' }}>🗳️ Oyunuzu verin:</h4>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => voteYes?.()}
              disabled={voteYesLoading || !voteYes}
              style={{
                padding: '15px 30px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              {voteYesLoading ? 'Gönderiliyor...' : '✅ EVET'}
            </button>

            <button
              onClick={() => voteNo?.()}
              disabled={voteNoLoading || !voteNo}
              style={{
                padding: '15px 30px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              {voteNoLoading ? 'Gönderiliyor...' : '❌ HAYIR'}
            </button>
          </div>
        </div>
      )}

      {/* Oy Verildi Mesajı */}
      {active && hasVoted && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#2e7d32', margin: '0 0 5px 0' }}>✅ Oyunuz Alındı</h4>
          <p style={{ margin: 0, color: '#388e3c' }}>
            Bu oylama için oyunuzu başarıyla verdiniz. Sonuçlar açıklandığında görebileceksiniz.
          </p>
        </div>
      )}

      {/* Sonuçlar */}
      {resultsRevealed && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: '#f0f8ff', 
          borderRadius: '8px',
          border: '1px solid #2196f3'
        }}>
          <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#1976d2' }}>
            📊 Oylama Sonuçları
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
            <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                {finalYesVotes.toString()}
              </div>
              <div style={{ fontSize: '14px', color: '#388e3c' }}>✅ Evet</div>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c62828' }}>
                {finalNoVotes.toString()}
              </div>
              <div style={{ fontSize: '14px', color: '#d32f2f' }}>❌ Hayır</div>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef6c00' }}>
                {Number(finalYesVotes) > Number(finalNoVotes) ? '✅ EVET' : 
                 Number(finalNoVotes) > Number(finalYesVotes) ? '❌ HAYIR' : '🤝 BERABERE'}
              </div>
              <div style={{ fontSize: '14px', color: '#f57c00' }}>🏆 Kazanan</div>
            </div>
          </div>

          {hasVoted && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#1565c0'
            }}>
              ✅ Bu oylamaya katıldınız
            </div>
          )}
        </div>
      )}
    </div>
  );
}