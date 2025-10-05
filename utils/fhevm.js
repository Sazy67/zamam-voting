import { createFhevmInstance } from 'fhevmjs';
import { ethers } from 'ethers';

// FHEVM instance
let fhevmInstance = null;

// Sepolia Testnet network configuration
export const SEPOLIA_NETWORK = {
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Contract ABI
export const ZAMA_ADVANCED_ABI = [
  "function getVotingCount() view returns (uint256)",
  "function getVotingInfo(uint256) view returns (string, string[], bool, bool, uint32[], uint256, uint256, uint256)",
  "function hasVotedInVoting(uint256, address) view returns (bool)",
  "function canVoteInVoting(uint256, address) view returns (bool)",
  "function vote(uint256, uint32)",
  "function getTimeRemaining(uint256) view returns (uint256)",
  "function getWinner(uint256) view returns (string, uint32)",
  "function getVoters(uint256) view returns (address[])",
  "function authorizeVoter(address)",
  "function startVoting(uint256)",
  "function endVoting(uint256)",
  "function revealResults(uint256)",
  "function owner() view returns (address)",
  "function createVoting(string, string[], uint256) returns (uint256)"
];

// Contract address - Sepolia Testnet
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ZAMA_CONTRACT_ADDRESS || "0xf43b398501525177c95544dc0B058d7CAA321d8F";

// Initialize FHEVM instance - Sepolia için devre dışı
export const initFhevm = async () => {
  try {
    // Sepolia testnet için FHEVM kullanmıyoruz, normal voting
    console.log('FHEVM disabled for Sepolia testnet');
    return null;
  } catch (error) {
    console.error('FHEVM initialization failed:', error);
    return null;
  }
};

// Get FHEVM instance
export const getFhevmInstance = () => {
  return fhevmInstance;
};

// Encrypt a boolean value
export const encryptBool = async (value) => {
  try {
    const instance = await initFhevm();
    if (!instance) {
      throw new Error('FHEVM instance not available');
    }
    
    return instance.encrypt_bool(value);
  } catch (error) {
    console.error('Boolean encryption failed:', error);
    // Fallback: return mock encrypted data
    return {
      data: new Uint8Array([value ? 1 : 0]),
      handles: ['0x' + Math.random().toString(16).substr(2, 8)],
    };
  }
};

// Encrypt a 32-bit unsigned integer
export const encryptUint32 = async (value) => {
  try {
    const instance = await initFhevm();
    if (!instance) {
      throw new Error('FHEVM instance not available');
    }
    
    return instance.encrypt_uint32(value);
  } catch (error) {
    console.error('Uint32 encryption failed:', error);
    // Fallback: return mock encrypted data
    return {
      data: new Uint8Array(4).fill(value),
      handles: ['0x' + Math.random().toString(16).substr(2, 8)],
    };
  }
};

// Create reencryption request
export const createReencryptionRequest = async (handle, privateKey, publicKey, signature, contractAddress, userAddress) => {
  try {
    const instance = await initFhevm();
    if (!instance) {
      throw new Error('FHEVM instance not available');
    }
    
    return instance.createEIP712(handle, privateKey, publicKey, signature, contractAddress, userAddress);
  } catch (error) {
    console.error('Reencryption request failed:', error);
    return null;
  }
};

// Mock functions for development
export const mockEncryptVote = (optionIndex) => {
  return {
    encryptedData: '0x' + Math.random().toString(16).substr(2, 64),
    proof: '0x' + Math.random().toString(16).substr(2, 128),
    handle: '0x' + Math.random().toString(16).substr(2, 8),
  };
};

// Utility to check if we're on Sepolia network
export const isSepoliaNetwork = (chainId) => {
  return chainId === SEPOLIA_NETWORK.chainId;
};

// Add Sepolia network to wallet
export const addSepoliaNetwork = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${SEPOLIA_NETWORK.chainId.toString(16)}`,
          chainName: SEPOLIA_NETWORK.name,
          rpcUrls: [SEPOLIA_NETWORK.rpcUrl],
          nativeCurrency: SEPOLIA_NETWORK.nativeCurrency,
          blockExplorerUrls: [SEPOLIA_NETWORK.blockExplorer],
        }],
      });
      return true;
    } catch (error) {
      console.error('Failed to add Sepolia network:', error);
      return false;
    }
  }
  return false;
};

// Switch to Sepolia network
export const switchToSepoliaNetwork = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_NETWORK.chainId.toString(16)}` }],
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
  }
  return false;
};

// Contract interaction functions
export const getContract = (signer) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, signer);
};

// Get voting count from contract
export const getVotingCount = async (provider) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, provider);
    const count = await contract.getVotingCount();
    return Number(count);
  } catch (error) {
    console.error('Error getting voting count:', error);
    return 0;
  }
};

// Get all voting IDs
export const getAllVotingIds = async (provider) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, provider);
    const count = await contract.getVotingCount();
    const ids = [];
    for (let i = 0; i < Number(count); i++) {
      ids.push(i);
    }
    return ids;
  } catch (error) {
    console.error('Error getting voting IDs:', error);
    return [];
  }
};

// Get voting info
export const getVotingInfo = async (provider, votingId) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, provider);
    const info = await contract.getVotingInfo(votingId);
    
    return {
      proposal: info[0],
      options: info[1],
      active: info[2],
      resultsRevealed: info[3],
      finalVotes: info[4].map(v => Number(v)),
      createdAt: Number(info[5]),
      endTime: Number(info[6]),
      totalVoters: Number(info[7])
    };
  } catch (error) {
    console.error('Error getting voting info:', error);
    return null;
  }
};

// Check if user has voted
export const hasUserVoted = async (provider, votingId, userAddress) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, provider);
    return await contract.hasVotedInVoting(votingId, userAddress);
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
};

// Check if user can vote
export const canUserVote = async (provider, votingId, userAddress) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, provider);
    return await contract.canVoteInVoting(votingId, userAddress);
  } catch (error) {
    console.error('Error checking vote permission:', error);
    return false;
  }
};

// Get time remaining
export const getTimeRemaining = async (provider, votingId) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, provider);
    const remaining = await contract.getTimeRemaining(votingId);
    return Number(remaining);
  } catch (error) {
    console.error('Error getting time remaining:', error);
    return 0;
  }
};

// Get winner
export const getWinner = async (provider, votingId) => {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ZAMA_ADVANCED_ABI, provider);
    const winner = await contract.getWinner(votingId);
    return {
      name: winner[0],
      votes: Number(winner[1])
    };
  } catch (error) {
    console.error('Error getting winner:', error);
    return null;
  }
};

// Cast vote
export const castVote = async (signer, votingId, optionIndex) => {
  try {
    const contract = getContract(signer);
    const tx = await contract.vote(votingId, optionIndex);
    return await tx.wait();
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
};

// Change vote
export const changeVote = async (signer, votingId, optionIndex) => {
  try {
    const contract = getContract(signer);
    const tx = await contract.revote(votingId, optionIndex);
    return await tx.wait();
  } catch (error) {
    console.error('Error changing vote:', error);
    throw error;
  }
};