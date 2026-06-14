// Reçber - Hesaplama Fonksiyonları
// src/utils/hesaplama.js

import { IRK_PERFORMANS_TABLOSU, VARSAYILAN_FIYATLAR } from '../data/constants';

// ─── YAŞ HESAPLA ──────────────────────────────────────────────────
// dogumTarihi: "15.03.2024" formatında string
// Geriye ay cinsinden yaş döner
export const yasAyHesapla = (hayvan) => {
  if (!hayvan?.dogumTarihi) return null;
  const parcalar = hayvan.dogumTarihi.split('.');
  if (parcalar.length !== 3) return null;
  const dogum = new Date(`${parcalar[2]}-${parcalar[1]}-${parcalar[0]}`);
  if (isNaN(dogum)) return null;
  const simdi = new Date();
  const ayFark =
    (simdi.getFullYear() - dogum.getFullYear()) * 12 +
    (simdi.getMonth() - dogum.getMonth());
  return ayFark > 0 ? ayFark : 0;
};

// ─── BESİ GÜNÜ HESAPLA ────────────────────────────────────────────
export const besiGunuHesapla = (hayvan) => {
  if (!hayvan?.olusturmaTarihi) return 0;
  return Math.floor(
    (Date.now() - new Date(hayvan.olusturmaTarihi)) / 86400000
  );
};

// ─── GCAA HESAPLA ─────────────────────────────────────────────────
// Günlük Canlı Ağırlık Artışı
export const gunlukCanliAgirlikArtisi = (hayvan, tartimlar) => {
  // Tartım geçmişi varsa daha doğru hesap yap
  if (tartimlar && tartimlar.length >= 2) {
    const sirali = [...tartimlar].sort(
      (a, b) => new Date(a.olusturmaTarihi) - new Date(b.olusturmaTarihi)
    );
    const ilk = sirali[0];
    const son = sirali[sirali.length - 1];
    const gun =
      Math.floor(
        (new Date(son.olusturmaTarihi) - new Date(ilk.olusturmaTarihi)) /
          86400000
      ) || 1;
    const kgFark = parseFloat(son.kilo || 0) - parseFloat(ilk.kilo || 0);
    return parseFloat((kgFark / gun).toFixed(2));
  }

  // Tartım yoksa alış kilosu vs güncel kilo
  const gun = besiGunuHesapla(hayvan) || 1;
  const kgFark =
    parseFloat(hayvan?.guncelKilo || 0) - parseFloat(hayvan?.alisKilo || 0);
  return parseFloat((kgFark / gun).toFixed(2));
};

// ─── IRKA GÖRE PERFORMANS DEĞERLENDİR ────────────────────────────
export const irkaGorePerformansDegerlendir = (hayvan, tartimlar) => {
  const gcaa = gunlukCanliAgirlikArtisi(hayvan, tartimlar);
  const yasAy = yasAyHesapla(hayvan);
  const irkId = hayvan?.irk?.toLowerCase();

  // Irk veya yaş bilgisi yoksa
  if (!irkId || !yasAy || !IRK_PERFORMANS_TABLOSU[irkId]) {
    return {
      durum: 'bilinmiyor',
      baslik: 'Irk veya yaş bilgisi eksik',
      beklenenMin: null,
      beklenenMax: null,
      ideal: null,
      mevcutGcaa: gcaa,
      mesaj: 'Irk ve doğum tarihi girilirse ırka özgü performans değerlendirmesi yapılabilir.',
      tavsiye: 'Hayvan bilgilerini güncelleyerek daha doğru analiz alabilirsiniz.',
    };
  }

  const irkBilgi = IRK_PERFORMANS_TABLOSU[irkId];
  const aralik = irkBilgi.yasAraliklari.find(
    (a) => yasAy >= a.minAy && yasAy <= a.maxAy
  );

  // Yaş aralığı bulunamadı
  if (!aralik) {
    return {
      durum: 'bilinmiyor',
      baslik: 'Bu yaş için referans değer yok',
      beklenenMin: null,
      beklenenMax: null,
      ideal: null,
      mevcutGcaa: gcaa,
      mesaj: `${irkBilgi.ad} için ${yasAy} aylık yaşa ait referans tablo bulunamadı.`,
      tavsiye: 'Genel GCAA değerlendirmesi üzerinden takip edebilirsiniz.',
    };
  }

  // Durum belirle
  let durum, baslik, mesaj, tavsiye;

  if (gcaa < aralik.minGcaa) {
    durum = 'dusuk';
    baslik = 'Beklenenin Altında';
    mesaj = `${irkBilgi.ad} için ${aralik.minAy}-${aralik.maxAy} ay aralığında beklenen günlük canlı ağırlık artışı ${aralik.minGcaa} - ${aralik.maxGcaa} kg/gün civarıdır. Bu hayvanda ${gcaa} kg/gün görünüyor.`;
    tavsiye = 'Kilo artışı beklenenin altında. Yem rasyonu, parazit durumu, sağlık ve yem tüketimi kontrol edilmeli.';
  } else if (gcaa > aralik.maxGcaa) {
    durum = 'cok_iyi';
    baslik = 'Beklenenin Üstünde ⭐';
    mesaj = `${irkBilgi.ad} için ${aralik.minAy}-${aralik.maxAy} ay aralığında beklenen günlük canlı ağırlık artışı ${aralik.minGcaa} - ${aralik.maxGcaa} kg/gün civarıdır. Bu hayvanda ${gcaa} kg/gün görünüyor.`;
    tavsiye = 'Mükemmel performans! Mevcut rasyon ve bakım koşullarını koruyun.';
  } else {
    durum = 'normal';
    baslik = 'Normal Aralıkta ✅';
    mesaj = `${irkBilgi.ad} için ${aralik.minAy}-${aralik.maxAy} ay aralığında beklenen günlük canlı ağırlık artışı ${aralik.minGcaa} - ${aralik.maxGcaa} kg/gün civarıdır. Bu hayvanda ${gcaa} kg/gün görünüyor.`;
    tavsiye = 'Performans beklenen aralıkta. Takibe devam edin.';
  }

  return {
    durum,
    baslik,
    beklenenMin: aralik.minGcaa,
    beklenenMax: aralik.maxGcaa,
    ideal: aralik.idealGcaa,
    mevcutGcaa: gcaa,
    mesaj,
    tavsiye,
  };
};

