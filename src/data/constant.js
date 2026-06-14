// Reçber - Sabit Değerler

// --- YEM TİPLERİ ---
export const YEM_TIPLERI = [
  { id: 'arpa',     label: 'Arpa',      icon: 'barley',       renk: '#C9A84C' },
  { id: 'saman',    label: 'Saman',     icon: 'hay-bale',     renk: '#E8C96A' },
  { id: 'silaj',    label: 'Silaj',     icon: 'corn',         renk: '#5A7A5B' },
  { id: 'besiYemi', label: 'Besi Yemi', icon: 'food-variant', renk: '#3D5A3E' },
  { id: 'yonca',    label: 'Yonca',     icon: 'leaf',         renk: '#2ECC71' },
  { id: 'misir',    label: 'Mısır',     icon: 'corn',         renk: '#F39C12' },
];

// --- SAĞLIK BELİRTİLERİ ---
export const SAGLIK_BELIRTILERI = [
  { id: 'istahsiz',  label: 'İştahsız',  icon: 'food-off',         renk: '#F39C12' },
  { id: 'halsiz',    label: 'Halsiz',    icon: 'emoticon-sad',      renk: '#E67E22' },
  { id: 'oksuruk',   label: 'Öksürük',   icon: 'weather-windy',     renk: '#E74C3C' },
  { id: 'yaralanma', label: 'Yaralanma', icon: 'bandage',           renk: '#C0392B' },
  { id: 'ishal',     label: 'İshal',     icon: 'alert-circle',      renk: '#D35400' },
  { id: 'sisme',     label: 'Şişme',     icon: 'circle-expand',     renk: '#8E44AD' },
];

// --- AŞI TÜRLERİ ---
export const ASI_TURLERI = [
  'Şap Aşısı',
  'Karma Aşı (Brucella)',
  'IBR Aşısı',
  'BVD Aşısı',
  'Clostridial Aşı',
  'Parazit İlacı',
  'Diğer',
];

// --- GCAA DEĞERLEME ---
// Günlük Canlı Ağırlık Artışı değerlendirmesi
export const GCAA_SINIRLAR = {
  dusuk: 1.0,    // altı kırmızı
  orta: 1.5,     // arası sarı
  // üstü yeşil
};

export const GCAA_RENKLER = {
  dusuk:  '#C0392B',
  orta:   '#F39C12',
  iyi:    '#2ECC71',
};

// --- SATIŞ DURUMU ---
export const SATIS_DURUM = {
  aktif:  { label: 'Beside',  renk: '#3D5A3E', icon: 'clock-outline' },
  satildi:{ label: 'Satıldı', renk: '#6B7280', icon: 'check-circle'  },
};

// --- MODÜLLER ---
export const MODULLER = {
  besi: {
    id: 'besi',
    label: 'Besi',
    aciklama: 'Dana & Boğa Besi Takibi',
    icon: 'cow',
    renk: '#3D5A3E',
  },
  suru: {
    id: 'suru',
    label: 'Sürü',
    aciklama: 'Süt İneği & Laktasyon Takibi',
    icon: 'cow',
    renk: '#1A5276',
  },
};

// --- LAKTASYON ---
export const LAKTASYON_DONEM = [
  { id: 'laktasyon', label: 'Laktasyon', renk: '#1A5276' },
  { id: 'kuru',      label: 'Kuru Dönem', renk: '#6B7280' },
  { id: 'dogum',     label: 'Doğum Yakın', renk: '#E74C3C' },
];

// --- STORAGE KEY'LERİ ---
export const STORAGE_KEYS = {
  hayvanlar:      '@recber_hayvanlar',
  haftalikKayitlar: '@recber_haftalik',
  yemAlimlar:     '@recber_yemler',
  asiTakvimi:     '@recber_asilar',
  saglikKayitlar: '@recber_saglik',
  satislar:       '@recber_satislar',
  suruHayvanlar:  '@recber_suru',
  sutKayitlari:   '@recber_sut',
  aktifModul:     '@recber_modul',
};

// --- UYGULAMA SABİTLERİ ---
export const APP = {
  isim: 'Reçber',
  versiyon: '1.0.0',
  besiBolumu: 'Besi',
  suruBolumu: 'Sürü',
};
