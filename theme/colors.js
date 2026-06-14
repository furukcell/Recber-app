// Reçber - Renk Paleti
// Tarımsal his: Orman yeşili + Buğday altını + Krem

const COLORS = {
  // Ana Renkler
  primary: '#3D5A3E',        // Orman yeşili - ana renk, butonlar
  primaryDark: '#2C3E2D',    // Koyu yeşil - başlıklar
  primaryLight: '#5A7A5B',   // Açık yeşil - hover, aktif
  
  // Aksan
  accent: '#C9A84C',         // Buğday altını - vurgu, rozetler
  accentLight: '#E8C96A',    // Açık altın
  accentDark: '#A07830',     // Koyu altın

  // Arka Planlar
  background: '#F5F0E8',     // Krem - ana arka plan
  surface: '#FFFFFF',        // Beyaz - kartlar
  surfaceAlt: '#EAF0EA',     // Çok açık yeşil - alternatif kart

  // Metin
  textPrimary: '#2C3E2D',    // Koyu yeşil - ana metin
  textSecondary: '#6B7280',  // Gri - yardımcı metin
  textLight: '#9CA3AF',      // Açık gri - placeholder
  textOnPrimary: '#FFFFFF',  // Beyaz - primary üstündeki metin
  textOnAccent: '#2C3E2D',   // Koyu - accent üstündeki metin

  // Durum Renkleri
  success: '#2ECC71',        // Yeşil - başarı, sağlıklı
  warning: '#F39C12',        // Turuncu - uyarı
  danger: '#C0392B',         // Kırmızı - tehlike, hasta
  info: '#3498DB',           // Mavi - bilgi

  // Modül Renkleri
  besi: '#3D5A3E',           // Besi modülü - orman yeşili
  suru: '#1A5276',           // Sürü modülü - koyu mavi

  // Sınırlar & Ayraçlar
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#EDF2F7',

  // Şeffaflıklar (rgba formatında)
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.15)',
  primaryOverlay: 'rgba(61,90,62,0.1)',
  accentOverlay: 'rgba(201,168,76,0.15)',
};

export default COLORS;
