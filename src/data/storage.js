// Reçber - Storage Katmanı
// AsyncStorage üzerinde tüm CRUD işlemleri + JSON yedekleme

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, VARSAYILAN_FIYATLAR } from './constants';

// ─── YARDIMCI FONKSİYONLAR ────────────────────────────────────────

const getItem = async (key) => {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error(`getItem hata [${key}]:`, e);
    return [];
  }
};

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`setItem hata [${key}]:`, e);
    return false;
  }
};

export const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 5);

// ─── BESİ HAYVANLARI ──────────────────────────────────────────────

export const getHayvanlar = () => getItem(STORAGE_KEYS.hayvanlar);

export const saveHayvanlar = (liste) => setItem(STORAGE_KEYS.hayvanlar, liste);

export const hayvanEkle = async (hayvan) => {
  const liste = await getHayvanlar();
  const yeni = {
    ...hayvan,
    id: generateId(),
    guncelKilo: hayvan.alisKilo,
    toplamYem: 0,
    saglik: 'saglikli',
    olusturmaTarihi: new Date().toISOString(),
    satildiMi: false,
  };
  liste.unshift(yeni);
  await saveHayvanlar(liste);
  return yeni;
};

export const hayvanGuncelle = async (id, guncellemeler) => {
  const liste = await getHayvanlar();
  const yeni = liste.map((h) => (h.id === id ? { ...h, ...guncellemeler } : h));
  await saveHayvanlar(yeni);
  return yeni;
};

export const hayvanSil = async (id) => {
  const liste = await getHayvanlar();
  const yeni = liste.filter((h) => h.id !== id);
  await saveHayvanlar(yeni);
  return yeni;
};

// ─── HAFTALIK TARTIM KAYITLARI ────────────────────────────────────

export const getHaftalikKayitlar = () => getItem(STORAGE_KEYS.haftalikKayitlar);

export const saveHaftalikKayitlar = (liste) =>
  setItem(STORAGE_KEYS.haftalikKayitlar, liste);

