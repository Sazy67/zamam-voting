import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import multiContractArtifact from '../artifacts/contracts/MultiVotingSystem.sol/MultiVotingSystem.json';

// Contract address from environment variable or fallback to local
const getContractAddress = () => {
  const envAddress = process.env.NEXT_PUBLIC_MULTI_CONTRACT_ADDRESS;
  const fallbackAddress = '0xd571Ef424422BD0F843E8026d7Fa5808879B1B81';
  
  console.log('Contract Address Debug:', {
    envAddress,
    fallbackAddress,
    finalAddress: envAddress || fallbackAddress
  });
  
  return envAddress || fallbackAddress;
};

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [newProposal, setNewProposal] = useState('');
  const [selectedVotingId, setSelectedVotingId] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const contractAddress = getContractAddress();

  // Contract reads
  const { data: owner } = useContractRead({
    address: contractAddress,
    abi: multiContractArtifact.abi,
    functionName: 'owner',
    enabled: !!contractAddress,
  });

  const { data: votingCount } = useContractRead({
    address: contractAddress,
    abi: multiContractArtifact.abi,
    functionName: 'getVotingCount',
    watch: true,
    enabled: !!contractAddress,
  });

  const { data: allVotingIds } = useContractRead({
    address: contractAddress,
    abi: multiContractArtifact.abi,
    functionName: 'getAllVotingIds',
    watch: true,
    enabled: !!contractAddress,
  });

  // Create voting
  const { config: createVotingConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: multiContractArtifact.abi,
    functionName: 'createVoting',
    args: [newProposal],
    enabled: !!newProposal && !!contractAddress,
  });

  const { write: createVoting, isLoading: createLoading } = useContractWrite({
    ...createVotingConfig,
    onSuccess: () => {
      alert('✅ Yeni oylama başarıyla oluşturuldu!');
      setNewProposal('');
    },
    onError: (error) => {
      console.error('Create voting error:', error);
      alert('❌ Oylama oluşturma hatası: ' + error.message);
    },
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();
  
  // Debug bilgileri
  console.log('Owner Check Debug:', {
    address,
    owner,
    contractAddress,
    isOwner,
    addressLower: address?.toLowerCase(),
    ownerLower: owner?.toLowerCase()
  });

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>👑 Admin Panel - Oylama Yönetimi</h1>
        <ConnectButton />
      </div>

      {!isConnected ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Lütfen cüzdanınızı bağlayın</h2>
        </div>
      ) : !isOwner ? (
        <div style={{ textAlign: 'center', padding: '50px', border: '2px solid red', backgroundColor: '#ffe6e6' }}>
          <h2>❌ Erişim Reddedildi</h2>
          <p>Bu sayfaya sadece contract owner'ı erişebilir.</p>
          <p><strong>Owner:</strong> {owner}</p>
          <p><strong>Sen:</strong> {address}</p>
        </div>
      ) : (
        <div>
          {/* Yeni Oylama Oluştur */}
          <div style={{ border: '2px solid green', padding: '20px', marginBottom: '30px', backgroundColor: '#e6ffe6' }}>
            <h2>➕ Yeni Oylama Oluştur</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Oylama Konusu:
              </label>
              <textarea
                value={newProposal}
                onChange={(e) => setNewProposal(e.target.value)}
                placeholder="Örnek: 2024 yılında uzaktan çalışma politikası devam etsin mi?"
                style={{ 
                  width: '100%', 
                  height: '80px', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>
            <button
              onClick={() => createVoting?.()}
              disabled={createLoading || !createVoting || !newProposal.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: 'green',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {createLoading ? 'Oluşturuluyor...' : '✅ Oylama Oluştur'}
            </button>
          </div>

          {/* İstatistikler */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
              <h3>📊 Toplam Oylama</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>
                {votingCount?.toString() || '0'}
              </div>
            </div>
            
            <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
              <h3>🏠 Contract</h3>
              <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                {contractAddress || 'Contract adresi yükleniyor...'}
              </div>
            </div>
          </div>

          {/* Oylamalar Listesi */}
          <div style={{ border: '2px solid blue', padding: '20px', backgroundColor: '#e6f3ff' }}>
            <h2>📋 Tüm Oylamalar</h2>
            
            {!allVotingIds || allVotingIds.length === 0 ? (
              <p>Henüz oylama oluşturulmamış. Yukarıdan yeni oylama oluşturun.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {allVotingIds.map((votingId) => (
                  <VotingCard 
                    key={votingId.toString()} 
                    votingId={votingId} 
                    contractAddress={contractAddress}
                    contractAbi={multiContractArtifact.abi}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Voting Card Component
function VotingCard({ votingId, contractAddress, contractAbi }) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Voting info oku
  const { data: votingInfo } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVotingInfo',
    args: [votingId],
    watch: true,
  });

  // Detaylı bilgileri oku
  const { data: votingDetails } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVotingDetails',
    args: [votingId],
    watch: true,
    enabled: showDetails,
  });

  // Oy veren adresleri oku
  const { data: voters } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVoters',
    args: [votingId],
    watch: true,
    enabled: showDetails,
  });

  // Admin actions
  const { config: startConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'startVoting',
    args: [votingId],
  });

  const { config: endConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'endVoting',
    args: [votingId],
  });

  const { config: revealConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'revealResults',
    args: [votingId],
  });

  const { write: startVoting, isLoading: startLoading } = useContractWrite({
    ...startConfig,
    onSuccess: () => alert('✅ Oylama başlatıldı!'),
    onError: (error) => alert('❌ Hata: ' + error.message),
  });

  const { write: endVoting, isLoading: endLoading } = useContractWrite({
    ...endConfig,
    onSuccess: () => alert('✅ Oylama bitirildi!'),
    onError: (error) => alert('❌ Hata: ' + error.message),
  });

  const { write: revealResults, isLoading: revealLoading } = useContractWrite({
    ...revealConfig,
    onSuccess: () => alert('✅ Sonuçlar açıklandı!'),
    onError: (error) => alert('❌ Hata: ' + error.message),
  });

  if (!votingInfo) {
    return <div>Yükleniyor...</div>;
  }

  const [proposal, active, resultsRevealed, finalYesVotes, finalNoVotes, createdAt] = votingInfo;

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '15px', 
      borderRadius: '8px',
      backgroundColor: active ? '#fff3cd' : resultsRevealed ? '#d1ecf1' : '#f8f9fa'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 10px 0' }}>#{votingId.toString()}: {proposal}</h3>
          <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
            <span style={{ 
              padding: '2px 8px', 
              borderRadius: '12px', 
              backgroundColor: active ? 'green' : resultsRevealed ? 'blue' : 'gray',
              color: 'white'
            }}>
              {active ? '🟢 Aktif' : resultsRevealed ? '📊 Tamamlandı' : '⏸️ Beklemede'}
            </span>
            <span>📅 {new Date(Number(createdAt) * 1000).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {!active && !resultsRevealed && (
            <button
              onClick={() => startVoting?.()}
              disabled={startLoading || !startVoting}
              style={{ padding: '6px 12px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
            >
              {startLoading ? '...' : '▶️ Başlat'}
            </button>
          )}

          {active && (
            <button
              onClick={() => endVoting?.()}
              disabled={endLoading || !endVoting}
              style={{ padding: '6px 12px', backgroundColor: 'orange', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
            >
              {endLoading ? '...' : '⏹️ Bitir'}
            </button>
          )}

          {!active && !resultsRevealed && (
            <button
              onClick={() => revealResults?.()}
              disabled={revealLoading || !revealResults}
              style={{ padding: '6px 12px', backgroundColor: 'purple', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}
            >
              {revealLoading ? '...' : '📊 Sonuç'}
            </button>
          )}
        </div>
      </div>

      {/* Sonuçlar */}
      {resultsRevealed && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>✅ {finalYesVotes.toString()}</div>
              <div style={{ fontSize: '12px' }}>Evet</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'red' }}>❌ {finalNoVotes.toString()}</div>
              <div style={{ fontSize: '12px' }}>Hayır</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'blue' }}>
                🏆 {Number(finalYesVotes) > Number(finalNoVotes) ? 'EVET' : 
                     Number(finalNoVotes) > Number(finalYesVotes) ? 'HAYIR' : 'BERABERE'}
              </div>
              <div style={{ fontSize: '12px' }}>Kazanan</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'purple' }}>
                👥 {(Number(finalYesVotes) + Number(finalNoVotes)).toString()}
              </div>
              <div style={{ fontSize: '12px' }}>Toplam Oy</div>
            </div>
          </div>
        </div>
      )}

      {/* Detay Butonu */}
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '8px 16px',
            backgroundColor: showDetails ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {showDetails ? '🔼 Detayları Gizle' : '🔽 Detayları Göster'}
        </button>
      </div>

      {/* Detaylı Bilgiler */}
      {showDetails && votingDetails && (
        <VotingDetailsPanel 
          votingId={votingId}
          votingDetails={votingDetails}
          voters={voters}
          contractAddress={contractAddress}
          contractAbi={contractAbi}
        />
      )}
    </div>
  );
}



