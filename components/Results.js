import { useContractRead } from 'wagmi';

const CONTRACT_ABI = [
  "function finalYesVotes() view returns (uint32)",
  "function finalNoVotes() view returns (uint32)",
  "function getTotalVotes() view returns (uint32)",
  "function getWinner() view returns (string)"
];

export default function Results({ contractAddress }) {
  const { data: yesVotes } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'finalYesVotes',
  });

  const { data: noVotes } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'finalNoVotes',
  });

  const { data: totalVotes } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getTotalVotes',
  });

  const { data: winner } = useContractRead({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getWinner',
  });

  if (!yesVotes && !noVotes) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Sonuçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const yesCount = Number(yesVotes || 0);
  const noCount = Number(noVotes || 0);
  const total = Number(totalVotes || 0);

  const yesPercentage = total > 0 ? (yesCount / total) * 100 : 0;
  const noPercentage = total > 0 ? (noCount / total) * 100 : 0;

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6">📊 Oylama Sonuçları</h2>
      
      {/* Kazanan */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xl font-bold ${
          winner === 'EVET' ? 'bg-green-100 text-green-800' :
          winner === 'HAYIR' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {winner === 'EVET' && '🎉'}
          {winner === 'HAYIR' && '📉'}
          {winner === 'BERABERE' && '🤝'}
          <span>Sonuç: {winner}</span>
        </div>
      </div>

      {/* Oy Dağılımı */}
      <div className="space-y-6">
        {/* Evet Oyları */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="font-semibold text-lg">EVET</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{yesCount} oy</div>
              <div className="text-sm text-gray-600">%{yesPercentage.toFixed(1)}</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${yesPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Hayır Oyları */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <span className="font-semibold text-lg">HAYIR</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{noCount} oy</div>
              <div className="text-sm text-gray-600">%{noPercentage.toFixed(1)}</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-red-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${noPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Toplam İstatistikler */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-sm text-blue-800">Toplam Oy</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">%{yesPercentage.toFixed(1)}</div>
            <div className="text-sm text-green-800">Evet Oranı</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">%{noPercentage.toFixed(1)}</div>
            <div className="text-sm text-red-800">Hayır Oranı</div>
          </div>
        </div>
      </div>

      {/* Gizlilik Bilgisi */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-purple-800 mb-2">
          <span>🔒</span>
          <span className="font-medium">Gizlilik Korundu</span>
        </div>
        <p className="text-sm text-purple-700">
          Bu sonuçlar, bireysel oylar hiç açığa çıkmadan Zama FHEVM'in 
          tamamen homomorphic şifreleme teknolojisi ile hesaplandı.
        </p>
      </div>
    </div>
  );
}