export const haftalikKayitEkle = async (kayit) => {
  const liste = await getHaftalikKayitlar();
  const toplamYemHafta =
    parseFloat(kayit.besiYemi || 0) +
    parseFloat(kayit.saman || 0) +
    parseFloat(kayit.silaj || 0) +
    parseFloat(kayit.arpa || 0) +
    parseFloat(kayit.misir || 0) +
    parseFloat(kayit.yonca || 0);

  const yeni = {
    ...kayit,
    id: generateId(),
    toplam: toplamYemHafta,
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveHaftalikKayitlar(liste);

  // Hayvanın güncel kilosunu güncelle
  const hayvanlar = await getHayvanlar();
  const guncelHayvanlar = hayvanlar.map((h) => {
    if (h.id === kayit.hayvanId) {
      return {
        ...h,
        guncelKilo: kayit.kilo,
        toplamYem: parseFloat(h.toplamYem || 0) + toplamYemHafta,
      };
    }
    return h;
  });
  await saveHayvanlar(guncelHayvanlar);
  return yeni;
};

export const hayvanKayitlari = async (hayvanId) => {
  const liste = await getHaftalikKayitlar();
  return liste.filter((k) => k.hayvanId === hayvanId);
};

// ─── YEM ALIMLARI ─────────────────────────────────────────────────

export const getYemAlimlar = () => getItem(STORAGE_KEYS.yemAlimlar);

export const saveYemAlimlar = (liste) => setItem(STORAGE_KEYS.yemAlimlar, liste);

export const yemAlimEkle = async (alim) => {
  const liste = await getYemAlimlar();
  const yeni = {
    ...alim,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveYemAlimlar(liste);
  return yeni;
};
export const yemAlimSil = async (id) => {
  const liste = await getYemAlimlar();
  const yeni = liste.filter((a) => a.id !== id);
  await saveYemAlimlar(yeni);
  return yeni;
};
export const getStokDurum = async () => {
  const alimlar = await getYemAlimlar();
  const kayitlar = await getHaftalikKayitlar();
  const tipler = ['arpa', 'saman', 'silaj', 'besiYemi', 'yonca', 'misir'];

  return tipler.map((tip) => {
    const tipAlimlar = alimlar.filter((a) => a.tip === tip);

    const toplamAlinan = tipAlimlar.reduce(
      (acc, curr) => acc + parseFloat(curr.miktar || 0), 0
    );
    const toplamHarcama = tipAlimlar.reduce(
      (acc, curr) => acc + parseFloat(curr.fiyat || 0), 0
    );
    const kgBasinaMaliyet =
      toplamAlinan > 0 ? (toplamHarcama / toplamAlinan).toFixed(2) : null;

    const toplamVerilen = kayitlar.reduce(
      (acc, curr) => acc + parseFloat(curr[tip] || 0), 0
    );

    const kalan = Math.max(toplamAlinan - toplamVerilen, 0);
    const yuzde = toplamAlinan > 0 ? Math.round((kalan / toplamAlinan) * 100) : 0;
    const kayitsizKullanim = toplamAlinan === 0 && toplamVerilen > 0;

    return { tip, toplamAlinan, toplamVerilen, kalan, yuzde, kgBasinaMaliyet, kayitsizKullanim };
  });
};

// ─── AŞI TAKVİMİ ─────────────────────────────────────────────────

export const getAsilar = () => getItem(STORAGE_KEYS.asiTakvimi);

export const saveAsilar = (liste) => setItem(STORAGE_KEYS.asiTakvimi, liste);

export const asiEkle = async (asi) => {
  const liste = await getAsilar();
  const yeni = {
    ...asi,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveAsilar(liste);
  return yeni;
};

export const hayvanAsilari = async (hayvanId) => {
  const liste = await getAsilar();
  return liste.filter((a) => a.hayvanId === hayvanId);
};

// ─── SAĞLIK KAYITLARI ─────────────────────────────────────────────

export const getSaglikKayitlar = () => getItem(STORAGE_KEYS.saglikKayitlar);

export const saveSaglikKayitlar = (liste) =>
  setItem(STORAGE_KEYS.saglikKayitlar, liste);

export const saglikKayitEkle = async (kayit) => {
  const liste = await getSaglikKayitlar();
  const yeni = {
    ...kayit,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
    cozulduMu: false,
  };
  liste.unshift(yeni);
  await saveSaglikKayitlar(liste);
  await hayvanGuncelle(kayit.hayvanId, { saglik: 'hasta' });
  return yeni;
};

export const saglikCoz = async (kayitId, hayvanId) => {
  const liste = await getSaglikKayitlar();
  const yeni = liste.map((k) =>
    k.id === kayitId ? { ...k, cozulduMu: true } : k
  );
  await saveSaglikKayitlar(yeni);
  const aktifSorunlar = yeni.filter(
    (k) => k.hayvanId === hayvanId && !k.cozulduMu
  );
  if (aktifSorunlar.length === 0) {
    await hayvanGuncelle(hayvanId, { saglik: 'saglikli' });
  }
  return yeni;
};

// ─── SATIŞLAR ─────────────────────────────────────────────────────

export const getSatislar = () => getItem(STORAGE_KEYS.satislar);

export const saveSatislar = (liste) => setItem(STORAGE_KEYS.satislar, liste);

export const satisKaydet = async (satis) => {
  const liste = await getSatislar();
  const yeni = {
    ...satis,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveSatislar(liste);
  await hayvanGuncelle(satis.hayvanId, {
    satildiMi: true,
    satisTarihi: satis.tarih,
    satisFiyati: satis.fiyat,
  });
  return yeni;
};

// ─── SÜRÜ (SÜT İNEKLERİ) ─────────────────────────────────────────

export const getSuruHayvanlar = () => getItem(STORAGE_KEYS.suruHayvanlar);

export const saveSuruHayvanlar = (liste) =>
  setItem(STORAGE_KEYS.suruHayvanlar, liste);

export const suruHayvanEkle = async (hayvan) => {
  const liste = await getSuruHayvanlar();
  const yeni = {
    ...hayvan,
    id: generateId(),
    guncelDurum: 'laktasyon',
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveSuruHayvanlar(liste);
  return yeni;
};

export const getSutKayitlari = () => getItem(STORAGE_KEYS.sutKayitlari);

export const saveSutKayitlari = (liste) =>
  setItem(STORAGE_KEYS.sutKayitlari, liste);

export const sutKayitEkle = async (kayit) => {
  const liste = await getSutKayitlari();
  const yeni = {
    ...kayit,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveSutKayitlari(liste);
  return yeni;
};

export const hayvanSutKayitlari = async (hayvanId) => {
  const liste = await getSutKayitlari();
  return liste.filter((k) => k.hayvanId === hayvanId);
};

// ─── AKTİF MODÜL ──────────────────────────────────────────────────

export const getAktifModul = async () => {
  try {
    const modul = await AsyncStorage.getItem(STORAGE_KEYS.aktifModul);
    return modul || null;
  } catch (e) {
    return null;
  }
};

export const setAktifModul = async (modul) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.aktifModul, modul);
    return true;
  } catch (e) {
    return false;
  }
};

// ─── AMBAR / ORTAK YEM STOKLARI ──────────────────────────────────
// Besi, Süt ve Kümes yemleri ortak ambarda tutulur.
// Ambar ücretsizdir; Pro sınırına bağlı değildir.

export const getAmbarYemleri = () => getItem(STORAGE_KEYS.ambarYemleri);

export const saveAmbarYemleri = (liste) =>
  setItem(STORAGE_KEYS.ambarYemleri, liste);

export const ambarYemEkle = async (yem) => {
  const liste = await getAmbarYemleri();

  const miktarKg = parseFloat(yem.miktarKg || 0);
  const toplamTutar = parseFloat(yem.toplamTutar || 0);
  const kgMaliyet = miktarKg > 0 ? toplamTutar / miktarKg : 0;

  const yeni = {
    ...yem,
    id: generateId(),
    miktarKg,
    kalanKg: miktarKg,
    toplamTutar,
    kgMaliyet,
    olusturmaTarihi: new Date().toISOString(),
    aktifMi: true,
  };

  liste.unshift(yeni);
  await saveAmbarYemleri(liste);
  return yeni;
};

export const ambarYemGuncelle = async (id, guncellemeler) => {
  const liste = await getAmbarYemleri();

  const yeni = liste.map((yem) => {
    if (yem.id !== id) return yem;

    const guncel = {
      ...yem,
      ...guncellemeler,
    };

    const miktarKg = parseFloat(guncel.miktarKg || 0);
    const toplamTutar = parseFloat(guncel.toplamTutar || 0);

    return {
      ...guncel,
      miktarKg,
      toplamTutar,
      kgMaliyet: miktarKg > 0 ? toplamTutar / miktarKg : 0,
      guncellemeTarihi: new Date().toISOString(),
    };
  });

  await saveAmbarYemleri(yeni);
  return yeni;
};

export const ambarYemSil = async (id) => {
  const liste = await getAmbarYemleri();
  const yeni = liste.filter((yem) => yem.id !== id);
  await saveAmbarYemleri(yeni);
  return yeni;
};

// ─── YEM KULLANIM KAYITLARI ──────────────────────────────────────
// modul: 'besi' | 'sut' | 'kumes'
// hedefId: hayvanId / inekId / grupId
// hedefAd: hayvan adı / inek adı / grup adı

export const getYemKullanimlari = () =>
  getItem(STORAGE_KEYS.yemKullanimlari);

export const saveYemKullanimlari = (liste) =>
  setItem(STORAGE_KEYS.yemKullanimlari, liste);

export const ambarYemKullan = async (kullanim) => {
  const yemler = await getAmbarYemleri();
  const kayitlar = await getYemKullanimlari();

  const yem = yemler.find((y) => y.id === kullanim.yemId);

  if (!yem) {
    throw new Error('Yem bulunamadı');
  }

  const miktarKg = parseFloat(kullanim.miktarKg || 0);
  const kalanKg = parseFloat(yem.kalanKg || 0);

  if (miktarKg <= 0) {
    throw new Error('Kullanılan yem miktarı geçersiz');
  }

  if (miktarKg > kalanKg) {
    throw new Error('Ambarda yeterli yem yok');
  }

  const kgMaliyet = parseFloat(yem.kgMaliyet || 0);
  const toplamMaliyet = miktarKg * kgMaliyet;

  const yeniKullanim = {
    ...kullanim,
    id: generateId(),
    yemAdi: yem.ad,
    yemKategori: yem.kategori,
    miktarKg,
    kgMaliyet,
    toplamMaliyet,
    tarih: kullanim.tarih || new Date().toISOString(),
    olusturmaTarihi: new Date().toISOString(),
  };

  const guncelYemler = yemler.map((y) => {
    if (y.id !== kullanim.yemId) return y;

    return {
      ...y,
      kalanKg: Math.max(parseFloat(y.kalanKg || 0) - miktarKg, 0),
      guncellemeTarihi: new Date().toISOString(),
    };
  });

  kayitlar.unshift(yeniKullanim);

  await saveAmbarYemleri(guncelYemler);
  await saveYemKullanimlari(kayitlar);

  return yeniKullanim;
};

export const yemKullanimSil = async (id) => {
  const kayitlar = await getYemKullanimlari();
  const silinecek = kayitlar.find((k) => k.id === id);

  if (!silinecek) return kayitlar;

  const yemler = await getAmbarYemleri();

  const guncelYemler = yemler.map((yem) => {
    if (yem.id !== silinecek.yemId) return yem;

    return {
      ...yem,
      kalanKg:
        parseFloat(yem.kalanKg || 0) + parseFloat(silinecek.miktarKg || 0),
      guncellemeTarihi: new Date().toISOString(),
    };
  });

  const yeniKayitlar = kayitlar.filter((k) => k.id !== id);

  await saveAmbarYemleri(guncelYemler);
  await saveYemKullanimlari(yeniKayitlar);

  return yeniKayitlar;
};

export const modulYemKullanimlari = async (modul, hedefId = null) => {
  const kayitlar = await getYemKullanimlari();

  return kayitlar.filter((k) => {
    if (k.modul !== modul) return false;
    if (hedefId && k.hedefId !== hedefId) return false;
    return true;
  });
};

// ─── AYARLAR ──────────────────────────────────────────────────────

export const getAyarlar = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.ayarlar);
    return json ? JSON.parse(json) : { ...VARSAYILAN_FIYATLAR };
  } catch (e) {
    return { ...VARSAYILAN_FIYATLAR };
  }
};