// ─── TOPLAM YEM MALİYETİ ──────────────────────────────────────────
// Basit yaklaşım: toplam yem maliyetini aktif hayvan sayısına böl
export const toplamYemMaliyeti = (hayvanId, yemAlimlar, tumHayvanlar) => {
  const toplamMaliyet = yemAlimlar.reduce(
    (acc, a) => acc + parseFloat(a.fiyat || 0),
    0
  );
  const aktifHayvanSayisi =
    tumHayvanlar?.filter((h) => !h.satildiMi).length || 1;
  return Math.round(toplamMaliyet / aktifHayvanSayisi);
};

// ─── TOPLAM SAĞLIK MALİYETİ ───────────────────────────────────────
export const toplamSaglikMaliyeti = (hayvanId, saglikKayitlari) => {
  return saglikKayitlari
    .filter((s) => s.hayvanId === hayvanId)
    .reduce((acc, s) => acc + parseFloat(s.maliyet || 0), 0);
};

// ─── TOPLAM MALİYET ───────────────────────────────────────────────
export const toplamMaliyet = (hayvan, yemAlimlar, saglikKayitlari, tumHayvanlar) => {
  const alis = parseFloat(hayvan?.alisFiyat || 0);
  const yem = toplamYemMaliyeti(hayvan?.id, yemAlimlar, tumHayvanlar);
  const saglik = toplamSaglikMaliyeti(hayvan?.id, saglikKayitlari);
  return Math.round(alis + yem + saglik);
};

// ─── TAHMİNİ SATIŞ GELİRİ ────────────────────────────────────────
// hesapTipi: 'canli' | 'karkas'
export const tahminiSatisGeliri = (hayvan, fiyat, hesapTipi, randiman) => {
  const kilo = parseFloat(hayvan?.guncelKilo || 0);
  const r = parseFloat(randiman ?? VARSAYILAN_FIYATLAR.randimanOrani);
  const f = parseFloat(fiyat || 0);

  if (hesapTipi === 'karkas') {
    const karkasKilo = kilo * r;
    return Math.round(karkasKilo * f);
  }
  // canlı
  return Math.round(kilo * f);
};

// ─── TAHMİNİ KAR / ZARAR ─────────────────────────────────────────
export const tahminiKarZarar = (
  hayvan,
  yemAlimlar,
  saglikKayitlari,
  tumHayvanlar,
  fiyat,
  hesapTipi,
  randiman
) => {
  const gelir = tahminiSatisGeliri(hayvan, fiyat, hesapTipi, randiman);
  const maliyet = toplamMaliyet(hayvan, yemAlimlar, saglikKayitlari, tumHayvanlar);
  const kar = gelir - maliyet;
  const karYuzde = maliyet > 0 ? parseFloat(((kar / maliyet) * 100).toFixed(1)) : 0;
  return { gelir, maliyet, kar, karYuzde };
};

