// Basit çeviri sistemi - Google Translate API alternatifi
// Yaygın oylama terimleri için önceden hazırlanmış çeviriler

const translations = {
  // Yaygın oylama konuları
  'Yeni proje önerisi': 'New project proposal',
  'Bütçe onayı': 'Budget approval',
  'Yönetim kurulu seçimi': 'Board election',
  'Politika değişikliği': 'Policy change',
  'Sistem güncellemesi': 'System update',
  'Toplantı zamanı': 'Meeting time',
  'Etkinlik organizasyonu': 'Event organization',
  'Kaynak tahsisi': 'Resource allocation',
  'Strateji belirleme': 'Strategy determination',
  'İş birliği önerisi': 'Collaboration proposal',
  'Hangi programlama dilini tercih edersiniz?': 'Which programming language do you prefer?',
  'En iyi blockchain platformu hangisidir?': 'What is the best blockchain platform?',
  'Gelecek toplantı ne zaman olsun?': 'When should the next meeting be?',
  'Proje bütçesi ne kadar olmalı?': 'What should the project budget be?',
  'Hangi tasarımı beğeniyorsunuz?': 'Which design do you like?',
  'Test oylama': 'Test voting',
  'Deneme oylaması': 'Trial voting',
  'Örnek oylama': 'Sample voting',
  'Bir ülke, ulusal seçimlerini tamamen Zama benzeri bir FHE tabanlı sistemle yapabilseydi, sizce bu kabul edilmeli mi?': 'If a country could conduct its national elections entirely with a Zama-like FHE-based system, do you think this should be accepted?',
  'Bir ülke, ulusal chooseimlerini tamamen Zama benzeri bir FHE tabanlı sistemle yapabilseydi, sizce bu kabul edilmeli mi?': 'If a country could conduct its national elections entirely with a Zama-like FHE-based system, do you think this should be accepted?',
  // Daha fazla yaygın oylama konuları
  'Blockchain teknolojisi geleceğin oylaması mı?': 'Is blockchain technology the voting of the future?',
  'FHE ile gizli oylama sistemi': 'Secret voting system with FHE',
  'Kripto para kullanımı hakkında': 'About cryptocurrency usage',
  'Merkezi olmayan yönetim': 'Decentralized governance',
  'Akıllı kontrat güvenliği': 'Smart contract security',
  'Web3 teknolojileri': 'Web3 technologies',
  'NFT projeleri': 'NFT projects',
  'DeFi protokolleri': 'DeFi protocols',
  'DAO yönetimi': 'DAO governance',
  'Metaverse geliştirme': 'Metaverse development',
  
  // Yaygın seçenekler
  'Evet': 'Yes',
  'Hayır': 'No',
  'Evet — Şeffaf ama anonim oylar gelecektir.': 'Yes — Transparent but anonymous votes are the future.',
  'Belki — Hibrit bir modelle.': 'Maybe — With a hybrid model.',
  'Hayır — İnsan faktörü hâlâ gerekli.': 'No — The human factor is still necessary.',
  'Katılıyorum': 'I agree',
  'Katılmıyorum': 'I disagree',
  'Kararsızım': 'I am undecided',
  'Onaylıyorum': 'I approve',
  'Onaylamıyorum': 'I do not approve',
  'Destekliyorum': 'I support',
  'Desteklemiyorum': 'I do not support',
  'Kabul': 'Accept',
  'Ret': 'Reject',
  'Erteleme': 'Postpone',
  'Pazartesi': 'Monday',
  'Salı': 'Tuesday',
  'Çarşamba': 'Wednesday',
  'Perşembe': 'Thursday',
  'Cuma': 'Friday',
  'Cumartesi': 'Saturday',
  'Pazar': 'Sunday',
  'Sabah': 'Morning',
  'Öğle': 'Noon',
  'Akşam': 'Evening',
  'Gece': 'Night',
  'Seçenek A': 'Option A',
  'Seçenek B': 'Option B',
  'Seçenek C': 'Option C',
  'Seçenek D': 'Option D',
  'Birinci': 'First',
  'İkinci': 'Second',
  'Üçüncü': 'Third',
  'Dördüncü': 'Fourth',
  'Beşinci': 'Fifth'
};

// Basit kelime çevirisi
const wordTranslations = {
  'proje': 'project',
  'öneri': 'proposal',
  'bütçe': 'budget',
  'onay': 'approval',
  'seçim': 'election',
  'yönetim': 'management',
  'kurul': 'board',
  'politika': 'policy',
  'değişiklik': 'change',
  'sistem': 'system',
  'güncelleme': 'update',
  'toplantı': 'meeting',
  'zaman': 'time',
  'etkinlik': 'event',
  'organizasyon': 'organization',
  'kaynak': 'resource',
  'tahsis': 'allocation',
  'strateji': 'strategy',
  'belirleme': 'determination',
  'iş': 'work',
  'birliği': 'cooperation',
  'yeni': 'new',
  'eski': 'old',
  'büyük': 'big',
  'küçük': 'small',
  'önemli': 'important',
  'acil': 'urgent',
  'normal': 'normal',
  'hızlı': 'fast',
  'yavaş': 'slow',
  'hangi': 'which',
  'ne': 'what',
  'nasıl': 'how',
  'nerede': 'where',
  'neden': 'why',
  'kim': 'who',
  'kaç': 'how many',
  'kadar': 'how much',
  'tercih': 'prefer',
  'beğen': 'like',
  'seç': 'choose',
  'oyla': 'vote',
  'karar': 'decision',
  'sonuç': 'result',
  'başla': 'start',
  'bitir': 'end',
  'devam': 'continue',
  'dur': 'stop',
  'test': 'test',
  'deneme': 'trial',
  'örnek': 'sample',
  'gelecek': 'future',
  'geçmiş': 'past',
  'şimdi': 'now',
  'bugün': 'today',
  'yarın': 'tomorrow',
  'dün': 'yesterday'
};

// Ana çeviri fonksiyonu
export const translateText = (text, targetLanguage = 'en') => {
  if (!text || targetLanguage === 'tr') {
    return text;
  }
  
  // Önce tam metin çevirisine bak
  if (translations[text]) {
    return translations[text];
  }
  
  // Kelime kelime çeviri dene
  let translatedText = text;
  
  // Türkçe karakterleri normalize et
  const normalizedText = text.toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  
  // Kelime kelime çevir
  Object.keys(wordTranslations).forEach(turkishWord => {
    const englishWord = wordTranslations[turkishWord];
    const regex = new RegExp(`\\b${turkishWord}\\b`, 'gi');
    translatedText = translatedText.replace(regex, englishWord);
  });
  
  // İlk harfi büyük yap
  translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
  
  return translatedText;
};

// Seçenekler listesini çevir
export const translateOptions = (options, targetLanguage = 'en') => {
  if (!options || targetLanguage === 'tr') {
    return options;
  }
  
  return options.map(option => translateText(option, targetLanguage));
};

// Oylama bilgilerini çevir
export const translateVoting = (voting, targetLanguage = 'en') => {
  if (!voting || targetLanguage === 'tr') {
    return voting;
  }
  
  return {
    ...voting,
    proposal: translateText(voting.proposal, targetLanguage),
    options: translateOptions(voting.options, targetLanguage)
  };
};

// Çeviri ekle (admin paneli için)
export const addTranslation = (turkish, english) => {
  translations[turkish] = english;
};

// Mevcut çevirileri getir
export const getTranslations = () => {
  return { ...translations };
};

// Çeviri var mı kontrol et
export const hasTranslation = (text) => {
  return translations.hasOwnProperty(text);
};