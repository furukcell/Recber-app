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
  { id: 'istahsiz',  label: 'İştahsız',  icon: 'food-off',      renk: '#F39C12' },
  { id: 'halsiz',    label: 'Halsiz',    icon: 'emoticon-sad',  renk: '#E67E22' },
  { id: 'oksuruk',   label: 'Öksürük',   icon: 'weather-windy', renk: '#E74C3C' },
  { id: 'yaralanma', label: 'Yaralanma', icon: 'bandage',       renk: '#C0392B' },
  { id: 'ishal',     label: 'İshal',     icon: 'alert-circle',  renk: '#D35400' },
  { id: 'sisme',     label: 'Şişme',     icon: 'circle-expand', renk: '#8E44AD' },
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

// --- GCAA SINIRLAR (genel, ırk bilgisi yoksa kullanılır) ---
export const GCAA_SINIRLAR = {
  dusuk: 1.0,
  orta: 1.5,
};

export const GCAA_RENKLER = {
  dusuk:  '#C0392B',
  orta:   '#F39C12',
  iyi:    '#2ECC71',
};

// --- IRK LİSTESİ ---
export const IRK_LISTESI = [
  { id: 'simental',  label: 'Simental' },
  { id: 'holstein',  label: 'Holstein' },
  { id: 'montofon',  label: 'Montofon / Esmer' },
  { id: 'angus',     label: 'Angus' },
  { id: 'limousin',  label: 'Limousin' },
  { id: 'charolais', label: 'Charolais' },
  { id: 'melez',     label: 'Melez' },
  { id: 'diger',     label: 'Diğer' },
];

// --- IRK PERFORMANS TABLOSU ---
// Yaş aralığına göre beklenen GCAA (kg/gün) değerleri
// Bu değerler pratik referans amaçlıdır, kesin veterinerlik hükmü değildir.
export const IRK_PERFORMANS_TABLOSU = {
  simental: {
    ad: 'Simental',
    yasAraliklari: [
      { minAy: 6,  maxAy: 9,  minGcaa: 1.0, idealGcaa: 1.2,  maxGcaa: 1.4  },
      { minAy: 10, maxAy: 15, minGcaa: 1.2, idealGcaa: 1.45, maxGcaa: 1.7  },
      { minAy: 16, maxAy: 22, minGcaa: 1.0, idealGcaa: 1.3,  maxGcaa: 1.55 },
    ],
  },
  holstein: {
    ad: 'Holstein',
    yasAraliklari: [
      { minAy: 6,  maxAy: 9,  minGcaa: 0.9, idealGcaa: 1.1,  maxGcaa: 1.3  },
      { minAy: 10, maxAy: 15, minGcaa: 1.0, idealGcaa: 1.25, maxGcaa: 1.5  },
      { minAy: 16, maxAy: 22, minGcaa: 0.9, idealGcaa: 1.15, maxGcaa: 1.4  },
    ],
  },
  montofon: {
    ad: 'Montofon / Esmer',
    yasAraliklari: [
      { minAy: 6,  maxAy: 9,  minGcaa: 0.9,  idealGcaa: 1.1,  maxGcaa: 1.3  },
      { minAy: 10, maxAy: 15, minGcaa: 1.0,  idealGcaa: 1.25, maxGcaa: 1.45 },
      { minAy: 16, maxAy: 22, minGcaa: 0.85, idealGcaa: 1.1,  maxGcaa: 1.35 },
    ],
  },
  angus: {
    ad: 'Angus',
    yasAraliklari: [
      { minAy: 6,  maxAy: 9,  minGcaa: 1.0,  idealGcaa: 1.2,  maxGcaa: 1.45 },
      { minAy: 10, maxAy: 15, minGcaa: 1.15, idealGcaa: 1.4,  maxGcaa: 1.65 },
      { minAy: 16, maxAy: 22, minGcaa: 0.95, idealGcaa: 1.25, maxGcaa: 1.5  },
    ],
  },
  limousin: {
    ad: 'Limousin',
    yasAraliklari: [
      { minAy: 6,  maxAy: 9,  minGcaa: 1.0, idealGcaa: 1.25, maxGcaa: 1.5  },
      { minAy: 10, maxAy: 15, minGcaa: 1.2, idealGcaa: 1.45, maxGcaa: 1.75 },
      { minAy: 16, maxAy: 22, minGcaa: 1.0, idealGcaa: 1.3,  maxGcaa: 1.55 },
    ],
  },
  charolais: {
    ad: 'Charolais',
    yasAraliklari: [
      { minAy: 6,  maxAy: 9,  minGcaa: 1.05, idealGcaa: 1.3,  maxGcaa: 1.55 },
      { minAy: 10, maxAy: 15, minGcaa: 1.25, idealGcaa: 1.5,  maxGcaa: 1.8  },
      { minAy: 16, maxAy: 22, minGcaa: 1.05, idealGcaa: 1.35, maxGcaa: 1.6  },
    ],
  },
  melez: {
    ad: 'Melez',
    yasAraliklari: [
      { minAy: 6,  maxAy: 9,  minGcaa: 0.8, idealGcaa: 1.0,  maxGcaa: 1.25 },
      { minAy: 10, maxAy: 15, minGcaa: 0.9, idealGcaa: 1.15, maxGcaa: 1.4  },
      { minAy: 16, maxAy: 22, minGcaa: 0.8, idealGcaa: 1.0,  maxGcaa: 1.25 },
    ],
  },
};

// --- SATIŞ DURUMu ---
export const SATIS_DURUM = {
  aktif:   { label: 'Beside',  renk: '#3D5A3E', icon: 'clock-outline' },
  satildi: { label: 'Satıldı', renk: '#6B7280', icon: 'check-circle'  },
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
  { id: 'laktasyon', label: 'Laktasyon',    renk: '#1A5276' },
  { id: 'kuru',      label: 'Kuru Dönem',   renk: '#6B7280' },
  { id: 'dogum',     label: 'Doğum Yakın',  renk: '#E74C3C' },
];

// --- HESAP TİPLERİ ---
export const HESAP_TIPLERI = [
  { id: 'canli',  label: 'Canlı kg Fiyatı' },
  { id: 'karkas', label: 'Karkas kg Fiyatı' },
];

// --- VARSAYILAN FİYATLAR ---
export const VARSAYILAN_FIYATLAR = {
  canliKgFiyat:  300,
  karkasKgFiyat: 600,
  randimanOrani: 0.55,
};

// --- STORAGE KEY'LERİ ---
export const STORAGE_KEYS = {
  hayvanlar:        '@recber_hayvanlar',
  haftalikKayitlar: '@recber_haftalik',
  yemAlimlar:       '@recber_yemler',
  asiTakvimi:       '@recber_asilar',
  saglikKayitlar:   '@recber_saglik',
  satislar:         '@recber_satislar',
  suruHayvanlar:    '@recber_suru',
  sutKayitlari:     '@recber_sut',
  aktifModul:       '@recber_modul',
  ayarlar:          '@recber_ayarlar',
  pro:              '@recber_pro',
};

// --- UYGULAMA SABİTLERİ ---
export const APP = {
  isim:          'Reçber',
  versiyon:      '1.0.0',
  besiBolumu:    'Besi',
  suruBolumu:    'Sürü',
  ucretsizLimit: 2,      // ücretsiz max hayvan sayısı
  proFiyat:      499,    // TL
};