// ─── SATIŞ TAVSİYESİ ──────────────────────────────────────────────
export const satisTavsiyesi = (
  hayvan,
  tartimlar,
  yemAlimlar,
  saglikKayitlari,
  tumHayvanlar,
  fiyat,
  hesapTipi,
  randiman
) => {
  const gun = besiGunuHesapla(hayvan);
  const gcaa = gunlukCanliAgirlikArtisi(hayvan, tartimlar);
  const performans = irkaGorePerformansDegerlendir(hayvan, tartimlar);
  const { gelir, maliyet, kar, karYuzde } = tahminiKarZarar(
    hayvan, yemAlimlar, saglikKayitlari, tumHayvanlar,
    fiyat, hesapTipi, randiman
  );

  // Yeterli veri yok
  if (!fiyat || parseFloat(fiyat) === 0) {
    return {
      karar: 'TAKIP_ET',
      seviye: 'uyari',
      baslik: 'Fiyat Bilgisi Eksik',
      gerekce: 'Tavsiye için güncel kg fiyatı giriniz.',
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  if (tartimlar?.length < 2) {
    return {
      karar: 'TAKIP_ET',
      seviye: 'uyari',
      baslik: 'Yeterli Tartım Verisi Yok',
      gerekce: 'En az 2 tartım kaydı girildiğinde daha sağlıklı tavsiye verilir.',
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // Hedef kiloya ulaştı mı?
  const hedefKilo = parseFloat(hayvan?.hedefKilo || 0);
  const guncelKilo = parseFloat(hayvan?.guncelKilo || 0);
  const hedefeUlasti = hedefKilo > 0 && guncelKilo >= hedefKilo;

  // 30 günde beklenen ek kar
  const gunlukYemMaliyet = gun > 0 ? (maliyet - parseFloat(hayvan?.alisFiyat || 0)) / gun : 0;
  const beklenenEkKilo = gcaa * 30;
  const beklenenEkGelir = tahminiSatisGeliri(
    { ...hayvan, guncelKilo: guncelKilo + beklenenEkKilo },
    fiyat, hesapTipi, randiman
  ) - gelir;
  const ekYemMaliyet = gunlukYemMaliyet * 30;
  const netEkKar = beklenenEkGelir - ekYemMaliyet;

  // ─── KARAR MANTIĞI ────────────────────────────────────────────
  // 1. Hedef kiloya ulaştı + kar pozitif + GCAA düşüyor
  if (hedefeUlasti && kar > 0 && gcaa < 1.2) {
    return {
      karar: 'SAT',
      seviye: 'olumlu',
      baslik: 'Hedef Kiloya Ulaşıldı',
      gerekce: `Hedef ${hedefKilo} kg'a ulaşıldı. Kar pozitif ve GCAA yavaşlıyor. Satış için iyi zaman.`,
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // 2. GCAA ırk ortalamasının altı + yem maliyeti artıyor + kar pozitif
  if (performans.durum === 'dusuk' && kar > 0 && gun >= 60) {
    return {
      karar: 'SAT',
      seviye: 'uyari',
      baslik: 'Satış Zamanı Yaklaşıyor',
      gerekce: `GCAA (${gcaa} kg/gün) ırk ortalamasının altında. Kar pozitif (%${karYuzde}) iken satış değerlendirilebilir.`,
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // 3. Kar marjı %20 üstü + 90 günden fazla
  if (karYuzde >= 20 && gun >= 90) {
    return {
      karar: 'SAT',
      seviye: 'olumlu',
      baslik: 'İyi Getiri Noktası',
      gerekce: `%${karYuzde} kar marjına ulaşıldı. ${gun} günlük besi için iyi bir satış noktası.`,
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // 4. 120 günden fazla + GCAA < 1.3
  if (gun >= 120 && gcaa < 1.3) {
    return {
      karar: 'SAT',
      seviye: 'uyari',
      baslik: 'Uzun Besi — Verim Yavaşlıyor',
      gerekce: `${gun} günlük besi. GCAA ${gcaa} kg/gün ile yavaşlıyor. Daha fazla beklemek karlılığı düşürebilir.`,
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // 5. Kar negatif + GCAA iyi
  if (kar < 0 && (performans.durum === 'normal' || performans.durum === 'cok_iyi')) {
    return {
      karar: 'TAKIP_ET',
      seviye: 'uyari',
      baslik: 'Biraz Daha Takip Et',
      gerekce: `Şu an zarar var (${Math.round(kar).toLocaleString('tr-TR')} TL) ama GCAA iyi. ${Math.round(netEkKar).toLocaleString('tr-TR')} TL net ek kar bekleniyor.`,
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // 6. Kar negatif + GCAA düşük
  if (kar < 0 && performans.durum === 'dusuk') {
    return {
      karar: 'SAT',
      seviye: 'risk',
      baslik: 'Maliyetleri Kontrol Et',
      gerekce: `Hem zarar var (${Math.round(kar).toLocaleString('tr-TR')} TL) hem GCAA düşük. Satışı değerlendirin veya veteriner kontrolü yaptırın.`,
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // 7. 30 gün daha beklemek karlıysa bekle
  if (netEkKar > 0 && gun < 120) {
    return {
      karar: 'BEKLE',
      seviye: 'olumlu',
      baslik: '30 Gün Daha Bekle',
      gerekce: `30 gün daha beklersen tahminen +${beklenenEkKilo.toFixed(0)} kg ve ~${Math.round(netEkKar).toLocaleString('tr-TR')} TL net ek kazanç bekleniyor.`,
      detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
    };
  }

  // 8. Varsayılan
  return {
    karar: 'TAKIP_ET',
    seviye: 'uyari',
    baslik: 'Takibe Devam Et',
    gerekce: 'Besi süreci devam ediyor. Haftalık tartım kayıtlarını düzenli gir.',
    detaylar: { gcaa, karZarar: kar, performansDurumu: performans.durum },
  };
};
