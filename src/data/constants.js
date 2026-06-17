// Reçber - Sabit Değerler

// --- YEM TİPLERİ (Besi) ---
export const YEM_TIPLERI = [
  { id: 'arpa',     label: 'Arpa',      icon: 'barley',       renk: '#C9A84C' },
  { id: 'saman',    label: 'Saman',     icon: 'hay-bale',     renk: '#E8C96A' },
  { id: 'silaj',    label: 'Silaj',     icon: 'corn',         renk: '#5A7A5B' },
  { id: 'besiYemi', label: 'Besi Yemi', icon: 'food-variant', renk: '#3D5A3E' },
  { id: 'yonca',    label: 'Yonca',     icon: 'leaf',         renk: '#2ECC71' },
  { id: 'misir',    label: 'Mısır',     icon: 'corn',         renk: '#F39C12' },
];

// --- KÜMES YEM TİPLERİ ---
export const KUMES_YEM_TIPLERI = [
  { id: 'yemlik',   label: 'Yemlik',     icon: 'food-variant', renk: '#E67E22' },
  { id: 'misir',    label: 'Mısır',      icon: 'corn',         renk: '#F39C12' },
  { id: 'bugday',   label: 'Buğday',     icon: 'barley',       renk: '#C9A84C' },
  { id: 'kepek',    label: 'Kepek',      icon: 'grain',        renk: '#A0522D' },
  { id: 'ayckabi',  label: 'Ay Çekirdeği', icon: 'flower',    renk: '#DAA520' },
  { id: 'diger',    label: 'Diğer',      icon: 'dots-horizontal', renk: '#95A5A6' },
];

// --- KÜMES TİPLERİ ---
export const KUMES_TIPLERI = [
  { id: 'yumurta', label: 'Yumurta Tavuğu', icon: 'egg',        renk: '#E67E22' },
  { id: 'etlik',   label: 'Etlik Piliç',    icon: 'food-drumstick', renk: '#C0392B' },
  { id: 'karisik', label: 'Karışık',        icon: 'bird',       renk: '#8E44AD' },
];

// --- KÜMES IRK LİSTESİ ---
export const KUMES_IRK_LISTESI = [
  { id: 'lohmann',  label: 'Lohmann Brown' },
  { id: 'isa',      label: 'ISA Brown' },
  { id: 'ross',     label: 'Ross 308 (Et)' },
  { id: 'cobb',     label: 'Cobb 500 (Et)' },
  { id: 'koy',      label: 'Köy Tavuğu' },
  { id: 'diger',    label: 'Diğer' },
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

// --- GCAA SINIRLAR ---
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

// --- SATIŞ DURUMU ---
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
  kumes: {
    id: 'kumes',
    label: 'Kümes',
    aciklama: 'Tavuk & Yumurta Takibi',
    icon: 'bird',
    renk: '#A0522D',
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

// --- RASYON SİSTEMİ ────────────────────────────────────────────
// Grup rasyonu: modül geneli tek sabit grup (kullanıcı kendi grup
// oluşturmuyor, "Tüm Besi" / "Tüm Laktasyondaki İnekler" şeklinde).
export const RASYON_GRUP_ID = {
  besi: 'tum_besi',
  sut:  'tum_laktasyon',
};

export const RASYON_GRUP_AD = {
  besi: 'Tüm Besi Hayvanları',
  sut:  'Tüm Laktasyondaki İnekler',
};

// --- STORAGE KEY'LERİ ---
export const STORAGE_KEYS = {
  hayvanlar:        '@recber_hayvanlar',
  haftalikKayitlar: '@recber_haftalik',
  yemAlimlar:       '@recber_yemler',
  asiTakvimi:       '@recber_asilar',
  saglikKayitlar:   '@recber_saglik',
  satislar:         '@recber_satislar',

  // Sürü / Süt
  suruHayvanlar:    '@recber_suru',
  sutKayitlari:     '@recber_sut',

  // Ortak Ambar / Yem Stok
  ambarYemleri:     '@recber_ambar_yemleri',
  yemKullanimlari:  '@recber_yem_kullanimlari',

  // Rasyon Sistemi (otomatik günlük yem düşümü)
  rasyonlar:        '@recber_rasyonlar',

  // Genel
  aktifModul:       '@recber_modul',
  ayarlar:          '@recber_ayarlar',
  pro:              '@recber_pro',

  // Kümes
  kumesGruplar:     '@recber_kumes_gruplar',
  kumesYumurta:     '@recber_kumes_yumurta',
  kumesYemAlim:     '@recber_kumes_yem',
  kumesSatis:       '@recber_kumes_satis',
  kumesKayip:       '@recber_kumes_kayip',
};

// --- UYGULAMA SABİTLERİ ---
export const APP = {
  isim:          'Reçber',
  versiyon:      '1.0.0',
  besiBolumu:    'Besi',
  suruBolumu:    'Sürü',
  kumesBolumu:   'Kümes',
  ucretsizLimit: 2,
  proFiyat:      499,
};
