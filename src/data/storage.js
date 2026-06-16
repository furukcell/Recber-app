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
