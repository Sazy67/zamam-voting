import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

const CONTRACT_ABI = [
  "function vote(bool choice) external"
];

export default function VotingInterface({ contractAddress }) {
  const [selectedVote, setSelectedVote] = useState(null);

  // Oy seçimi
  const selectVote = (voteValue) => {
    setSelectedVote(voteValue);
  };

  // Kontrat yazma hazırlığı
  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'vote',
    args: [selectedVote === 'yes'],
    enabled: !!selectedVote,
  });

  const { write: submitVote, isLoading: isSubmitting } = useContractWrite({
    ...config,
    onSuccess: () => {
      alert('✅ Oyunuz başarıyla gönderildi!');
      setSelectedVote(null);
    },
    onError: (error) => {
      console.error('Oy gönderme hatası:', error);
      alert('❌ Oy gönderilirken hata oluştu');
    },
  });

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6">🗳️ Oyunuzu Verin</h2>
      
      <div className="space-y-4">
        {/* Oy Seçenekleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => selectVote('yes')}
            disabled={isSubmitting}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedVote === 'yes'
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <div className="text-4xl mb-2">✅</div>
            <div className="text-xl font-semibold">EVET</div>
            <div className="text-sm text-gray-600 mt-1">
              Öneriye katılıyorum
            </div>
          </button>

          <button
            onClick={() => selectVote('no')}
            disabled={isSubmitting}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedVote === 'no'
                ? 'border-red-500 bg-red-50 text-red-800'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <div className="text-4xl mb-2">❌</div>
            <div className="text-xl font-semibold">HAYIR</div>
            <div className="text-sm text-gray-600 mt-1">
              Öneriye katılmıyorum
            </div>
          </button>
        </div>

        {/* Durum Mesajları */}
        {selectedVote && !isSubmitting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <span>✅</span>
              <span className="font-medium">Oy seçildi</span>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Seçiminiz: <strong>{selectedVote === 'yes' ? 'EVET' : 'HAYIR'}</strong>
            </p>
            <button
              onClick={() => submitVote?.()}
              disabled={!submitVote}
              className="btn-primary w-full"
            >
              📤 Oyu Gönder
            </button>
          </div>
        )}

        {isSubmitting && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-green-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              Oyunuz blockchain'e gönderiliyor...
            </div>
          </div>
        )}

        {/* Bilgilendirme */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <h4 className="font-medium text-gray-800 mb-2">🔐 Demo Versiyonu</h4>
          <ul className="space-y-1">
            <li>• Bu demo versiyonunda oylar açık olarak saklanır</li>
            <li>• Gerçek projede Zama FHEVM ile tamamen şifrelenecek</li>
            <li>• Kimse bireysel oyları göremeyecek</li>
            <li>• Sadece toplam sonuç açıklanacak</li>
          </ul>
        </div>
      </div>
    </div>
  );
}