export const saveAyarlar = async (ayarlar) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ayarlar, JSON.stringify(ayarlar));
    return true;
  } catch (e) {
    return false;
  }
};

// ─── PRO DURUM ────────────────────────────────────────────────────

export const getProDurum = async () => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.pro);
    return val === 'true';
  } catch (e) {
    return false;
  }
};

export const setProDurum = async (durum) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.pro, durum ? 'true' : 'false');
    return true;
  } catch (e) {
    return false;
  }
};

// ─── GENEL İSTATİSTİKLER ──────────────────────────────────────────

export const getGenel = async () => {
  const hayvanlar = await getHayvanlar();
  const saglikKayitlar = await getSaglikKayitlar();
  const yemAlimlar = await getYemAlimlar();
  const aktifHayvanlar = hayvanlar.filter((h) => !h.satildiMi);
  const hastaHayvanlar = saglikKayitlar.filter((k) => !k.cozulduMu);
  const toplamYemMaliyet = yemAlimlar.reduce(
    (acc, a) => acc + parseFloat(a.fiyat || 0),
    0
  );
  return {
    toplamHayvan: aktifHayvanlar.length,
    hastaHayvanSayisi: hastaHayvanlar.length,
    toplamYemMaliyet: Math.round(toplamYemMaliyet),
    satilan: hayvanlar.filter((h) => h.satildiMi).length,
  };
};

