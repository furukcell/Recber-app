// Reçber - Kümes Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import {
  getKumesGruplar, kumesGrupEkle, kumesGrupGuncelle, kumesGrupSil,
  getYumurtaKayitlari, yumurtaKayitEkle, yumurtaKayitSil, grupYumurtaKayitlari,
  getKumesYemAlimlar, kumesYemAlimEkle, kumesYemAlimSil,
  getKumesSatislar, kumesSatisEkle, kumesSatisSil,
  getKumesKayiplar, kumesKayipEkle, kumesKayipSil,
  getKumesGenel, getProDurum,
} from '../data/storage';
import { KUMES_TIPLERI, KUMES_IRK_LISTESI, KUMES_YEM_TIPLERI, APP } from '../data/constants';

const KUMES_RENK = '#A0522D';

function bugunTarih() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

const BOŞ_GRUP = {
  isim: '', tip: 'yumurta', irk: 'lohmann',
  baslangicSayi: '', mevcutSayi: '', alisFiyati: '',
  alisTarihi: '', not: '',
};

const BOŞ_YUMURTA = { adet: '', kirik: '0', tarih: bugunTarih(), not: '' };
const BOŞ_YEM = { tip: 'yemlik', miktar: '', fiyat: '', tarih: bugunTarih(), not: '' };
const BOŞ_SATIS = { tip: 'yumurta', adet: '', birimFiyat: '', tutar: '', tarih: bugunTarih(), alici: '', not: '' };
const BOŞ_KAYIP = { adet: '', sebep: '', tarih: bugunTarih(), not: '' };

