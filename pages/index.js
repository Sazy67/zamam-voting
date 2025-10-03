import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import zamaContractInfo from '../zama-simple-contract-info.json';
import zamaContractArtifact from '../artifacts/contracts/ZamaVotingSimple.sol/ZamaVotingSimple.json';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [selectedVotingId, setSelectedVotingId] = useState(null);
  const [voteChoice, setVoteChoice] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Contract reads
  const { data: allVotingIds } = useContractRead({
    address: zamaContractInfo.address,
    abi: zamaContractArtifact.abi,
    functionName: 'getAllVotingIds',
    watch: true,
  });

  // Vote preparation
  const { config: voteConfig } = usePrepareContractWrite({
    address: zamaContractInfo.address,
    abi: zamaContractArtifact.abi,
    functionName: 'vote',
    args: [selectedVotingId, voteChoice],
    enabled: selectedVotingId !== null && voteChoice !== null,
  });

  const { write: submitVote, isLoading: voteLoading } = useContractWrite({
    ...voteConfig,
    onSuccess: () => {
      alert('✅ Oyunuz başarıyla kaydedildi!');
      setSelectedVotingId(null);
      setVoteChoice(null);
    },
    onError: (error) => {
      console.error('Vote error:', error);
      alert('❌ Oy verme hatası: ' + error.message);
    },
  });

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)',
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
        padding: '15px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              background: 'linear-gradient(45deg, #FFC107, #FF8F00)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)'
            }}>
              🔐
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '28px', 
                fontWeight: '700',
                background: 'linear-gradient(45deg, #FF8F00, #FFC107)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Zama Voting
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: '500' }}>
                Encrypted Blockchain Voting System
              </p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>

        {!isConnected ? (
          <div style={{ textAlign: 'center' }}>
            {/* Hero Section */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '24px',
              padding: '60px 40px',
              marginBottom: '40px',
              boxShadow: '0 20px 40px rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.2)'
            }}>
              <div style={{ 
                fontSize: '72px', 
                marginBottom: '20px',
                filter: 'drop-shadow(0 4px 8px rgba(255, 193, 7, 0.3))'
              }}>
                🔐
              </div>
              <h2 style={{ 
                fontSize: '42px', 
                fontWeight: '800', 
                margin: '0 0 20px 0',
                background: 'linear-gradient(45deg, #FF8F00, #FFC107, #FFD54F)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                The Future of Voting
              </h2>
              <p style={{ 
                fontSize: '20px', 
                color: '#666', 
                marginBottom: '40px', 
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto 40px auto'
              }}>
                Experience completely encrypted and secure voting with Zama FHEVM technology. 
                Your votes remain encrypted on the blockchain until results are revealed.
              </p>
              
              <div style={{ marginBottom: '40px' }}>
                <ConnectButton />
              </div>

              {/* Features Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '25px',
                marginTop: '50px'
              }}>
                <div style={{ 
                  padding: '30px 25px', 
                  background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  boxShadow: '0 8px 25px rgba(255, 193, 7, 0.1)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#E65100', fontSize: '20px', fontWeight: '700' }}>
                    Full Encryption
                  </h4>
                  <p style={{ fontSize: '15px', margin: '0', color: '#666', lineHeight: '1.5' }}>
                    Your votes are stored encrypted on blockchain with Zama FHEVM. Thanks to homomorphic encryption, no one can see your vote.
                  </p>
                </div>
                
                <div style={{ 
                  padding: '30px 25px', 
                  background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  boxShadow: '0 8px 25px rgba(255, 193, 7, 0.1)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏰</div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#F57F17', fontSize: '20px', fontWeight: '700' }}>
                    Smart Time Management
                  </h4>
                  <p style={{ fontSize: '15px', margin: '0', color: '#666', lineHeight: '1.5' }}>
                    Each voting has a specific duration. It automatically ends when time expires. Track with real-time countdown.
                  </p>
                </div>
                
                <div style={{ 
                  padding: '30px 25px', 
                  background: 'linear-gradient(135deg, #FFFDE7, #FFF9C4)',
                  borderRadius: '16px', 
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  boxShadow: '0 8px 25px rgba(255, 193, 7, 0.1)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛡️</div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#FF8F00', fontSize: '20px', fontWeight: '700' }}>
                    Blockchain Security
                  </h4>
                  <p style={{ fontSize: '15px', margin: '0', color: '#666', lineHeight: '1.5' }}>
                    Complete security with Ethereum-compatible smart contracts. Votes cannot be changed or manipulated.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Panel Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 235, 59, 0.1))',
              borderRadius: '20px',
              padding: '40px',
              border: '2px solid rgba(255, 193, 7, 0.3)',
              boxShadow: '0 15px 35px rgba(255, 193, 7, 0.1)'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>👑</div>
              <h3 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                margin: '0 0 15px 0',
                color: '#E65100'
              }}>
                Admin Panel
              </h3>
              <p style={{ 
                fontSize: '18px', 
                color: '#666', 
                marginBottom: '30px',
                lineHeight: '1.6'
              }}>
                Access the admin panel to create, manage votings and reveal results
              </p>
              <a 
                href="/zama-admin" 
                style={{ 
                  display: 'inline-block',
                  padding: '16px 32px', 
                  background: 'linear-gradient(45deg, #FFC107, #FF8F00)',
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '12px', 
                  fontSize: '18px', 
                  fontWeight: '700',
                  boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(255, 193, 7, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.3)';
                }}
              >
                🔐 Go to Admin Panel
              </a>
            </div>
          </div>
        ) : (
          <div>
            {/* Welcome Back Section */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 248, 225, 0.95))',
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '40px',
              border: '2px solid rgba(255, 193, 7, 0.3)',
              boxShadow: '0 15px 35px rgba(255, 193, 7, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                }}>
                  ✅
                </div>
                <div>
                  <h3 style={{ 
                    margin: '0 0 5px 0', 
                    fontSize: '24px', 
                    fontWeight: '700',
                    color: '#2E7D32'
                  }}>
                    Wallet Connected!
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
                    You can participate in encrypted votings and track results
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                marginTop: '25px'
              }}>
                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #E8F5E8, #C8E6C9)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗳️</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2E7D32', marginBottom: '5px' }}>
                    {allVotingIds?.length || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Votings</div>
                </div>
                
                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 193, 7, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#E65100', marginBottom: '5px' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Encrypted Security</div>
                </div>
                
                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1565C0', marginBottom: '5px' }}>
                    Instant
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Result Tracking</div>
                </div>
              </div>
            </div>

            {/* Aktif Oylamalar */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '30px',
              border: '2px solid rgba(255, 193, 7, 0.3)',
              boxShadow: '0 15px 35px rgba(255, 193, 7, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  background: 'linear-gradient(45deg, #FFC107, #FF8F00)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)'
                }}>
                  🗳️
                </div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700',
                  background: 'linear-gradient(45deg, #FF8F00, #FFC107)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Active Votings
                </h2>
              </div>
              
              {!allVotingIds || allVotingIds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                  <div style={{ fontSize: '72px', marginBottom: '20px', opacity: 0.6 }}>📭</div>
                  <h3 style={{ fontSize: '24px', color: '#666', marginBottom: '15px', fontWeight: '600' }}>
                    No Active Votings Yet
                  </h3>
                  <p style={{ fontSize: '16px', color: '#888', marginBottom: '30px', lineHeight: '1.6' }}>
                    There are currently no active votings. New votings will appear here when created.
                  </p>
                  
                  <div style={{ 
                    padding: '30px', 
                    background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
                    borderRadius: '16px', 
                    border: '2px solid rgba(255, 193, 7, 0.3)',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>👑</div>
                    <h4 style={{ color: '#E65100', marginBottom: '15px', fontSize: '20px', fontWeight: '700' }}>
                      Are you an Admin?
                    </h4>
                    <p style={{ color: '#666', marginBottom: '20px', fontSize: '15px' }}>
                      Go to admin panel to create new encrypted votings
                    </p>
                    <a 
                      href="/zama-admin" 
                      style={{ 
                        display: 'inline-block',
                        padding: '12px 24px', 
                        background: 'linear-gradient(45deg, #FFC107, #FF8F00)',
                        color: 'white', 
                        textDecoration: 'none', 
                        borderRadius: '10px', 
                        fontWeight: '700',
                        boxShadow: '0 6px 20px rgba(255, 193, 7, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.3)';
                      }}
                    >
                      🔐 Admin Panel
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '25px' }}>
                  {allVotingIds.map((votingId) => (
                    <ZamaVotingItem 
                      key={votingId.toString()} 
                      votingId={votingId} 
                      contractAddress={zamaContractInfo.address}
                      contractAbi={zamaContractArtifact.abi}
                      userAddress={address}
                      onVoteSelect={(id, choice) => {
                        setSelectedVotingId(id);
                        setVoteChoice(choice);
                        submitVote?.();
                      }}
                      isVoting={voteLoading && selectedVotingId === votingId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          marginTop: '60px', 
          textAlign: 'center', 
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 193, 7, 0.2)'
        }}>
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: '0 0 15px 0',
              color: '#E65100'
            }}>
              🚀 Meet Zama Voting
            </h4>
            <p style={{ color: '#666', fontSize: '16px', margin: '0 0 20px 0' }}>
              Vote with complete privacy on blockchain
            </p>
          </div>

          {/* Social Links */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            marginBottom: '25px',
            flexWrap: 'wrap'
          }}>
            <a 
              href="https://twitter.com/suatayaz_" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px', 
                background: 'linear-gradient(45deg, #1DA1F2, #0d8bd9)',
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '12px', 
                fontWeight: '600',
                boxShadow: '0 6px 20px rgba(29, 161, 242, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(29, 161, 242, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(29, 161, 242, 0.3)';
              }}
            >
              <span style={{ fontSize: '18px' }}>🐦</span>
              @suatayaz_
            </a>
            
            <a 
              href="https://github.com/suatayaz" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px', 
                background: 'linear-gradient(45deg, #333, #24292e)',
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '12px', 
                fontWeight: '600',
                boxShadow: '0 6px 20px rgba(51, 51, 51, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(51, 51, 51, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(51, 51, 51, 0.3)';
              }}
            >
              <span style={{ fontSize: '18px' }}>💻</span>
              GitHub
            </a>
            
            <a 
              href="https://zama.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px', 
                background: 'linear-gradient(45deg, #FFC107, #FF8F00)',
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '12px', 
                fontWeight: '600',
                boxShadow: '0 6px 20px rgba(255, 193, 7, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.3)';
              }}
            >
              <span style={{ fontSize: '18px' }}>🔐</span>
              Zama FHEVM
            </a>
          </div>

          <div style={{ 
            padding: '20px 0', 
            borderTop: '1px solid rgba(255, 193, 7, 0.2)',
            color: '#888', 
            fontSize: '14px' 
          }}>
            <p style={{ margin: '0 0 5px 0' }}>
              🔒 Powered by <strong>Zama FHEVM</strong> - Complete Privacy on Blockchain
            </p>
            <p style={{ margin: 0 }}>
              Made with ❤️ by <strong>@suatayaz_</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Zama Voting Item Component