// ─── JSON YEDEKLEME ───────────────────────────────────────────────

// Tüm verileri tek JSON nesnesi olarak döner
export const tumVerileriAl = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    const pairs = await AsyncStorage.multiGet(keys);
    const veri = {};
    pairs.forEach(([key, value]) => {
      try {
        veri[key] = value ? JSON.parse(value) : null;
      } catch {
        veri[key] = value;
      }
    });
    return {
      versiyon: '1.0.0',
      yedekTarihi: new Date().toISOString(),
      veri,
    };
  } catch (e) {
    console.error('tumVerileriAl hata:', e);
    return null;
  }
};

// JSON nesnesinden tüm verileri geri yükler
export const verileriGeriYukle = async (yedekNesnesi) => {
  try {
    if (!yedekNesnesi?.veri) {
      throw new Error('Geçersiz yedek dosyası');
    }
    const pairs = Object.entries(yedekNesnesi.veri)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => [key, JSON.stringify(value)]);

    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (e) {
    console.error('verileriGeriYukle hata:', e);
    return false;
  }
};

// Tüm Reçber verilerini siler
export const tumVerileriSil = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (e) {
    console.error('tumVerileriSil hata:', e);
    return false;
  }
};
// ───────────────────────────────────────────────────
// KÜMES FONKSİYONLARI
// ───────────────────────────────────────────────────
// Grup = "50 yumurta tavuğu, Lohmann Brown" gibi bir sürü

