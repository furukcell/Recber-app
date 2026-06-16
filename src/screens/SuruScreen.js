// Reçber - Sürü Ekranı (Süt İneği Modülü)
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { sutLimitAsildi, getProLimitMesaji } from '../utils/proLimits';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import {
  getSuruHayvanlar, suruHayvanEkle, hayvanGuncelle,
  getSutKayitlari, sutKayitEkle, hayvanSutKayitlari,
  getAktifModul, getAmbarStokOzeti
} from '../data/storage';
import { LAKTASYON_DONEM } from '../data/constants';

const BOŞ_HAYVAN = {
  isim: '', kupeNo: '', dogumTarihi: '', buzagiTarihi: '',
  irk: '', laktasyonNo: '1',
};
const BOŞ_SUT = {
  hayvanId: '', sabahSut: '', aksamSut: '',
  tarih: bugunTarih(), not: '',
};
const BOŞ_SAGLIK = {
  hayvanId: '', durum: 'mastitis', not: '', tarih: bugunTarih(),
};

export default function SuruScreen({ navigation }) {
  const [hayvanlar, setHayvanlar] = useState([]);
  const [sutKayitlar, setSutKayitlar] = useState([]);
  const [aktifTab, setAktifTab] = useState('surum');
  const [yenileniyor, setYenileniyor] = useState(false);
  
  const [ambarStok, setAmbarStok] = useState({
  yemler: [],
  toplamKg: 0,
  toplamDeger: 0,
});

  // Modallar
  const [hayvanModal, setHayvanModal] = useState(false);
  const [sutModal, setSutModal] = useState(false);
  const [detayModal, setDetayModal] = useState(false);
  const [seciliHayvan, setSeciliHayvan] = useState(null);
  const [hayvanSutleri, setHayvanSutleri] = useState([]);

  // Formlar
  const [hayvanForm, setHayvanForm] = useState(BOŞ_HAYVAN);
  const [sutForm, setSutForm] = useState(BOŞ_SUT);

  const SURU_RENK = COLORS.suru;

  const veriYukle = async () => {
  const h = await getSuruHayvanlar();
  setHayvanlar(h);

  const s = await getSutKayitlari();
  setSutKayitlar(s);

  const stok = await getAmbarStokOzeti('sut');
  setAmbarStok(stok);
};

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };
// ─── HAYVAN MODAL AÇ ──────────────────────────────────────────
const handleHayvanModalAc = () => {
  if (sutLimitAsildi(hayvanlar.length)) {
    Alert.alert(
      'Reçber Pro Gerekli',
      getProLimitMesaji('sut')
    );
    return;
  }

  setHayvanModal(true);
};
  