function ZamaVotingItem({ votingId, contractAddress, contractAbi, userAddress, onVoteSelect, isVoting }) {
  // Voting info oku
  const { data: votingInfo } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVotingInfo',
    args: [votingId],
    watch: true,
  });

  // Kullanıcı oy verdi mi kontrol et
  const { data: hasVoted } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'hasVoted',
    args: [votingId, userAddress],
    watch: true,
  });

  // Kalan süre
  const { data: timeRemaining } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getTimeRemaining',
    args: [votingId],
    watch: true,
  });

  // Oy veren sayısı
  const { data: voters } = useContractRead({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getVoters',
    args: [votingId],
    watch: true,
  });

  if (!votingInfo) {
    return <div>Yükleniyor...</div>;
  }

  const [proposal, active, resultsRevealed, finalYesVotes, finalNoVotes, createdAt, endTime] = votingInfo;

  // Süre hesaplamaları
  const now = Math.floor(Date.now() / 1000);
  const endTimeNumber = Number(endTime);
  const timeRemainingNumber = Number(timeRemaining || 0);
  const isExpired = now >= endTimeNumber;
  
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Oy verilebilir mi kontrol et
  const canVote = active && !isExpired && !hasVoted;

  return (
    <div style={{ 
      border: '2px solid rgba(255, 193, 7, 0.3)', 
      padding: '25px', 
      borderRadius: '16px',
      background: canVote ? 'linear-gradient(135deg, #F1F8E9, #DCEDC8)' : 
                  hasVoted ? 'linear-gradient(135deg, #E3F2FD, #BBDEFB)' : 
                  resultsRevealed ? 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' : 
                  'linear-gradient(135deg, #FAFAFA, #F5F5F5)',
      borderColor: canVote ? '#4CAF50' : hasVoted ? '#2196F3' : resultsRevealed ? '#FF9800' : '#E0E0E0',
      boxShadow: '0 8px 25px rgba(255, 193, 7, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Başlık ve Durum */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>
          #{votingId.toString()}: {proposal}
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', fontSize: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            backgroundColor: active ? '#28a745' : resultsRevealed ? '#007bff' : isExpired ? '#dc3545' : '#6c757d',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {active ? '🟢 Active' : resultsRevealed ? '📊 Completed' : isExpired ? '⏰ Expired' : '⏸️ Pending'}
          </span>
          
          {hasVoted && (
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              backgroundColor: '#17a2b8',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ✅ Voted
            </span>
          )}
          
          <span style={{ color: '#6c757d' }}>
            📅 {new Date(Number(createdAt) * 1000).toLocaleDateString('tr-TR')}
          </span>
          
          <span style={{ color: '#6c757d' }}>
            👥 {voters?.length || 0} participants
          </span>
          
          {active && !isExpired && (
            <span style={{ color: '#fd7e14', fontWeight: 'bold' }}>
              ⏳ Remaining: {formatTime(timeRemainingNumber)}
            </span>
          )}
        </div>
      </div>

      {/* Süre Bilgisi */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px', 
        marginBottom: '15px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Start:</strong> {new Date(Number(createdAt) * 1000).toLocaleString('en-US')}</span>
          <span><strong>End:</strong> {new Date(endTimeNumber * 1000).toLocaleString('en-US')}</span>
        </div>
      </div>

      {/* Oy Verme Alanı */}
      {canVote ? (
        <div style={{ 
          border: '2px solid rgba(255, 193, 7, 0.5)', 
          padding: '25px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, #FFFDE7, #FFF9C4)',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(255, 193, 7, 0.2)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔐</div>
          <h4 style={{ margin: '0 0 15px 0', color: '#E65100', fontSize: '22px', fontWeight: '700' }}>
            Cast Your Encrypted Vote
          </h4>
          <p style={{ margin: '0 0 25px 0', color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
            Your vote will be encrypted with Zama FHEVM and stored securely on blockchain
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onVoteSelect(votingId, true)}
              disabled={isVoting}
              style={{
                padding: '18px 35px',
                background: isVoting ? '#ccc' : 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: isVoting ? 'not-allowed' : 'pointer',
                minWidth: '140px',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!isVoting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!isVoting) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.3)';
                }
              }}
            >
              {isVoting ? '⏳ Sending...' : '✅ YES'}
            </button>
            
            <button
              onClick={() => onVoteSelect(votingId, false)}
              disabled={isVoting}
              style={{
                padding: '18px 35px',
                background: isVoting ? '#ccc' : 'linear-gradient(45deg, #F44336, #EF5350)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: isVoting ? 'not-allowed' : 'pointer',
                minWidth: '140px',
                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!isVoting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(244, 67, 54, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!isVoting) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.3)';
                }
              }}
            >
              {isVoting ? '⏳ Sending...' : '❌ NO'}
            </button>
          </div>
          
          {isVoting && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: 'rgba(255, 193, 7, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
              <p style={{ margin: 0, color: '#E65100', fontStyle: 'italic', fontSize: '15px' }}>
                🔐 Your vote is being encrypted and securely recorded on blockchain...
              </p>
            </div>
          )}
        </div>
      ) : hasVoted ? (
        <div style={{ 
          border: '2px solid #007bff', 
          padding: '20px', 
          borderRadius: '8px', 
          backgroundColor: '#e6f3ff',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#004085' }}>✅ Your Vote is Recorded</h4>
          <p style={{ margin: '0', color: '#6c757d' }}>
            You have already participated in this voting. Your vote is securely stored encrypted on blockchain.
          </p>
        </div>
      ) : !active && !resultsRevealed ? (
        <div style={{ 
          border: '2px solid #6c757d', 
          padding: '20px', 
          borderRadius: '8px', 
          backgroundColor: '#f8f9fa',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>⏸️ Voting Not Started Yet</h4>
          <p style={{ margin: '0', color: '#6c757d' }}>
            This voting has not been started by admin yet.
          </p>
        </div>
      ) : isExpired ? (
        <div style={{ 
          border: '2px solid #dc3545', 
          padding: '20px', 
          borderRadius: '8px', 
          backgroundColor: '#f8d7da',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>⏰ Voting Time Expired</h4>
          <p style={{ margin: '0', color: '#6c757d' }}>
            This voting time has expired. You can no longer vote.
          </p>
        </div>
      ) : null}

      {/* Sonuçlar (eğer açıklandıysa) */}
      {resultsRevealed && (
        <div style={{ 
          marginTop: '20px',
          border: '2px solid #ffc107', 
          padding: '20px', 
          borderRadius: '8px', 
          backgroundColor: '#fff3cd'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#856404', textAlign: 'center' }}>📊 Final Results</h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                ✅ {finalYesVotes.toString()}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>Yes Votes</div>
            </div>
            
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                ❌ {finalNoVotes.toString()}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>No Votes</div>
            </div>
            
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                🏆 {Number(finalYesVotes) > Number(finalNoVotes) ? 'YES' : 
                     Number(finalNoVotes) > Number(finalYesVotes) ? 'NO' : 'TIE'}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>Winner</div>
            </div>
            
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6f42c1' }}>
                👥 {(Number(finalYesVotes) + Number(finalNoVotes)).toString()}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>Total Votes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}