export const getKumesGruplar = () => getItem(STORAGE_KEYS.kumesGruplar);
export const saveKumesGruplar = (liste) => setItem(STORAGE_KEYS.kumesGruplar, liste);

export const kumesGrupEkle = async (grup) => {
  const liste = await getKumesGruplar();
  const yeni = {
    ...grup,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
    aktifMi: true,
  };
  liste.unshift(yeni);
  await saveKumesGruplar(liste);
  return yeni;
};

export const kumesGrupGuncelle = async (id, guncellemeler) => {
  const liste = await getKumesGruplar();
  const yeni = liste.map((g) => (g.id === id ? { ...g, ...guncellemeler } : g));
  await saveKumesGruplar(yeni);
  return yeni;
};

export const kumesGrupSil = async (id) => {
  const liste = await getKumesGruplar();
  const yeni = liste.filter((g) => g.id !== id);
  await saveKumesGruplar(yeni);
  return yeni;
};

// ─── YUMURTA KAYITLARI ────────────────────────────────────────────
// Her gün için: { grupId, tarih, adet, kirik, not }

export const getYumurtaKayitlari = () => getItem(STORAGE_KEYS.kumesYumurta);
export const saveYumurtaKayitlari = (liste) => setItem(STORAGE_KEYS.kumesYumurta, liste);

export const yumurtaKayitEkle = async (kayit) => {
  const liste = await getYumurtaKayitlari();
  // Aynı grup + aynı tarih varsa güncelle, yoksa ekle
  const mevcutIdx = liste.findIndex(
    (k) => k.grupId === kayit.grupId && k.tarih === kayit.tarih
  );
  if (mevcutIdx >= 0) {
    liste[mevcutIdx] = {
      ...liste[mevcutIdx],
      ...kayit,
      guncellemeTarihi: new Date().toISOString(),
    };
  } else {
    liste.unshift({
      ...kayit,
      id: generateId(),
      olusturmaTarihi: new Date().toISOString(),
    });
  }
  await saveYumurtaKayitlari(liste);
};