// ─── HAYVAN EKLE ──────────────────────────────────────────────
const handleHayvanEkle = async () => {
  if (sutLimitAsildi(hayvanlar.length)) {
    Alert.alert(
      'Reçber Pro Gerekli',
      getProLimitMesaji('sut')
    );
    return;
  }

  if (!hayvanForm.isim) {
    Alert.alert('Eksik Bilgi', 'İsim zorunludur.');
    return;
  }

  await suruHayvanEkle(hayvanForm);
  setHayvanModal(false);
  setHayvanForm(BOŞ_HAYVAN);
  veriYukle();
};

  // ─── SÜT KAYDET ───────────────────────────────────────────────
  const handleSutKaydet = async () => {
    if (!sutForm.hayvanId) {
      Alert.alert('Eksik Bilgi', 'Hayvan seçiniz.');
      return;
    }
    if (!sutForm.sabahSut && !sutForm.aksamSut) {
      Alert.alert('Eksik Bilgi', 'En az bir ölçüm giriniz.');
      return;
    }
    const toplamSut = (parseFloat(sutForm.sabahSut || 0) + parseFloat(sutForm.aksamSut || 0));
    await sutKayitEkle({ ...sutForm, toplamSut });
    setSutModal(false);
    setSutForm(BOŞ_SUT);
    veriYukle();
  };

  // ─── DETAY AÇ ─────────────────────────────────────────────────
  const handleDetayAc = async (hayvan) => {
    setSeciliHayvan(hayvan);
    const kayitlar = await hayvanSutKayitlari(hayvan.id);
    setHayvanSutleri(kayitlar);
    setDetayModal(true);
  };

  // ─── DÖNEM DEĞİŞTİR ───────────────────────────────────────────
  const handleDonemDegistir = (hayvan) => {
    const donemler = LAKTASYON_DONEM.map(d => ({
      text: d.label,
      onPress: async () => {
        await hayvanGuncelle(hayvan.id, { guncelDurum: d.id });
        veriYukle();
      }
    }));
    Alert.alert('Dönem Değiştir', `${hayvan.isim} için dönem seçin:`, [
      ...donemler,
      { text: 'İptal', style: 'cancel' }
    ]);
  };

  // ─── HESAPLAMALAR ─────────────────────────────────────────────
  const bugunToplamSut = () => {
    const bugun = bugunTarih();
    return sutKayitlar
      .filter(k => k.tarih === bugun)
      .reduce((acc, k) => acc + parseFloat(k.toplamSut || 0), 0);
  };

  const haftalikOrtalama = (hayvanId) => {
    const kayitlar = sutKayitlar.filter(k => k.hayvanId === hayvanId);
    if (kayitlar.length === 0) return 0;
    const son7 = kayitlar.slice(0, 7);
    const toplam = son7.reduce((acc, k) => acc + parseFloat(k.toplamSut || 0), 0);
    return (toplam / son7.length).toFixed(1);
  };

  const laktasyonGun = (buzagiTarihi) => {
    if (!buzagiTarihi) return 0;
    const parcalar = buzagiTarihi.split('.');
    if (parcalar.length !== 3) return 0;
    const tarih = new Date(`${parcalar[2]}-${parcalar[1]}-${parcalar[0]}`);
    return Math.floor((Date.now() - tarih) / 86400000);
  };

  const donemRenk = (durum) => {
    const d = LAKTASYON_DONEM.find(x => x.id === durum);
    return d?.renk || COLORS.textSecondary;
  };

  const donemLabel = (durum) => {
    const d = LAKTASYON_DONEM.find(x => x.id === durum);
    return d?.label || durum;
  };

  const tabs = [
    { key: 'surum', label: 'Sürüm', ikon: 'cow' },
    { key: 'sutKayit', label: 'Süt Kayıtları', ikon: 'cup-water' },
    { key: 'ozet', label: 'Özet', ikon: 'chart-bar' },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Sürü"
        altBaslik={`${hayvanlar.length} süt ineği`}
        modulRenk={SURU_RENK}
        sagIcon="plus-circle"
        sagOnPress={() => setHayvanModal(true)}
      />

      {/* Günlük Özet Bandı */}
      <View style={[styles.ozetBant, { backgroundColor: SURU_RENK }]}>
        <View style={styles.ozetBantItem}>
          <Text style={styles.ozetBantDeger}>{hayvanlar.length}</Text>
          <Text style={styles.ozetBantLabel}>İnek</Text>
        </View>
        <View style={styles.ozetBantAyrac} />
        <View style={styles.ozetBantItem}>
          <Text style={styles.ozetBantDeger}>{bugunToplamSut().toFixed(0)}</Text>
          <Text style={styles.ozetBantLabel}>Lt Bugün</Text>
        </View>
        <View style={styles.ozetBantAyrac} />
        <View style={styles.ozetBantItem}>
          <Text style={styles.ozetBantDeger}>
            {hayvanlar.filter(h => h.guncelDurum === 'laktasyon').length}
          </Text>
          <Text style={styles.ozetBantLabel}>Laktasyonda</Text>
        </View>
        <View style={styles.ozetBantAyrac} />
        <View style={styles.ozetBantItem}>
          <Text style={styles.ozetBantDeger}>
            {hayvanlar.filter(h => h.guncelDurum === 'kuru').length}
          </Text>
          <Text style={styles.ozetBantLabel}>Kuru</Text>
        </View>
      </View>
       {/* Ambar Stok Özeti */}
<View style={styles.ambarKart}>
  <View style={styles.ambarUst}>
    <View style={styles.ambarIkon}>
      <MaterialCommunityIcons name="barn" size={22} color={SURU_RENK} />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.ambarBaslik}>Süt Yemi Stoku</Text>
      <Text style={styles.ambarAlt}>
        Ambar'daki süt ve genel yem stokları
      </Text>
    </View>
  </View>

  <View style={styles.ambarMetrikSatir}>
    <View style={styles.ambarMetrik}>
      <Text style={styles.ambarMetrikBaslik}>Kalan Yem</Text>
      <Text style={styles.ambarMetrikDeger}>
        {Number(ambarStok.toplamKg || 0).toLocaleString('tr-TR')} kg
      </Text>
    </View>

    <View style={styles.ambarMetrik}>
      <Text style={styles.ambarMetrikBaslik}>Stok Değeri</Text>
      <Text style={styles.ambarMetrikDeger}>
        {Number(ambarStok.toplamDeger || 0).toLocaleString('tr-TR', {
          maximumFractionDigits: 2,
           })} TL
          </Text>
        </View>
       </View>
    </View>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, aktifTab === t.key && { borderBottomColor: SURU_RENK, borderBottomWidth: 2 }]}
            onPress={() => setAktifTab(t.key)}
          >
            <MaterialCommunityIcons name={t.ikon} size={15} color={aktifTab === t.key ? SURU_RENK : COLORS.textLight} />
            <Text style={[styles.tabYazi, aktifTab === t.key && { color: SURU_RENK }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={SURU_RENK} />}
      >

        {/* SÜRÜM TAB */}
        {aktifTab === 'surum' && (
          <View>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: SURU_RENK }]}
              onPress={handleHayvanModalAc}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.ekleButonYazi}>İnek Ekle</Text>
            </TouchableOpacity>

            {hayvanlar.length === 0 ? (
              <BosDurum
                ikon="cow-off"
                mesaj="Henüz sürüde inek yok"
                butonYazi="İnek Ekle"
                onPress={handleHayvanModalAc}
                renk={SURU_RENK}
              />
            ) : (
              hayvanlar.map(h => {
                const lGun = laktasyonGun(h.buzagiTarihi);
                const hafOrtalama = haftalikOrtalama(h.id);
                return (
                  <TouchableOpacity
                    key={h.id}
                    style={styles.inekKart}
                    onPress={() => handleDetayAc(h)}
                    activeOpacity={0.85}
                  >
                    {/* Üst */}
                    <View style={styles.inekUst}>
                      <View style={[styles.inekIkon, { backgroundColor: SURU_RENK }]}>
                        <MaterialCommunityIcons name="cow" size={24} color="#fff" />
                      </View>
                      <View style={styles.inekBilgi}>
                        <Text style={styles.inekIsim}>{h.isim}</Text>
                        <Text style={styles.inekAlt}>{h.irk || 'İrk belirtilmedi'} • {h.kupeNo || '-'}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.donemRozet, { backgroundColor: donemRenk(h.guncelDurum) + '20', borderColor: donemRenk(h.guncelDurum) }]}
                        onPress={() => handleDonemDegistir(h)}
                      >
                        <Text style={[styles.donemYazi, { color: donemRenk(h.guncelDurum) }]}>
                          {donemLabel(h.guncelDurum)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Metrikler */}
                    <View style={styles.inekMetrikler}>
                      <InekMetrik baslik="Laktasyon" deger={`${lGun}`} birim="gün" renk={SURU_RENK} />
                      <InekMetrik baslik="Haf. Ort." deger={hafOrtalama} birim="lt/gün" renk={SURU_RENK} />
                      <InekMetrik baslik="Laktasyon No" deger={h.laktasyonNo || '1'} birim="dönem" renk={COLORS.accent} />
                      <InekMetrik
                        baslik="Buzağılama"
                        deger={h.buzagiTarihi || '-'}
                        birim=""
                        renk={COLORS.textSecondary}
                        kucuk
                      />
                    </View>

                    {/* Süt Ekle Butonu */}
                    <TouchableOpacity
                      style={[styles.sutEkleButon, { borderColor: SURU_RENK }]}
                      onPress={() => { setSutForm({ ...BOŞ_SUT, hayvanId: h.id }); setSutModal(true); }}
                    >
                      <MaterialCommunityIcons name="cup-water" size={16} color={SURU_RENK} />
                      <Text style={[styles.sutEkleYazi, { color: SURU_RENK }]}>Süt Kaydı Ekle</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* SÜT KAYITLARI TAB */}
        {aktifTab === 'sutKayit' && (
          <View>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: SURU_RENK }]}
              onPress={() => setSutModal(true)}
            >
              <MaterialCommunityIcons name="cup-water" size={18} color="#fff" />
              <Text style={styles.ekleButonYazi}>Süt Kaydı Ekle</Text>
            </TouchableOpacity>

            {sutKayitlar.length === 0 ? (
              <BosDurum
                ikon="cup-off"
                mesaj="Henüz süt kaydı yok"
                butonYazi="Kayıt Ekle"
                onPress={() => setSutModal(true)}
                renk={SURU_RENK}
              />
            ) : (
              sutKayitlar.map(k => {
                const h = hayvanlar.find(x => x.id === k.hayvanId);
                return (
                  <View key={k.id} style={styles.sutKart}>
                    <View style={[styles.sutIkon, { backgroundColor: SURU_RENK + '20' }]}>
                      <MaterialCommunityIcons name="cup-water" size={20} color={SURU_RENK} />
                    </View>
                    <View style={styles.sutBilgi}>
                      <Text style={styles.sutHayvan}>{h?.isim || 'Bilinmiyor'}</Text>
                      <Text style={styles.sutAlt}>
                        {k.tarih} • Sabah: {k.sabahSut || 0} lt • Akşam: {k.aksamSut || 0} lt
                      </Text>
                      {k.not ? <Text style={styles.sutNot}>{k.not}</Text> : null}
                    </View>
                    <Text style={[styles.sutToplam, { color: SURU_RENK }]}>
                      {parseFloat(k.toplamSut || 0).toFixed(1)} lt
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ÖZET TAB */}
        {aktifTab === 'ozet' && (
          <View>
            {/* Hayvan bazlı özet */}
            {hayvanlar.length === 0 ? (
              <BosDurum ikon="chart-off" mesaj="Özet için önce inek ekleyin" renk={SURU_RENK} />
            ) : (
              hayvanlar.map(h => {
                const hKayitlar = sutKayitlar.filter(k => k.hayvanId === h.id);
                const toplamSut = hKayitlar.reduce((acc, k) => acc + parseFloat(k.toplamSut || 0), 0);
                const ortSut = hKayitlar.length > 0 ? (toplamSut / hKayitlar.length).toFixed(1) : '0';
                const enYuksek = hKayitlar.length > 0
                  ? Math.max(...hKayitlar.map(k => parseFloat(k.toplamSut || 0))).toFixed(1)
                  : '0';
                const lGun = laktasyonGun(h.buzagiTarihi);

                return (
                  <View key={h.id} style={styles.ozetKart}>
                    <View style={styles.ozetKartUst}>
                      <View style={[styles.inekIkon, { backgroundColor: SURU_RENK }]}>
                        <MaterialCommunityIcons name="cow" size={20} color="#fff" />
                      </View>
                      <Text style={styles.ozetKartIsim}>{h.isim}</Text>
                      <Text style={styles.ozetKartLaktasyon}>{lGun} gün</Text>
                    </View>

                    <View style={styles.ozetMetrikler}>
                      <OzetMetrik baslik="Toplam Süt" deger={`${toplamSut.toFixed(0)} lt`} renk={SURU_RENK} />
                      <OzetMetrik baslik="Günlük Ort." deger={`${ortSut} lt`} renk={SURU_RENK} />
                      <OzetMetrik baslik="En Yüksek" deger={`${enYuksek} lt`} renk={COLORS.accent} />
                      <OzetMetrik baslik="Kayıt Sayısı" deger={`${hKayitlar.length} gün`} renk={COLORS.textSecondary} />
                    </View>

                    {/* Mini grafik (son 7 kayıt) */}
                    {hKayitlar.length > 0 && (
                      <View style={styles.miniGrafik}>
                        <Text style={styles.miniGrafikBaslik}>Son {Math.min(hKayitlar.length, 7)} Kayıt</Text>
                        <View style={styles.miniBarlar}>
                          {hKayitlar.slice(0, 7).reverse().map((k, i) => {
                            const max = Math.max(...hKayitlar.map(x => parseFloat(x.toplamSut || 0)));
                            const yuzde = max > 0 ? (parseFloat(k.toplamSut || 0) / max) * 100 : 0;
                            return (
                              <View key={i} style={styles.miniBarKap}>
                                <View style={[styles.miniBar, {
                                  height: `${Math.max(yuzde, 5)}%`,
                                  backgroundColor: SURU_RENK,
                                }]} />
                                <Text style={styles.miniBarLabel}>{parseFloat(k.toplamSut || 0).toFixed(0)}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* İNEK EKLE MODAL */}
      <Modal visible={hayvanModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Yeni İnek Ekle</Text>
            <TouchableOpacity onPress={() => { setHayvanModal(false); setHayvanForm(BOŞ_HAYVAN); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <FormInput label="İsim *" placeholder="Örn: Sarıkız" value={hayvanForm.isim} onChange={v => setHayvanForm({ ...hayvanForm, isim: v })} />
            <FormInput label="Küpe No" placeholder="Örn: TR48-101" value={hayvanForm.kupeNo} onChange={v => setHayvanForm({ ...hayvanForm, kupeNo: v })} />
            <FormInput label="Irk" placeholder="Örn: Holstein, Simental" value={hayvanForm.irk} onChange={v => setHayvanForm({ ...hayvanForm, irk: v })} />
            <FormInput label="Son Buzağılama Tarihi" placeholder="Örn: 01.01.2026" value={hayvanForm.buzagiTarihi} onChange={v => setHayvanForm({ ...hayvanForm, buzagiTarihi: v })} />
            <FormInput label="Doğum Tarihi" placeholder="Örn: 15.03.2022" value={hayvanForm.dogumTarihi} onChange={v => setHayvanForm({ ...hayvanForm, dogumTarihi: v })} />
            <FormInput label="Laktasyon No" placeholder="Örn: 3" value={hayvanForm.laktasyonNo} onChange={v => setHayvanForm({ ...hayvanForm, laktasyonNo: v })} klavye="numeric" />

            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: SURU_RENK }]}
              onPress={handleHayvanEkle}
            >
              <Text style={styles.kaydetYazi}>İNEK EKLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* SÜT KAYIT MODAL */}
      <Modal visible={sutModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Süt Kaydı Ekle</Text>
            <TouchableOpacity onPress={() => { setSutModal(false); setSutForm(BOŞ_SUT); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>

            {/* Hayvan Seçimi */}
            <Text style={styles.formLabel}>İnek Seçin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {hayvanlar.filter(h => h.guncelDurum === 'laktasyon').map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.secimButon, sutForm.hayvanId === h.id && { backgroundColor: SURU_RENK, borderColor: SURU_RENK }]}
                  onPress={() => setSutForm({ ...sutForm, hayvanId: h.id })}
                >
                  <Text style={[styles.secimYazi, sutForm.hayvanId === h.id && { color: '#fff' }]}>{h.isim}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FormInput label="Tarih" placeholder="01.06.2026" value={sutForm.tarih} onChange={v => setSutForm({ ...sutForm, tarih: v })} />

            {/* Sabah / Akşam */}
            <View style={styles.sutInputSatir}>
              <View style={styles.sutInputYari}>
                <Text style={styles.formLabel}>🌅 Sabah (lt)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={sutForm.sabahSut}
                  onChangeText={v => setSutForm({ ...sutForm, sabahSut: v })}
                />
              </View>
              <View style={styles.sutInputYari}>
                <Text style={styles.formLabel}>🌙 Akşam (lt)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={sutForm.aksamSut}
                  onChangeText={v => setSutForm({ ...sutForm, aksamSut: v })}
                />
              </View>
            </View>

            {/* Toplam Önizleme */}
            {(sutForm.sabahSut || sutForm.aksamSut) && (
              <View style={[styles.onizleme, { backgroundColor: SURU_RENK + '15' }]}>
                <Text style={[styles.onizlemeYazi, { color: SURU_RENK }]}>
                  Toplam: {(parseFloat(sutForm.sabahSut || 0) + parseFloat(sutForm.aksamSut || 0)).toFixed(1)} lt
                </Text>
              </View>
            )}

            <FormInput label="Not (Opsiyonel)" placeholder="Örn: Sol meme şişlik var" value={sutForm.not} onChange={v => setSutForm({ ...sutForm, not: v })} />

            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: SURU_RENK }]}
              onPress={handleSutKaydet}
            >
              <Text style={styles.kaydetYazi}>KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* DETAY MODAL */}
      <Modal visible={detayModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>{seciliHayvan?.isim} — Detay</Text>
            <TouchableOpacity onPress={() => setDetayModal(false)}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            {hayvanSutleri.length === 0 ? (
              <View style={styles.bosDurum}>
                <MaterialCommunityIcons name="cup-off" size={40} color={COLORS.textLight} />
                <Text style={styles.bosYazi}>Henüz süt kaydı yok</Text>
              </View>
            ) : (
              hayvanSutleri.map((k, i) => (
                <View key={k.id} style={styles.detaySatir}>
                  <Text style={styles.detayTarih}>{k.tarih}</Text>
                  <View style={styles.detayOlcumler}>
                    <Text style={styles.detayOlcum}>🌅 {k.sabahSut || 0} lt</Text>
                    <Text style={styles.detayOlcum}>🌙 {k.aksamSut || 0} lt</Text>
                  </View>
                  <Text style={[styles.detayToplam, { color: SURU_RENK }]}>
                    {parseFloat(k.toplamSut || 0).toFixed(1)} lt
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function InekMetrik({ baslik, deger, birim, renk, kucuk }) {
  return (
    <View style={styles.inekMetrik}>
      <Text style={styles.inekMetrikBaslik}>{baslik}</Text>
      <Text style={[styles.inekMetrikDeger, { color: renk, fontSize: kucuk ? 12 : 16 }]}>{deger}</Text>
      {birim ? <Text style={styles.inekMetrikBirim}>{birim}</Text> : null}
    </View>
  );
}

function OzetMetrik({ baslik, deger, renk }) {
  return (
    <View style={styles.ozetMetrik}>
      <Text style={styles.ozetMetrikBaslik}>{baslik}</Text>
      <Text style={[styles.ozetMetrikDeger, { color: renk }]}>{deger}</Text>
    </View>
  );
}

function BosDurum({ ikon, mesaj, butonYazi, onPress, renk }) {
  return (
    <View style={styles.bosDurum}>
      <MaterialCommunityIcons name={ikon} size={48} color={COLORS.textLight} />
      <Text style={styles.bosYazi}>{mesaj}</Text>
      {butonYazi && (
        <TouchableOpacity style={[styles.bosButon, { backgroundColor: renk }]} onPress={onPress}>
          <Text style={styles.bosButonYazi}>{butonYazi}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function FormInput({ label, placeholder, value, onChange, klavye }) {
  return (
    <View style={styles.formGrup}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={styles.formInput}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChange}
        keyboardType={klavye || 'default'}
      />
    </View>
  );
}

function bugunTarih() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollIcerik: { padding: 12, paddingBottom: 40 },

  ozetBant: {
    flexDirection: 'row', paddingVertical: 12,
  },
  ozetBantItem: { flex: 1, alignItems: 'center' },
  ozetBantDeger: { fontSize: 20, fontWeight: '900', color: '#fff' },
  ozetBantLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  ozetBantAyrac: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },

  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, gap: 4,
  },
  tabYazi: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },

  ekleButon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 12, gap: 6, marginBottom: 14,
  },
  ekleButonYazi: { fontSize: 14, fontWeight: '700', color: '#fff' },

  inekKart: {
    backgroundColor: COLORS.surface, borderRadius: 18,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  inekUst: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  inekIkon: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  inekBilgi: { flex: 1 },
  inekIsim: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  inekAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  donemRozet: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  donemYazi: { fontSize: 11, fontWeight: '700' },
  inekMetrikler: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    paddingTop: 12, marginBottom: 12,
  },
  inekMetrik: { alignItems: 'center', flex: 1 },
  inekMetrikBaslik: { fontSize: 10, color: COLORS.textLight, marginBottom: 3 },
  inekMetrikDeger: { fontSize: 16, fontWeight: '900' },
  inekMetrikBirim: { fontSize: 10, color: COLORS.textLight, marginTop: 1 },
  sutEkleButon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, paddingVertical: 8, gap: 6,
    borderWidth: 1.5,
  },
  sutEkleYazi: { fontSize: 13, fontWeight: '700' },

  sutKart: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  sutIkon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sutBilgi: { flex: 1 },
  sutHayvan: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  sutAlt: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  sutNot: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  sutToplam: { fontSize: 18, fontWeight: '900' },

  ozetKart: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  ozetKartUst: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  ozetKartIsim: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  ozetKartLaktasyon: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  ozetMetrikler: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    paddingTop: 12, marginBottom: 14,
  },
  ozetMetrik: { alignItems: 'center', flex: 1 },
  ozetMetrikBaslik: { fontSize: 10, color: COLORS.textLight, marginBottom: 4 },
  ozetMetrikDeger: { fontSize: 15, fontWeight: '900' },

  miniGrafik: { marginTop: 4 },
  miniGrafikBaslik: { fontSize: 11, color: COLORS.textLight, marginBottom: 8 },
  miniBarlar: { flexDirection: 'row', alignItems: 'flex-end', height: 50, gap: 4 },
  miniBarKap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  miniBar: { width: '100%', borderRadius: 3, minHeight: 3 },
  miniBarLabel: { fontSize: 9, color: COLORS.textLight, marginTop: 3 },

  detaySatir: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 0.5,
    borderBottomColor: COLORS.divider, gap: 10,
  },
  detayTarih: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, width: 85 },
  detayOlcumler: { flex: 1, flexDirection: 'row', gap: 12 },
  detayOlcum: { fontSize: 12, color: COLORS.textSecondary },
  detayToplam: { fontSize: 16, fontWeight: '900' },

  bosDurum: { alignItems: 'center', paddingTop: 60, gap: 12 },
  bosYazi: { fontSize: 14, color: COLORS.textLight },
  bosButon: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, marginTop: 4 },
  bosButonYazi: { fontSize: 13, fontWeight: '700', color: '#fff' },

  modalContainer: { flex: 1, backgroundColor: COLORS.surface },
  modalUst: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalBaslik: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },

  sutInputSatir: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  sutInputYari: { flex: 1 },

  onizleme: { borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 14 },
  onizlemeYazi: { fontSize: 16, fontWeight: '800' },

  secimButon: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginRight: 8,
    backgroundColor: COLORS.background,
  },
  secimYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  formGrup: { marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  formInput: {
    backgroundColor: COLORS.background, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },

  kaydetButon: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 30 },
 kaydetYazi: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

ambarKart: {
  backgroundColor: '#fff',
  borderRadius: 18,
  padding: 14,
  marginTop: 12,
  marginBottom: 12,
  elevation: 2,
},
ambarUst: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},
ambarIkon: {
  width: 42,
  height: 42,
  borderRadius: 14,
  backgroundColor: '#EAF3F8',
  alignItems: 'center',
  justifyContent: 'center',
},
ambarBaslik: {
  fontSize: 16,
  fontWeight: '800',
  color: COLORS.textPrimary,
},
ambarAlt: {
  marginTop: 3,
  fontSize: 12,
  color: COLORS.textSecondary,
},
ambarMetrikSatir: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 14,
},
ambarMetrik: {
  flex: 1,
  backgroundColor: COLORS.background,
  borderRadius: 12,
  padding: 10,
},
ambarMetrikBaslik: {
  fontSize: 12,
  color: COLORS.textSecondary,
},
ambarMetrikDeger: {
  marginTop: 4,
  fontSize: 15,
  fontWeight: '900',
  color: COLORS.textPrimary,
},
});