export default function KumesScreen() {
  const [gruplar, setGruplar] = useState([]);
  const [genel, setGenel] = useState(null);
  const [yemAlimlar, setYemAlimlar] = useState([]);
  const [satislar, setSatislar] = useState([]);
  const [kayiplar, setKayiplar] = useState([]);
  const [isPro, setIsPro] = useState(false);

  const [aktifTab, setAktifTab] = useState('ozet');
  const [yenileniyor, setYenileniyor] = useState(false);

  // Seçili grup (yumurta kayıt için)
  const [seciliGrup, setSeciliGrup] = useState(null);
  const [grupYumurtalar, setGrupYumurtalar] = useState([]);

  // Modaller
  const [grupEkleModal, setGrupEkleModal] = useState(false);
  const [grupDuzenleModal, setGrupDuzenleModal] = useState(false);
  const [yumurtaModal, setYumurtaModal] = useState(false);
  const [yemModal, setYemModal] = useState(false);
  const [satisModal, setSatisModal] = useState(false);
  const [kayipModal, setKayipModal] = useState(false);

  // Formlar
  const [grupForm, setGrupForm] = useState(BOŞ_GRUP);
  const [duzenleId, setDuzenleId] = useState(null);
  const [yumurtaForm, setYumurtaForm] = useState(BOŞ_YUMURTA);
  const [yemForm, setYemForm] = useState(BOŞ_YEM);
  const [satisForm, setSatisForm] = useState(BOŞ_SATIS);
  const [kayipForm, setKayipForm] = useState({ ...BOŞ_KAYIP, grupId: null });

  const veriYukle = async () => {
    const pro = await getProDurum();
    setIsPro(pro);
    const g = await getKumesGruplar();
    setGruplar(g);
    const gen = await getKumesGenel();
    setGenel(gen);
    const y = await getKumesYemAlimlar();
    setYemAlimlar(y);
    const s = await getKumesSatislar();
    setSatislar(s);
    const k = await getKumesKayiplar();
    setKayiplar(k);
  };

  const grupSecVeYumurtaYukle = async (grup) => {
    setSeciliGrup(grup);
    const kayitlar = await grupYumurtaKayitlari(grup.id);
    setGrupYumurtalar(kayitlar);
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const aktifGruplar = gruplar.filter(g => g.aktifMi);

  // ─── GRUP EKLE ────────────────────────────────────────────────
  const handleGrupEkle = async () => {
    if (!grupForm.isim || !grupForm.baslangicSayi) {
      Alert.alert('Eksik', 'Grup adı ve başlangıç sayısı zorunludur.');
      return;
    }
    const yeni = {
      ...grupForm,
      mevcutSayi: grupForm.baslangicSayi,
    };
    await kumesGrupEkle(yeni);
    setGrupEkleModal(false);
    setGrupForm(BOŞ_GRUP);
    veriYukle();
  };

  // ─── GRUP DÜZENLE ─────────────────────────────────────────────
  const handleGrupDuzenleBasin = (grup) => {
    setDuzenleId(grup.id);
    setGrupForm({
      isim: grup.isim || '',
      tip: grup.tip || 'yumurta',
      irk: grup.irk || 'lohmann',
      baslangicSayi: grup.baslangicSayi || '',
      mevcutSayi: grup.mevcutSayi || '',
      alisFiyati: grup.alisFiyati || '',
      alisTarihi: grup.alisTarihi || '',
      not: grup.not || '',
    });
    setGrupDuzenleModal(true);
  };

  const handleGrupDuzenleKaydet = async () => {
    if (!grupForm.isim || !grupForm.mevcutSayi) {
      Alert.alert('Eksik', 'Grup adı ve mevcut sayı zorunludur.');
      return;
    }
    await kumesGrupGuncelle(duzenleId, grupForm);
    setGrupDuzenleModal(false);
    setDuzenleId(null);
    setGrupForm(BOŞ_GRUP);
    veriYukle();
    Alert.alert('Kaydedildi ✅', 'Grup bilgileri güncellendi.');
  };

  const handleGrupSil = (grup) => {
    Alert.alert(
      'Grubu Sil',
      `"${grup.isim}" grubu ve tüm kayıtları silinecek. Emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil', style: 'destructive',
          onPress: async () => {
            await kumesGrupSil(grup.id);
            if (seciliGrup?.id === grup.id) setSeciliGrup(null);
            veriYukle();
          },
        },
      ]
    );
  };

  // ─── YUMURTA KAYDET ───────────────────────────────────────────
  const handleYumurtaKaydet = async () => {
    if (!yumurtaForm.adet || !seciliGrup) {
      Alert.alert('Eksik', 'Adet giriniz.');
      return;
    }
    await yumurtaKayitEkle({
      ...yumurtaForm,
      grupId: seciliGrup.id,
    });
    setYumurtaModal(false);
    setYumurtaForm(BOŞ_YUMURTA);
    await grupSecVeYumurtaYukle(seciliGrup);
    veriYukle();
    Alert.alert('Kaydedildi ✅', `${yumurtaForm.adet} adet yumurta kaydedildi.`);
  };

  // ─── YEM ALIIM ────────────────────────────────────────────────
  const handleYemEkle = async () => {
    if (!yemForm.miktar || !yemForm.fiyat) {
      Alert.alert('Eksik', 'Miktar ve fiyat zorunludur.');
      return;
    }
    await kumesYemAlimEkle(yemForm);
    setYemModal(false);
    setYemForm(BOŞ_YEM);
    veriYukle();
  };

  // ─── SATIŞ ────────────────────────────────────────────────────
  const handleSatisEkle = async () => {
    if (!satisForm.tutar) {
      Alert.alert('Eksik', 'Tutar zorunludur.');
      return;
    }
    const grupId = satisForm.tip === 'tavuk' ? seciliGrup?.id : null;
    await kumesSatisEkle({ ...satisForm, grupId });
    setSatisModal(false);
    setSatisForm(BOŞ_SATIS);
    veriYukle();
    Alert.alert('Kaydedildi ✅', 'Satış kaydedildi.');
  };

  // ─── KAYIP ────────────────────────────────────────────────────
  const handleKayipEkle = async () => {
    if (!kayipForm.adet || !kayipForm.grupId) {
      Alert.alert('Eksik', 'Grup seçin ve adet girin.');
      return;
    }
    await kumesKayipEkle(kayipForm);
    setKayipModal(false);
    setKayipForm({ ...BOŞ_KAYIP, grupId: null });
    veriYukle();
    Alert.alert('Kaydedildi', `${kayipForm.adet} kayıp/ölüm kaydedildi.`);
  };

  // ─── RENDER ───────────────────────────────────────────────────
  const tabs = [
    { key: 'ozet',    label: 'Özet',    ikon: 'view-dashboard-outline' },
    { key: 'gruplar', label: 'Gruplar', ikon: 'bird' },
    { key: 'yumurta', label: 'Yumurta', ikon: 'egg' },
    { key: 'yem',     label: 'Yem',     ikon: 'barley' },
    { key: 'finans',  label: 'Finans',  ikon: 'cash' },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Kümes"
        altBaslik={`${genel?.toplamTavuk || 0} tavuk • ${genel?.aktifGrupSayisi || 0} grup`}
        modulRenk={KUMES_RENK}
        sagIcon="plus-circle"
        sagOnPress={() => setGrupEkleModal(true)}
      />

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarScroll}>
        <View style={styles.tabBar}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, aktifTab === t.key && { borderBottomColor: KUMES_RENK, borderBottomWidth: 2 }]}
              onPress={() => setAktifTab(t.key)}
            >
              <MaterialCommunityIcons name={t.ikon} size={16} color={aktifTab === t.key ? KUMES_RENK : COLORS.textLight} />
              <Text style={[styles.tabYazi, aktifTab === t.key && { color: KUMES_RENK }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={KUMES_RENK} />}
      >

        {/* ─── ÖZET TAB ─── */}
        {aktifTab === 'ozet' && genel && (
          <View>
            {/* Ana metrikler */}
            <View style={styles.metrikGrid}>
              <MetrikKart baslik="Toplam Tavuk" deger={genel.toplamTavuk} birim="adet" renk={KUMES_RENK} ikon="bird" />
              <MetrikKart baslik="Bugün Yumurta" deger={genel.bugunYumurta} birim="adet" renk="#E67E22" ikon="egg" />
              <MetrikKart baslik="Bu Ay Yumurta" deger={genel.buAyYumurta} birim="adet" renk="#F39C12" ikon="egg-multiple" />
              <MetrikKart baslik="Bu Ay Kırık" deger={genel.buAyKirik} birim="adet" renk={genel.buAyKirik > 0 ? COLORS.danger : COLORS.success} ikon="egg-off" />
              <MetrikKart baslik="Bu Ay Kayıp" deger={genel.buAyKayip} birim="tavuk" renk={genel.buAyKayip > 0 ? COLORS.danger : COLORS.success} ikon="alert-circle-outline" />
              <MetrikKart baslik="Net Kar/Zarar" deger={`${Math.round(genel.netKarZarar / 1000)}K`} birim="TL" renk={genel.netKarZarar >= 0 ? COLORS.success : COLORS.danger} ikon="cash" />
            </View>

            {/* Finansal özet */}
            <View style={styles.finansKart}>
              <Text style={styles.bolumBaslik}>Finansal Özet</Text>
              <FinansSatir label="Yumurta Satışı" deger={genel.yumurtaSatisGeliri} renk={COLORS.success} />
              <FinansSatir label="Tavuk Satışı" deger={genel.tavukSatisGeliri} renk={COLORS.success} />
              <View style={styles.ayrac} />
              <FinansSatir label="Yem Maliyeti" deger={-genel.toplamYemMaliyet} renk={COLORS.danger} />
              <FinansSatir label="Alış Maliyeti" deger={-genel.toplamAlisMaliyet} renk={COLORS.danger} />
              <View style={styles.ayrac} />
              <View style={styles.netSatir}>
                <Text style={styles.netLabel}>NET KAR / ZARAR</Text>
                <Text style={[styles.netDeger, { color: genel.netKarZarar >= 0 ? COLORS.success : COLORS.danger }]}>
                  {genel.netKarZarar >= 0 ? '+' : ''}{Math.round(genel.netKarZarar).toLocaleString('tr-TR')} TL
                </Text>
              </View>
            </View>

            {/* Hızlı işlemler */}
            <Text style={[styles.bolumBaslik, { marginHorizontal: 4, marginBottom: 10 }]}>Hızlı İşlem</Text>
            <View style={styles.hizliGrid}>
              <HizliButon ikon="egg-plus" label="Yumurta Gir" renk="#E67E22"
                onPress={() => {
                  if (aktifGruplar.length === 0) { Alert.alert('Önce grup ekle', 'Yumurta kaydı için en az bir grup gerekli.'); return; }
                  if (!seciliGrup) setSeciliGrup(aktifGruplar[0]);
                  setYumurtaModal(true);
                }}
              />
              <HizliButon ikon="cash-plus" label="Satış Ekle" renk={COLORS.success} onPress={() => setSatisModal(true)} />
              <HizliButon ikon="barley" label="Yem Alımı" renk={KUMES_RENK} onPress={() => setYemModal(true)} />
              <HizliButon ikon="alert-circle" label="Kayıp Kaydet" renk={COLORS.danger} onPress={() => {
                if (aktifGruplar.length === 0) { Alert.alert('Önce grup ekle'); return; }
                setKayipForm({ ...BOŞ_KAYIP, grupId: aktifGruplar[0].id });
                setKayipModal(true);
              }} />
            </View>
          </View>
        )}

        {/* ─── GRUPLAR TAB ─── */}
        {aktifTab === 'gruplar' && (
          <View>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: KUMES_RENK }]}
              onPress={() => setGrupEkleModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.ekleButonYazi}>Yeni Grup Ekle</Text>
            </TouchableOpacity>

            {gruplar.length === 0 ? (
              <BosDurum ikon="bird-off" mesaj="Henüz grup eklenmemiş" />
            ) : (
              gruplar.map(g => {
                const tipBilgi = KUMES_TIPLERI.find(t => t.id === g.tip);
                const irkBilgi = KUMES_IRK_LISTESI.find(i => i.id === g.irk);
                const kayipSayisi = kayiplar.filter(k => k.grupId === g.id).reduce((acc, k) => acc + parseFloat(k.adet || 0), 0);
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.grupKart, !g.aktifMi && { opacity: 0.5 }]}
                    onLongPress={() => {
                      Alert.alert(g.isim, 'Ne yapmak istiyorsunuz?', [
                        { text: 'İptal', style: 'cancel' },
                        { text: '✏️ Düzenle', onPress: () => handleGrupDuzenleBasin(g) },
                        { text: g.aktifMi ? '📦 Arşivle' : '✅ Aktif Et', onPress: async () => { await kumesGrupGuncelle(g.id, { aktifMi: !g.aktifMi }); veriYukle(); } },
                        { text: '🗑️ Sil', style: 'destructive', onPress: () => handleGrupSil(g) },
                      ]);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.grupUst}>
                      <View style={[styles.grupIkon, { backgroundColor: (tipBilgi?.renk || KUMES_RENK) + '20' }]}>
                        <MaterialCommunityIcons name={tipBilgi?.icon || 'bird'} size={26} color={tipBilgi?.renk || KUMES_RENK} />
                      </View>
                      <View style={styles.grupBilgi}>
                        <Text style={styles.grupIsim}>{g.isim}</Text>
                        <Text style={styles.grupAlt}>{tipBilgi?.label || g.tip} • {irkBilgi?.label || g.irk}</Text>
                      </View>
                      <View style={styles.grupSag}>
                        <Text style={[styles.grupSayi, { color: KUMES_RENK }]}>{g.mevcutSayi}</Text>
                        <Text style={styles.grupSayiAlt}>mevcut</Text>
                      </View>
                    </View>
                    <View style={styles.grupAltSatir}>
                      <MiniMetrik label="Başlangıç" deger={`${g.baslangicSayi} adet`} />
                      <MiniMetrik label="Mevcut" deger={`${g.mevcutSayi} adet`} />
                      <MiniMetrik label="Kayıp" deger={`${kayipSayisi} adet`} renk={kayipSayisi > 0 ? COLORS.danger : COLORS.textLight} />
                      <MiniMetrik label="Alış" deger={g.alisFiyati ? `${parseFloat(g.alisFiyati).toLocaleString('tr-TR')} TL` : '-'} />
                    </View>
                    {!g.aktifMi && (
                      <View style={styles.arsivRozet}>
                        <Text style={styles.arsivYazi}>ARŞİV</Text>
                      </View>
                    )}
                    <Text style={styles.uzunBasHint}>Düzenle/Sil için uzun bas</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ─── YUMURTA TAB ─── */}
        {aktifTab === 'yumurta' && (
          <View>
            {/* Grup Seç */}
            {aktifGruplar.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                  {aktifGruplar.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.grupSecButon, seciliGrup?.id === g.id && { backgroundColor: KUMES_RENK, borderColor: KUMES_RENK }]}
                      onPress={() => grupSecVeYumurtaYukle(g)}
                    >
                      <Text style={[styles.grupSecYazi, seciliGrup?.id === g.id && { color: '#fff' }]}>{g.isim}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {seciliGrup ? (
              <>
                <TouchableOpacity
                  style={[styles.ekleButon, { backgroundColor: '#E67E22' }]}
                  onPress={() => setYumurtaModal(true)}
                >
                  <MaterialCommunityIcons name="egg-plus" size={18} color="#fff" />
                  <Text style={styles.ekleButonYazi}>Yumurta Kaydı Ekle</Text>
                </TouchableOpacity>

                {grupYumurtalar.length === 0 ? (
                  <BosDurum ikon="egg-off" mesaj="Bu grup için yumurta kaydı yok" />
                ) : (
                  grupYumurtalar.map(k => (
                    <View key={k.id} style={styles.yumurtaSatir}>
                      <View style={[styles.yumurtaIkon, { backgroundColor: '#E67E22' + '20' }]}>
                        <MaterialCommunityIcons name="egg" size={22} color="#E67E22" />
                      </View>
                      <View style={styles.yumurtaBilgi}>
                        <Text style={styles.yumurtaTarih}>{k.tarih}</Text>
                        {k.not ? <Text style={styles.yumurtaNot}>{k.not}</Text> : null}
                      </View>
                      <View style={styles.yumurtaSag}>
                        <Text style={[styles.yumurtaAdet, { color: '#E67E22' }]}>{k.adet} adet</Text>
                        {parseFloat(k.kirik) > 0 && (
                          <Text style={styles.yumurtaKirik}>{k.kirik} kırık</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => Alert.alert('Sil', 'Bu kaydı silmek istiyor musunuz?', [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Sil', style: 'destructive', onPress: async () => { await yumurtaKayitSil(k.id); grupSecVeYumurtaYukle(seciliGrup); veriYukle(); } },
                        ])}
                        style={{ padding: 6 }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </>
            ) : (
              <BosDurum
                ikon={aktifGruplar.length === 0 ? 'bird-off' : 'cursor-pointer'}
                mesaj={aktifGruplar.length === 0 ? 'Önce bir grup ekleyin' : 'Yukarıdan grup seçin'}
              />
            )}
          </View>
        )}

        {/* ─── YEM TAB ─── */}
        {aktifTab === 'yem' && (
          <View>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: KUMES_RENK }]}
              onPress={() => setYemModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.ekleButonYazi}>Yem Alımı Ekle</Text>
            </TouchableOpacity>

            {/* Toplam yem harcaması */}
            {yemAlimlar.length > 0 && (
              <View style={[styles.finansKart, { marginBottom: 12 }]}>
                <Text style={styles.bolumBaslik}>Yem Özeti</Text>
                {KUMES_YEM_TIPLERI.map(tip => {
                  const tipAlimlar = yemAlimlar.filter(a => a.tip === tip.id);
                  if (tipAlimlar.length === 0) return null;
                  const toplamKg = tipAlimlar.reduce((acc, a) => acc + parseFloat(a.miktar || 0), 0);
                  const toplamTL = tipAlimlar.reduce((acc, a) => acc + parseFloat(a.fiyat || 0), 0);
                  return (
                    <View key={tip.id} style={styles.yemOzetSatir}>
                      <MaterialCommunityIcons name={tip.icon} size={16} color={tip.renk} />
                      <Text style={styles.yemOzetTip}>{tip.label}</Text>
                      <Text style={styles.yemOzetKg}>{Math.round(toplamKg)} kg</Text>
                      <Text style={[styles.yemOzetTl, { color: KUMES_RENK }]}>{Math.round(toplamTL).toLocaleString('tr-TR')} TL</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {yemAlimlar.length === 0 ? (
              <BosDurum ikon="barley-off" mesaj="Henüz yem alımı yok" />
            ) : (
              yemAlimlar.map(a => {
                const tipBilgi = KUMES_YEM_TIPLERI.find(t => t.id === a.tip);
                const miktarSayi = parseFloat(a.miktar || 0);
                const fiyatSayi = parseFloat(a.fiyat || 0);
                const kgFiyat = miktarSayi > 0 ? (fiyatSayi / miktarSayi).toFixed(2) : null;
                return (
                  <View key={a.id} style={styles.alimKart}>
                    <View style={[styles.alimIkon, { backgroundColor: (tipBilgi?.renk || KUMES_RENK) + '20' }]}>
                      <MaterialCommunityIcons name={tipBilgi?.icon || 'barley'} size={22} color={tipBilgi?.renk || KUMES_RENK} />
                    </View>
                    <View style={styles.alimBilgi}>
                      <Text style={styles.alimTip}>{tipBilgi?.label || a.tip}</Text>
                      <Text style={styles.alimAlt}>{a.tarih} • {miktarSayi} kg</Text>
                      {kgFiyat && <Text style={styles.alimKgFiyat}>{kgFiyat} TL/kg</Text>}
                      {a.not ? <Text style={styles.alimNot}>{a.not}</Text> : null}
                    </View>
                    <Text style={[styles.alimFiyat, { color: KUMES_RENK }]}>{fiyatSayi.toLocaleString('tr-TR')} ₺</Text>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Sil', 'Bu alım kaydını silmek istiyor musunuz?', [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: async () => { await kumesYemAlimSil(a.id); veriYukle(); } },
                      ])}
                      style={{ padding: 6 }}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ─── FİNANS TAB ─── */}
        {aktifTab === 'finans' && (
          <View>
            <View style={styles.finansButonSatir}>
              <TouchableOpacity style={[styles.finansButon, { backgroundColor: COLORS.success }]} onPress={() => setSatisModal(true)}>
                <MaterialCommunityIcons name="cash-plus" size={18} color="#fff" />
                <Text style={styles.finansButonYazi}>Satış Ekle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.finansButon, { backgroundColor: COLORS.danger }]} onPress={() => {
                if (aktifGruplar.length === 0) { Alert.alert('Önce grup ekle'); return; }
                setKayipForm({ ...BOŞ_KAYIP, grupId: aktifGruplar[0].id });
                setKayipModal(true);
              }}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#fff" />
                <Text style={styles.finansButonYazi}>Kayıp Kaydet</Text>
              </TouchableOpacity>
            </View>

            {/* Satışlar */}
            <Text style={styles.listeBolumBaslik}>Satış Geçmişi</Text>
            {satislar.length === 0 ? (
              <BosDurum ikon="cash-off" mesaj="Henüz satış kaydı yok" />
            ) : (
              satislar.map(s => (
                <View key={s.id} style={styles.satisKart}>
                  <View style={[styles.satisIkon, { backgroundColor: (s.tip === 'yumurta' ? '#E67E22' : COLORS.danger) + '20' }]}>
                    <MaterialCommunityIcons
                      name={s.tip === 'yumurta' ? 'egg' : 'food-drumstick'}
                      size={22}
                      color={s.tip === 'yumurta' ? '#E67E22' : COLORS.danger}
                    />
                  </View>
                  <View style={styles.satisBilgi}>
                    <Text style={styles.satisTip}>{s.tip === 'yumurta' ? '🥚 Yumurta Satışı' : '🍗 Tavuk Satışı'}</Text>
                    <Text style={styles.satisAlt}>
                      {s.tarih}{s.adet ? ` • ${s.adet} adet` : ''}{s.alici ? ` • ${s.alici}` : ''}
                    </Text>
                    {s.birimFiyat ? <Text style={styles.satisBirim}>{s.birimFiyat} TL/adet</Text> : null}
                  </View>
                  <Text style={[styles.satisTutar, { color: COLORS.success }]}>{parseFloat(s.tutar).toLocaleString('tr-TR')} ₺</Text>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Sil', 'Bu satış kaydını silmek istiyor musunuz?', [
                      { text: 'İptal', style: 'cancel' },
                      { text: 'Sil', style: 'destructive', onPress: async () => { await kumesSatisSil(s.id); veriYukle(); } },
                    ])}
                    style={{ padding: 6 }}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Kayıplar */}
            <Text style={[styles.listeBolumBaslik, { marginTop: 16 }]}>Kayıp / Ölüm Geçmişi</Text>
            {kayiplar.length === 0 ? (
              <BosDurum ikon="check-circle-outline" mesaj="Kayıp kaydı yok ✅" />
            ) : (
              kayiplar.map(k => {
                const grup = gruplar.find(g => g.id === k.grupId);
                return (
                  <View key={k.id} style={styles.kayipKart}>
                    <MaterialCommunityIcons name="alert-circle" size={22} color={COLORS.danger} />
                    <View style={styles.kayipBilgi}>
                      <Text style={styles.kayipBaslik}>{grup?.isim || 'Bilinmeyen Grup'} — {k.adet} tavuk</Text>
                      <Text style={styles.kayipAlt}>{k.tarih}{k.sebep ? ` • ${k.sebep}` : ''}</Text>
                      {k.not ? <Text style={styles.kayipNot}>{k.not}</Text> : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Sil', 'Kaydı sil? Grup sayısı geri artırılacak.', [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: async () => { await kumesKayipSil(k.id); veriYukle(); } },
                      ])}
                      style={{ padding: 6 }}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

      </ScrollView>

      {/* ─── GRUP EKLE MODAL ─── */}
      <Modal visible={grupEkleModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Yeni Grup Ekle</Text>
            <TouchableOpacity onPress={() => { setGrupEkleModal(false); setGrupForm(BOŞ_GRUP); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <GrupForm form={grupForm} setForm={setGrupForm} yeniMi={true} />
            <TouchableOpacity style={[styles.kaydetButon, { backgroundColor: KUMES_RENK }]} onPress={handleGrupEkle}>
              <Text style={styles.kaydetYazi}>GRUBU EKLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ─── GRUP DÜZENLE MODAL ─── */}
      <Modal visible={grupDuzenleModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Grubu Düzenle</Text>
            <TouchableOpacity onPress={() => { setGrupDuzenleModal(false); setDuzenleId(null); setGrupForm(BOŞ_GRUP); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <GrupForm form={grupForm} setForm={setGrupForm} yeniMi={false} />
            <TouchableOpacity style={[styles.kaydetButon, { backgroundColor: KUMES_RENK }]} onPress={handleGrupDuzenleKaydet}>
              <Text style={styles.kaydetYazi}>KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ─── YUMURTA MODAL ─── */}
      <Modal visible={yumurtaModal} animationType="slide" transparent>
        <View style={styles.altModalArkaPlan}>
          <SafeAreaView style={styles.altModalKutu}>
            <View style={styles.modalUst}>
              <Text style={styles.modalBaslik}>
                🥚 Yumurta Kaydı {seciliGrup ? `— ${seciliGrup.isim}` : ''}
              </Text>
              <TouchableOpacity onPress={() => { setYumurtaModal(false); setYumurtaForm(BOŞ_YUMURTA); }}>
                <MaterialCommunityIcons name="close" size={26} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {/* Grup seç */}
              {aktifGruplar.length > 1 && (
                <>
                  <Text style={styles.formLabel}>Grup</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                    {aktifGruplar.map(g => (
                      <TouchableOpacity
                        key={g.id}
                        style={[styles.grupSecButon, seciliGrup?.id === g.id && { backgroundColor: KUMES_RENK, borderColor: KUMES_RENK }]}
                        onPress={() => setSeciliGrup(g)}
                      >
                        <Text style={[styles.grupSecYazi, seciliGrup?.id === g.id && { color: '#fff' }]}>{g.isim}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
              <FormInput label="Tarih" placeholder="01.06.2026" value={yumurtaForm.tarih} onChange={v => setYumurtaForm({ ...yumurtaForm, tarih: v })} />
              <FormInput label="Yumurta Adedi *" placeholder="Örn: 48" value={yumurtaForm.adet} onChange={v => setYumurtaForm({ ...yumurtaForm, adet: v })} klavye="numeric" />
              <FormInput label="Kırık Adet" placeholder="0" value={yumurtaForm.kirik} onChange={v => setYumurtaForm({ ...yumurtaForm, kirik: v })} klavye="numeric" />
              <FormInput label="Not" placeholder="Opsiyonel" value={yumurtaForm.not} onChange={v => setYumurtaForm({ ...yumurtaForm, not: v })} />
              <TouchableOpacity style={[styles.kaydetButon, { backgroundColor: '#E67E22' }]} onPress={handleYumurtaKaydet}>
                <Text style={styles.kaydetYazi}>KAYDET</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ─── YEM MODAL ─── */}
      <Modal visible={yemModal} animationType="slide" transparent>
        <View style={styles.altModalArkaPlan}>
          <SafeAreaView style={styles.altModalKutu}>
            <View style={styles.modalUst}>
              <Text style={styles.modalBaslik}>🌾 Yem Alımı</Text>
              <TouchableOpacity onPress={() => { setYemModal(false); setYemForm(BOŞ_YEM); }}>
                <MaterialCommunityIcons name="close" size={26} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.formLabel}>Yem Tipi</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {KUMES_YEM_TIPLERI.map(y => (
                  <TouchableOpacity
                    key={y.id}
                    style={[styles.tipButon, yemForm.tip === y.id && { backgroundColor: y.renk, borderColor: y.renk }]}
                    onPress={() => setYemForm({ ...yemForm, tip: y.id })}
                  >
                    <MaterialCommunityIcons name={y.icon} size={18} color={yemForm.tip === y.id ? '#fff' : y.renk} />
                    <Text style={[styles.tipButonYazi, yemForm.tip === y.id && { color: '#fff' }]}>{y.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <FormInput label="Miktar (kg) *" placeholder="Örn: 200" value={yemForm.miktar} onChange={v => setYemForm({ ...yemForm, miktar: v })} klavye="numeric" />
              <FormInput label="Toplam Fiyat (TL) *" placeholder="Örn: 1200" value={yemForm.fiyat} onChange={v => setYemForm({ ...yemForm, fiyat: v })} klavye="numeric" />
              <FormInput label="Tarih" placeholder="01.06.2026" value={yemForm.tarih} onChange={v => setYemForm({ ...yemForm, tarih: v })} />
              <FormInput label="Not" placeholder="Nereden alındı vb." value={yemForm.not} onChange={v => setYemForm({ ...yemForm, not: v })} />
              {yemForm.miktar && yemForm.fiyat && parseFloat(yemForm.miktar) > 0 && (
                <View style={[styles.onizleme, { backgroundColor: KUMES_RENK + '15' }]}>
                  <Text style={[styles.onizlemeYazi, { color: KUMES_RENK }]}>
                    kg başına ≈ {(parseFloat(yemForm.fiyat) / parseFloat(yemForm.miktar)).toFixed(2)} TL
                  </Text>
                </View>
              )}
              <TouchableOpacity style={[styles.kaydetButon, { backgroundColor: KUMES_RENK }]} onPress={handleYemEkle}>
                <Text style={styles.kaydetYazi}>ALIMI KAYDET</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ─── SATIŞ MODAL ─── */}
      <Modal visible={satisModal} animationType="slide" transparent>
        <View style={styles.altModalArkaPlan}>
          <SafeAreaView style={styles.altModalKutu}>
            <View style={styles.modalUst}>
              <Text style={styles.modalBaslik}>💰 Satış Kaydı</Text>
              <TouchableOpacity onPress={() => { setSatisModal(false); setSatisForm(BOŞ_SATIS); }}>
                <MaterialCommunityIcons name="close" size={26} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.formLabel}>Satış Tipi</Text>
              <View style={styles.ciftButon}>
                {[{ id: 'yumurta', label: '🥚 Yumurta' }, { id: 'tavuk', label: '🍗 Tavuk' }].map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.ciftButonItem, satisForm.tip === t.id && { backgroundColor: COLORS.success, borderColor: COLORS.success }]}
                    onPress={() => setSatisForm({ ...satisForm, tip: t.id })}
                  >
                    <Text style={[styles.ciftButonYazi, satisForm.tip === t.id && { color: '#fff' }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <FormInput label="Adet" placeholder="Örn: 30" value={satisForm.adet} onChange={v => {
                const adet = v;
                const birim = satisForm.birimFiyat;
                const tutar = adet && birim ? (parseFloat(adet) * parseFloat(birim)).toFixed(0) : satisForm.tutar;
                setSatisForm({ ...satisForm, adet, tutar });
              }} klavye="numeric" />
              <FormInput label="Birim Fiyat (TL/adet)" placeholder="Örn: 5" value={satisForm.birimFiyat} onChange={v => {
                const birim = v;
                const adet = satisForm.adet;
                const tutar = adet && birim ? (parseFloat(adet) * parseFloat(birim)).toFixed(0) : satisForm.tutar;
                setSatisForm({ ...satisForm, birimFiyat: birim, tutar });
              }} klavye="numeric" />
              <FormInput label="Toplam Tutar (TL) *" placeholder="Otomatik veya manuel gir" value={satisForm.tutar} onChange={v => setSatisForm({ ...satisForm, tutar: v })} klavye="numeric" />
              <FormInput label="Tarih" placeholder="01.06.2026" value={satisForm.tarih} onChange={v => setSatisForm({ ...satisForm, tarih: v })} />
              <FormInput label="Alıcı" placeholder="Örn: Ahmet Bey" value={satisForm.alici} onChange={v => setSatisForm({ ...satisForm, alici: v })} />
              <FormInput label="Not" placeholder="Opsiyonel" value={satisForm.not} onChange={v => setSatisForm({ ...satisForm, not: v })} />
              <TouchableOpacity style={[styles.kaydetButon, { backgroundColor: COLORS.success }]} onPress={handleSatisEkle}>
                <Text style={styles.kaydetYazi}>SATIŞI KAYDET</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ─── KAYIP MODAL ─── */}
      <Modal visible={kayipModal} animationType="slide" transparent>
        <View style={styles.altModalArkaPlan}>
          <SafeAreaView style={styles.altModalKutu}>
            <View style={styles.modalUst}>
              <Text style={styles.modalBaslik}>⚠️ Kayıp / Ölüm Kaydı</Text>
              <TouchableOpacity onPress={() => { setKayipModal(false); setKayipForm({ ...BOŞ_KAYIP, grupId: null }); }}>
                <MaterialCommunityIcons name="close" size={26} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.formLabel}>Grup</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {aktifGruplar.map(g => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.grupSecButon, kayipForm.grupId === g.id && { backgroundColor: COLORS.danger, borderColor: COLORS.danger }]}
                    onPress={() => setKayipForm({ ...kayipForm, grupId: g.id })}
                  >
                    <Text style={[styles.grupSecYazi, kayipForm.grupId === g.id && { color: '#fff' }]}>{g.isim}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <FormInput label="Kayıp Adet *" placeholder="Örn: 2" value={kayipForm.adet} onChange={v => setKayipForm({ ...kayipForm, adet: v })} klavye="numeric" />
              <FormInput label="Sebep" placeholder="Örn: Hastalık, Yırtıcı" value={kayipForm.sebep} onChange={v => setKayipForm({ ...kayipForm, sebep: v })} />
              <FormInput label="Tarih" placeholder="01.06.2026" value={kayipForm.tarih} onChange={v => setKayipForm({ ...kayipForm, tarih: v })} />
              <FormInput label="Not" placeholder="Opsiyonel detay" value={kayipForm.not} onChange={v => setKayipForm({ ...kayipForm, not: v })} />
              <TouchableOpacity style={[styles.kaydetButon, { backgroundColor: COLORS.danger }]} onPress={handleKayipEkle}>
                <Text style={styles.kaydetYazi}>KAYDET</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

// ─── ORTAK FORM BİLEŞENİ ──────────────────────────────────────────

function GrupForm({ form, setForm, yeniMi }) {
  return (
    <>
      <FormInput label="Grup Adı *" placeholder="Örn: Arka Kümes, Kümüs-1" value={form.isim} onChange={v => setForm({ ...form, isim: v })} />

      <Text style={styles.formLabel}>Kümes Tipi</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {KUMES_TIPLERI.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tipButon, form.tip === t.id && { backgroundColor: t.renk, borderColor: t.renk }]}
            onPress={() => setForm({ ...form, tip: t.id })}
          >
            <MaterialCommunityIcons name={t.icon} size={16} color={form.tip === t.id ? '#fff' : t.renk} />
            <Text style={[styles.tipButonYazi, form.tip === t.id && { color: '#fff' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.formLabel}>Irk</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {KUMES_IRK_LISTESI.map(i => (
          <TouchableOpacity
            key={i.id}
            style={[styles.irkButon, form.irk === i.id && { backgroundColor: KUMES_RENK, borderColor: KUMES_RENK }]}
            onPress={() => setForm({ ...form, irk: i.id })}
          >
            <Text style={[styles.irkButonYazi, form.irk === i.id && { color: '#fff' }]}>{i.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FormInput label={yeniMi ? "Başlangıç Sayısı *" : "Başlangıç Sayısı"} placeholder="Örn: 100" value={form.baslangicSayi} onChange={v => setForm({ ...form, baslangicSayi: v })} klavye="numeric" />
      {!yeniMi && <FormInput label="Mevcut Sayı *" placeholder="Kaç tavuk var?" value={form.mevcutSayi} onChange={v => setForm({ ...form, mevcutSayi: v })} klavye="numeric" />}
      <FormInput label="Alış Fiyatı (TL toplam)" placeholder="Örn: 5000" value={form.alisFiyati} onChange={v => setForm({ ...form, alisFiyati: v })} klavye="numeric" />
      <FormInput label="Alış Tarihi" placeholder="01.01.2026" value={form.alisTarihi} onChange={v => setForm({ ...form, alisTarihi: v })} />
      <FormInput label="Not" placeholder="Opsiyonel" value={form.not} onChange={v => setForm({ ...form, not: v })} />
    </>
  );
}

// ─── ALT BİLEŞENLER ──────────────────────────────────────────────

function MetrikKart({ baslik, deger, birim, renk, ikon }) {
  return (
    <View style={styles.metrikKart}>
      <MaterialCommunityIcons name={ikon} size={20} color={renk} style={{ marginBottom: 4 }} />
      <Text style={[styles.metrikDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.metrikBaslik}>{baslik}</Text>
      <Text style={styles.metrikBirim}>{birim}</Text>
    </View>
  );
}

function FinansSatir({ label, deger, renk }) {
  return (
    <View style={styles.finansSatir}>
      <Text style={styles.finansLabel}>{label}</Text>
      <Text style={[styles.finansDeger, { color: renk }]}>
        {deger >= 0 ? '+' : ''}{Math.round(deger).toLocaleString('tr-TR')} TL
      </Text>
    </View>
  );
}

function MiniMetrik({ label, deger, renk }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.miniDeger, { color: renk || COLORS.textPrimary }]}>{deger}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function HizliButon({ ikon, label, renk, onPress }) {
  return (
    <TouchableOpacity style={[styles.hizliButon, { borderColor: renk + '40' }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.hizliIkon, { backgroundColor: renk + '20' }]}>
        <MaterialCommunityIcons name={ikon} size={24} color={renk} />
      </View>
      <Text style={[styles.hizliLabel, { color: renk }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function BosDurum({ ikon, mesaj }) {
  return (
    <View style={styles.bosDurum}>
      <MaterialCommunityIcons name={ikon} size={40} color={COLORS.textLight} />
      <Text style={styles.bosYazi}>{mesaj}</Text>
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

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollIcerik: { padding: 12, paddingBottom: 90 },

  tabBarScroll: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 48 },
  tabBar: { flexDirection: 'row' },
  tab: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabYazi: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },

  metrikGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  metrikKart: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 12, alignItems: 'center', width: '31%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  metrikDeger: { fontSize: 20, fontWeight: '900' },
  metrikBaslik: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  metrikBirim: { fontSize: 9, color: COLORS.textLight },

  finansKart: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  bolumBaslik: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  finansSatir: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  finansLabel: { fontSize: 13, color: COLORS.textSecondary },
  finansDeger: { fontSize: 13, fontWeight: '700' },
  ayrac: { height: 1, backgroundColor: COLORS.divider, marginVertical: 6 },
  netSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  netLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5 },
  netDeger: { fontSize: 20, fontWeight: '900' },

  hizliGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  hizliButon: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, alignItems: 'center', borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  hizliIkon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  hizliLabel: { fontSize: 12, fontWeight: '700' },

  grupKart: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  grupUst: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  grupIkon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  grupBilgi: { flex: 1, marginLeft: 12 },
  grupIsim: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  grupAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  grupSag: { alignItems: 'center' },
  grupSayi: { fontSize: 24, fontWeight: '900' },
  grupSayiAlt: { fontSize: 10, color: COLORS.textLight },
  grupAltSatir: {
    flexDirection: 'row', paddingTop: 10,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  arsivRozet: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: COLORS.textLight + '30',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  arsivYazi: { fontSize: 10, fontWeight: '700', color: COLORS.textLight },
  uzunBasHint: { fontSize: 10, color: COLORS.textLight, marginTop: 8, textAlign: 'right' },

  miniDeger: { fontSize: 13, fontWeight: '800' },
  miniLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 1 },

  grupSecButon: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.background, marginRight: 8,
  },
  grupSecYazi: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },

  yumurtaSatir: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  yumurtaIkon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  yumurtaBilgi: { flex: 1 },
  yumurtaTarih: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  yumurtaNot: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  yumurtaSag: { alignItems: 'flex-end' },
  yumurtaAdet: { fontSize: 16, fontWeight: '900' },
  yumurtaKirik: { fontSize: 11, color: COLORS.danger, marginTop: 2 },

  yemOzetSatir: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
  },
  yemOzetTip: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  yemOzetKg: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, width: 60, textAlign: 'right' },
  yemOzetTl: { fontSize: 13, fontWeight: '800', width: 80, textAlign: 'right' },

  alimKart: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  alimIkon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alimBilgi: { flex: 1 },
  alimTip: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  alimAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  alimKgFiyat: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  alimNot: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  alimFiyat: { fontSize: 14, fontWeight: '900' },

  finansButonSatir: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  finansButon: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 12, padding: 12,
  },
  finansButonYazi: { fontSize: 13, fontWeight: '700', color: '#fff' },
  listeBolumBaslik: { fontSize: 14, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 },

  satisKart: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  satisIkon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  satisBilgi: { flex: 1 },
  satisTip: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  satisAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  satisBirim: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  satisTutar: { fontSize: 15, fontWeight: '900' },

  kayipKart: {
    backgroundColor: COLORS.danger + '10', borderRadius: 12, padding: 12,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.danger + '30',
  },
  kayipBilgi: { flex: 1 },
  kayipBaslik: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  kayipAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  kayipNot: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },

  ekleButon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 12, gap: 6, marginBottom: 14,
  },
  ekleButonYazi: { fontSize: 14, fontWeight: '700', color: '#fff' },

  bosDurum: { alignItems: 'center', paddingTop: 50, gap: 10 },
  bosYazi: { fontSize: 14, color: COLORS.textLight },

  modalContainer: { flex: 1, backgroundColor: COLORS.surface },
  altModalArkaPlan: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  altModalKutu: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalUst: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalBaslik: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },

  ciftButon: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  ciftButonItem: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  ciftButonYazi: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },

  tipButon: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border,
    marginRight: 8, backgroundColor: COLORS.background,
  },
  tipButonYazi: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },

  irkButon: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8,
    backgroundColor: COLORS.background,
  },
  irkButonYazi: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },

  onizleme: { borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 10 },
  onizlemeYazi: { fontSize: 13, fontWeight: '700' },

  formGrup: { marginBottom: 14 },
  formLabel: {
    fontSize: 12, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: COLORS.background, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },

  kaydetButon: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  kaydetYazi: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