export const grupYumurtaKayitlari = async (grupId) => {
  const liste = await getYumurtaKayitlari();
  return liste
    .filter((k) => k.grupId === grupId)
    .sort((a, b) => b.tarih.localeCompare(a.tarih));
};

export const yumurtaKayitSil = async (id) => {
  const liste = await getYumurtaKayitlari();
  const yeni = liste.filter((k) => k.id !== id);
  await saveYumurtaKayitlari(yeni);
};

// ─── KÜMES YEM ALIMLARI ───────────────────────────────────────────

export const getKumesYemAlimlar = () => getItem(STORAGE_KEYS.kumesYemAlim);
export const saveKumesYemAlimlar = (liste) => setItem(STORAGE_KEYS.kumesYemAlim, liste);

export const kumesYemAlimEkle = async (alim) => {
  const liste = await getKumesYemAlimlar();
  const yeni = {
    ...alim,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveKumesYemAlimlar(liste);
  return yeni;
};

export const kumesYemAlimSil = async (id) => {
  const liste = await getKumesYemAlimlar();
  const yeni = liste.filter((a) => a.id !== id);
  await saveKumesYemAlimlar(yeni);
};

// ─── KÜMES SATIŞLARI ──────────────────────────────────────────────
// tip: 'yumurta' | 'tavuk'

export const getKumesSatislar = () => getItem(STORAGE_KEYS.kumesSatis);
export const saveKumesSatislar = (liste) => setItem(STORAGE_KEYS.kumesSatis, liste);

export const kumesSatisEkle = async (satis) => {
  const liste = await getKumesSatislar();
  const yeni = {
    ...satis,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveKumesSatislar(liste);

  // Tavuk satışıysa grup sayısını düşür
  if (satis.tip === 'tavuk' && satis.grupId && satis.adet) {
    const gruplar = await getKumesGruplar();
    const guncel = gruplar.map((g) => {
      if (g.id === satis.grupId) {
        const yeniSayi = Math.max((parseFloat(g.mevcutSayi) || 0) - parseFloat(satis.adet), 0);
        return { ...g, mevcutSayi: yeniSayi };
      }
      return g;
    });
    await saveKumesGruplar(guncel);
  }

  return yeni;
};

export const kumesSatisSil = async (id) => {
  const liste = await getKumesSatislar();
  const yeni = liste.filter((s) => s.id !== id);
  await saveKumesSatislar(yeni);
};

// ─── KÜMES KAYIP KAYITLARI ────────────────────────────────────────
// Ölüm / kayıp: { grupId, tarih, adet, sebep, not }

export const getKumesKayiplar = () => getItem(STORAGE_KEYS.kumesKayip);
export const saveKumesKayiplar = (liste) => setItem(STORAGE_KEYS.kumesKayip, liste);

export const kumesKayipEkle = async (kayip) => {
  const liste = await getKumesKayiplar();
  const yeni = {
    ...kayip,
    id: generateId(),
    olusturmaTarihi: new Date().toISOString(),
  };
  liste.unshift(yeni);
  await saveKumesKayiplar(liste);

  // Grup sayısını düşür
  if (kayip.grupId && kayip.adet) {
    const gruplar = await getKumesGruplar();
    const guncel = gruplar.map((g) => {
      if (g.id === kayip.grupId) {
        const yeniSayi = Math.max((parseFloat(g.mevcutSayi) || 0) - parseFloat(kayip.adet), 0);
        return { ...g, mevcutSayi: yeniSayi };
      }
      return g;
    });
    await saveKumesGruplar(guncel);
  }

  return yeni;
};

export const kumesKayipSil = async (id) => {
  const liste = await getKumesKayiplar();
  // Geri al: sayıyı tekrar artır
  const kayip = liste.find((k) => k.id === id);
  if (kayip?.grupId && kayip?.adet) {
    const gruplar = await getKumesGruplar();
    const guncel = gruplar.map((g) => {
      if (g.id === kayip.grupId) {
        return { ...g, mevcutSayi: (parseFloat(g.mevcutSayi) || 0) + parseFloat(kayip.adet) };
      }
      return g;
    });
    await saveKumesGruplar(guncel);
  }
  const yeni = liste.filter((k) => k.id !== id);
  await saveKumesKayiplar(yeni);
};

// ─── KÜMES GENEL İSTATİSTİK ───────────────────────────────────────

export const getKumesGenel = async () => {
  const gruplar = await getKumesGruplar();
  const yumurtaKayitlari = await getYumurtaKayitlari();
  const satislar = await getKumesSatislar();
  const yemAlimlar = await getKumesYemAlimlar();
  const kayiplar = await getKumesKayiplar();

  const aktifGruplar = gruplar.filter((g) => g.aktifMi);
  const toplamTavuk = aktifGruplar.reduce(
    (acc, g) => acc + parseFloat(g.mevcutSayi || 0), 0
  );

  // Bugünün yumurta toplamı
  const bugun = new Date();
  const bugunStr = `${bugun.getDate().toString().padStart(2, '0')}.${(bugun.getMonth() + 1).toString().padStart(2, '0')}.${bugun.getFullYear()}`;
  const bugunYumurta = yumurtaKayitlari
    .filter((k) => k.tarih === bugunStr)
    .reduce((acc, k) => acc + parseFloat(k.adet || 0), 0);

  // Bu ayki yumurta
  const ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
  const buAyKayitlar = yumurtaKayitlari.filter((k) => {
    const parcalar = k.tarih.split('.');
    if (parcalar.length !== 3) return false;
    const kTarih = new Date(parcalar[2], parcalar[1] - 1, parcalar[0]);
    return kTarih >= ayBaslangic;
  });
  const buAyYumurta = buAyKayitlar.reduce((acc, k) => acc + parseFloat(k.adet || 0), 0);
  const buAyKirik = buAyKayitlar.reduce((acc, k) => acc + parseFloat(k.kirik || 0), 0);

  // Toplam yumurta satış geliri
  const yumurtaSatisGeliri = satislar
    .filter((s) => s.tip === 'yumurta')
    .reduce((acc, s) => acc + parseFloat(s.tutar || 0), 0);

  // Toplam tavuk satış geliri
  const tavukSatisGeliri = satislar
    .filter((s) => s.tip === 'tavuk')
    .reduce((acc, s) => acc + parseFloat(s.tutar || 0), 0);

  // Toplam yem maliyeti
  const toplamYemMaliyet = yemAlimlar.reduce(
    (acc, a) => acc + parseFloat(a.fiyat || 0), 0
  );

  // Toplam alış maliyeti (gruplar)
  const toplamAlisMaliyet = gruplar.reduce(
    (acc, g) => acc + parseFloat(g.alisFiyati || 0), 0
  );

  const toplamGelir = yumurtaSatisGeliri + tavukSatisGeliri;
  const toplamMaliyet = toplamYemMaliyet + toplamAlisMaliyet;
  const netKarZarar = toplamGelir - toplamMaliyet;

  // Bu ay kayıp
  const buAyKayip = kayiplar
    .filter((k) => {
      const parcalar = k.tarih?.split('.');
      if (!parcalar || parcalar.length !== 3) return false;
      const kTarih = new Date(parcalar[2], parcalar[1] - 1, parcalar[0]);
      return kTarih >= ayBaslangic;
    })
    .reduce((acc, k) => acc + parseFloat(k.adet || 0), 0);

  return {
    toplamTavuk,
    aktifGrupSayisi: aktifGruplar.length,
    bugunYumurta,
    buAyYumurta,
    buAyKirik,
    yumurtaSatisGeliri,
    tavukSatisGeliri,
    toplamGelir,
    toplamYemMaliyet,
    toplamAlisMaliyet,
    toplamMaliyet,
    netKarZarar,
    buAyKayip,
  };
};