// Voting Details Panel Component
function VotingDetailsPanel({ votingId, votingDetails, voters, contractAddress, contractAbi }) {
  if (!votingDetails) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Detaylar yükleniyor...</div>;
  }

  const [
    proposal,
    active, 
    resultsRevealed,
    finalYesVotes,
    finalNoVotes,
    createdAt,
    yesVotes,
    noVotes,
    totalVotes
  ] = votingDetails;

  return (
    <div style={{ 
      marginTop: '15px', 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>📊 Detaylı Bilgiler</h4>
      
      {/* Temel Bilgiler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Oylama ID</div>
          <div style={{ fontWeight: 'bold' }}>#{votingId.toString()}</div>
        </div>
        
        <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Durum</div>
          <div style={{ fontWeight: 'bold' }}>
            {active ? '🟢 Aktif' : resultsRevealed ? '📊 Tamamlandı' : '⏸️ Beklemede'}
          </div>
        </div>
        
        <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Oluşturulma</div>
          <div style={{ fontWeight: 'bold' }}>
            {new Date(Number(createdAt) * 1000).toLocaleString('tr-TR')}
          </div>
        </div>
        
        <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e9ecef' }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>Toplam Katılım</div>
          <div style={{ fontWeight: 'bold', color: '#007bff' }}>
            👥 {totalVotes.toString()} kişi
          </div>
        </div>
      </div>

      {/* Anlık Oy Durumu */}
      <div style={{ marginBottom: '20px' }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>📈 Anlık Oy Durumu</h5>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#d4edda', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #c3e6cb'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
              ✅ {yesVotes.toString()}
            </div>
            <div style={{ fontSize: '14px', color: '#155724' }}>Evet Oyları</div>
          </div>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8d7da', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '1px solid #f5c6cb'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
              ❌ {noVotes.toString()}
            </div>
            <div style={{ fontSize: '14px', color: '#721c24' }}>Hayır Oyları</div>
          </div>
        </div>
      </div>

      {/* Final Sonuçlar (eğer açıklandıysa) */}
      {resultsRevealed && (
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>🏆 Final Sonuçları</h5>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#d1ecf1', 
              borderRadius: '8px', 
              textAlign: 'center',
              border: '1px solid #bee5eb'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                ✅ {finalYesVotes.toString()}
              </div>
              <div style={{ fontSize: '14px', color: '#0c5460' }}>Final Evet</div>
            </div>
            
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f8d7da', 
              borderRadius: '8px', 
              textAlign: 'center',
              border: '1px solid #f5c6cb'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                ❌ {finalNoVotes.toString()}
              </div>
              <div style={{ fontSize: '14px', color: '#721c24' }}>Final Hayır</div>
            </div>
            
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '8px', 
              textAlign: 'center',
              border: '1px solid #ffeaa7'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#856404' }}>
                🏆 {Number(finalYesVotes) > Number(finalNoVotes) ? 'EVET' : 
                     Number(finalNoVotes) > Number(finalYesVotes) ? 'HAYIR' : 'BERABERE'}
              </div>
              <div style={{ fontSize: '14px', color: '#856404' }}>Kazanan</div>
            </div>
          </div>
        </div>
      )}

      {/* Oy Veren Adresler */}
      {voters && voters.length > 0 && (
        <div>
          <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>
            👥 Oy Veren Adresler ({voters.length} kişi)
          </h5>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            backgroundColor: 'white', 
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '10px'
          }}>
            {voters.map((voter, index) => (
              <div 
                key={voter}
                style={{ 
                  padding: '8px', 
                  borderBottom: index < voters.length - 1 ? '1px solid #f8f9fa' : 'none',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              >
                <span style={{ color: '#6c757d', marginRight: '10px' }}>
                  {index + 1}.
                </span>
                <span style={{ color: '#495057' }}>
                  {voter}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}