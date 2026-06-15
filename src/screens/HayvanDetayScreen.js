// Reçber - Hayvan Detay Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, SafeAreaView, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import {
  getHayvanlar, hayvanKayitlari, haftalikKayitEkle,
  hayvanAsilari, getSaglikKayitlar,
  satisKaydet, getAktifModul, getAyarlar,
} from '../data/storage';
import {
  besiGunuHesapla, gunlukCanliAgirlikArtisi,
  irkaGorePerformansDegerlendir, toplamMaliyet,
  tahminiSatisGeliri, tahminiKarZarar,
} from '../utils/hesaplama';
import { IRK_LISTESI, GCAA_RENKLER, GCAA_SINIRLAR } from '../data/constants';

export default function HayvanDetayScreen({ route, navigation }) {
  const { hayvanId } = route.params;

  const [hayvan, setHayvan] = useState(null);
  const [aktifModul, setModul] = useState('besi');
  const [kayitlar, setKayitlar] = useState([]);
  const [asilar, setAsilar] = useState([]);
  const [saglik, setSaglik] = useState([]);
  const [ayarlar, setAyarlar] = useState(null);
  const [aktifTab, setAktifTab] = useState('ozet');

  // Tartım Modal
  const [tartimModal, setTartimModal] = useState(false);
  const [tartimForm, setTartimForm] = useState({
    kilo: '', tarih: bugunTarih(),
    besiYemi: '0', saman: '0', silaj: '0',
    arpa: '0', misir: '0', yonca: '0',
  });

  // Satış Modal
  const [satisModal, setSatisModal] = useState(false);
  const [satisForm, setSatisForm] = useState({
    fiyat: '', tarih: bugunTarih(), alici: '', not: '',
  });

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul || 'besi');
    const a = await getAyarlar();
    setAyarlar(a);
    const tumHayvanlar = await getHayvanlar();
    const bulunan = tumHayvanlar.find(h => h.id === hayvanId);
    if (!bulunan) { navigation.goBack(); return; }
    setHayvan(bulunan);
    const k = await hayvanKayitlari(hayvanId);
    setKayitlar(k);
    const asi = await hayvanAsilari(hayvanId);
    setAsilar(asi);
    const s = await getSaglikKayitlar();
    setSaglik(s.filter(x => x.hayvanId === hayvanId));
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  if (!hayvan) return null;

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

  // ─── HESAPLAMALAR ─────────────────────────────────────────────
  const gun = besiGunuHesapla(hayvan);
  const gcaa = gunlukCanliAgirlikArtisi(hayvan, kayitlar);
  const performans = irkaGorePerformansDegerlendir(hayvan, kayitlar);
  const kgFark = parseFloat(hayvan.guncelKilo || 0) - parseFloat(hayvan.alisKilo || 0);

  const gcaaRenk = (v) => {
    if (v < GCAA_SINIRLAR.dusuk) return GCAA_RENKLER.dusuk;
    if (v < GCAA_SINIRLAR.orta) return GCAA_RENKLER.orta;
    return GCAA_RENKLER.iyi;
  };

  const performansDurumRenk = () => {
    switch (performans.durum) {
      case 'cok_iyi': return COLORS.success;
      case 'normal': return COLORS.info;
      case 'dusuk': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  // ─── TARTIM KAYDET ────────────────────────────────────────────
  const handleTartimKaydet = async () => {
    if (!tartimForm.kilo) { Alert.alert('Hata', 'Kilo giriniz.'); return; }
    await haftalikKayitEkle({ ...tartimForm, hayvanId });
    setTartimModal(false);
    setTartimForm({ kilo: '', tarih: bugunTarih(), besiYemi: '0', saman: '0', silaj: '0', arpa: '0', misir: '0', yonca: '0' });
    veriYukle();
    Alert.alert('Kaydedildi ✅', 'Tartım kaydı eklendi.');
  };

  // ─── SATIŞ KAYDET ─────────────────────────────────────────────
  const handleSatisKaydet = async () => {
    if (!satisForm.fiyat) { Alert.alert('Hata', 'Satış fiyatı giriniz.'); return; }
    Alert.alert(
      'Satışı Onayla',
      `${hayvan.isim} ${parseFloat(satisForm.fiyat).toLocaleString('tr-TR')} TL'ye satılacak. Onaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            await satisKaydet({ ...satisForm, hayvanId });
            setSatisModal(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const irkLabel = IRK_LISTESI.find(i => i.id === hayvan.irk)?.label || '-';

  const tabs = [
    { key: 'ozet', label: 'Özet', ikon: 'information-outline' },
    { key: 'performans', label: 'Performans', ikon: 'chart-line' },
    { key: 'tartim', label: 'Tartım', ikon: 'scale' },
    { key: 'saglik', label: 'Sağlık', ikon: 'medical-bag' },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik={hayvan.isim || 'Hayvan Detay'}
        altBaslik={hayvan.kupeNo || irkLabel}
        modulRenk={modulRenk}
        geriOnPress={() => navigation.goBack()}
        sagIcon={hayvan.satildiMi ? null : 'cash-plus'}
        sagOnPress={hayvan.satildiMi ? null : () => setSatisModal(true)}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, aktifTab === t.key && { borderBottomColor: modulRenk, borderBottomWidth: 2 }]}
            onPress={() => setAktifTab(t.key)}
          >
            <MaterialCommunityIcons name={t.ikon} size={16} color={aktifTab === t.key ? modulRenk : COLORS.textLight} />
            <Text style={[styles.tabYazi, aktifTab === t.key && { color: modulRenk }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* ─── ÖZET TAB ─── */}
        {aktifTab === 'ozet' && (
          <View>
            {/* Ana Metrikler */}
            <View style={styles.metrikGrid}>
              <MetrikKart baslik="Alış Kilo" deger={hayvan.alisKilo} birim="kg" renk={modulRenk} />
              <MetrikKart baslik="Güncel Kilo" deger={hayvan.guncelKilo} birim="kg" renk={modulRenk} />
              <MetrikKart baslik="Alınan" deger={kgFark >= 0 ? `+${kgFark.toFixed(0)}` : kgFark.toFixed(0)} birim="kg" renk={kgFark >= 0 ? COLORS.success : COLORS.danger} />
              <MetrikKart baslik="Besi Günü" deger={gun} birim="gün" renk={modulRenk} />
              <MetrikKart baslik="GCAA" deger={gcaa} birim="kg/gün" renk={gcaaRenk(gcaa)} />
              <MetrikKart baslik="Toplam Yem" deger={hayvan.toplamYem?.toFixed(0) || '0'} birim="kg" renk={COLORS.accent} />
            </View>

            {/* Alış Bilgileri */}
            <View style={styles.bilgiKart}>
              <Text style={styles.bilgiBaslik}>Hayvan Bilgileri</Text>
              <BilgiSatir ikon="cow" label="Irk" deger={irkLabel} />
              <BilgiSatir ikon="gender-male-female" label="Cinsiyet" deger={hayvan.cinsiyet === 'erkek' ? '♂ Erkek' : hayvan.cinsiyet === 'disi' ? '♀ Dişi' : '-'} />
              <BilgiSatir ikon="calendar" label="Doğum Tarihi" deger={hayvan.dogumTarihi || '-'} />
              <BilgiSatir ikon="flag-checkered" label="Hedef Kilo" deger={hayvan.hedefKilo ? `${hayvan.hedefKilo} kg` : '-'} />
              <BilgiSatir ikon="cash" label="Alış Fiyatı" deger={hayvan.alisFiyat ? `${parseFloat(hayvan.alisFiyat).toLocaleString('tr-TR')} TL` : '-'} />
              <BilgiSatir ikon="map-marker" label="Alındığı Yer" deger={hayvan.alisYeri || '-'} />
              <BilgiSatir ikon="calendar-today" label="Alış Tarihi" deger={hayvan.alisTarihi || '-'} />
              {hayvan.not ? <BilgiSatir ikon="note-text" label="Not" deger={hayvan.not} /> : null}
            </View>

            {/* Satış Bilgileri */}
            {hayvan.satildiMi && (
              <View style={[styles.bilgiKart, { borderLeftWidth: 4, borderLeftColor: COLORS.success }]}>
                <Text style={styles.bilgiBaslik}>Satış Bilgileri</Text>
                <BilgiSatir ikon="cash-plus" label="Satış Fiyatı" deger={`${parseFloat(hayvan.satisFiyati || 0).toLocaleString('tr-TR')} TL`} />
                <BilgiSatir ikon="calendar-check" label="Satış Tarihi" deger={hayvan.satisTarihi || '-'} />
                <View style={[styles.karKutu, {
                  backgroundColor: (parseFloat(hayvan.satisFiyati || 0) - parseFloat(hayvan.alisFiyat || 0)) >= 0
                    ? COLORS.success + '15' : COLORS.danger + '15'
                }]}>
                  <Text style={styles.karBaslik}>SATIŞ FARKI (Alış - Satış)</Text>
                  <Text style={[styles.karDeger, {
                    color: (parseFloat(hayvan.satisFiyati || 0) - parseFloat(hayvan.alisFiyat || 0)) >= 0
                      ? COLORS.success : COLORS.danger
                  }]}>
                    {(parseFloat(hayvan.satisFiyati || 0) - parseFloat(hayvan.alisFiyat || 0)) >= 0 ? '+' : ''}
                    {(parseFloat(hayvan.satisFiyati || 0) - parseFloat(hayvan.alisFiyat || 0)).toLocaleString('tr-TR')} TL
                  </Text>
                </View>
              </View>
            )}

            {/* Satış Butonu */}
            {!hayvan.satildiMi && (
              <TouchableOpacity
                style={[styles.satisButon, { backgroundColor: COLORS.accent }]}
                onPress={() => setSatisModal(true)}
              >
                <MaterialCommunityIcons name="cash-plus" size={20} color={COLORS.textOnAccent} />
                <Text style={styles.satisButonYazi}>SATIŞI KAYDET</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── PERFORMANS TAB ─── */}
        {aktifTab === 'performans' && (
          <View>
            {/* GCAA Özet */}
            <View style={styles.gcaaKart}>
              <Text style={styles.gcaaBaslik}>Günlük Canlı Ağırlık Artışı</Text>
              <Text style={[styles.gcaaDeger, { color: gcaaRenk(gcaa) }]}>{gcaa} kg/gün</Text>
              <Text style={styles.gcaaAlt}>{gun} günlük besi ortalaması</Text>
            </View>

            {/* Irka Göre Performans */}
            <View style={[styles.bilgiKart, { borderLeftWidth: 4, borderLeftColor: performansDurumRenk() }]}>
              <View style={styles.performansUst}>
                <Text style={styles.bilgiBaslik}>Irka Göre Performans</Text>
                <View style={[styles.performansRozet, { backgroundColor: performansDurumRenk() + '20' }]}>
                  <Text style={[styles.performansRozetYazi, { color: performansDurumRenk() }]}>
                    {performans.baslik}
                  </Text>
                </View>
              </View>

              <BilgiSatir ikon="cow" label="Irk" deger={irkLabel} />
              {performans.beklenenMin && (
                <BilgiSatir
                  ikon="arrow-left-right"
                  label="Beklenen GCAA"
                  deger={`${performans.beklenenMin} - ${performans.beklenenMax} kg/gün`}
                />
              )}
              {performans.ideal && (
                <BilgiSatir ikon="star" label="İdeal GCAA" deger={`${performans.ideal} kg/gün`} />
              )}
              <BilgiSatir
                ikon="trending-up"
                label="Bu Hayvan"
                deger={`${performans.mevcutGcaa} kg/gün`}
                degerRenk={gcaaRenk(performans.mevcutGcaa)}
              />

              <View style={styles.performansMesajKutu}>
                <Text style={styles.performansMesaj}>{performans.mesaj}</Text>
              </View>
              <View style={[styles.performansTavsiyeKutu, { backgroundColor: performansDurumRenk() + '10' }]}>
                <MaterialCommunityIcons name="lightbulb-outline" size={16} color={performansDurumRenk()} />
                <Text style={[styles.performansTavsiye, { color: performansDurumRenk() }]}>
                  {performans.tavsiye}
                </Text>
              </View>
            </View>

            {/* Hedef Kilo İlerlemesi */}
            {hayvan.hedefKilo && (
              <View style={styles.bilgiKart}>
                <Text style={styles.bilgiBaslik}>Hedef Kilo İlerlemesi</Text>
                <View style={styles.hedefSatir}>
                  <Text style={styles.hedefText}>
                    {hayvan.guncelKilo} kg / {hayvan.hedefKilo} kg
                  </Text>
                  <Text style={[styles.hedefYuzde, { color: modulRenk }]}>
                    %{Math.min(Math.round((parseFloat(hayvan.guncelKilo) / parseFloat(hayvan.hedefKilo)) * 100), 100)}
                  </Text>
                </View>
                <View style={styles.hedefBarKap}>
                  <View style={[styles.hedefBar, {
                    width: `${Math.min((parseFloat(hayvan.guncelKilo) / parseFloat(hayvan.hedefKilo)) * 100, 100)}%`,
                    backgroundColor: modulRenk,
                  }]} />
                </View>
                <Text style={styles.hedefAlt}>
                  {Math.max(parseFloat(hayvan.hedefKilo) - parseFloat(hayvan.guncelKilo), 0).toFixed(0)} kg kaldı
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── TARTIM TAB ─── */}
        {aktifTab === 'tartim' && (
          <View>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: modulRenk }]}
              onPress={() => setTartimModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.ekleButonYazi}>Tartım Ekle</Text>
            </TouchableOpacity>

            {kayitlar.length === 0 ? (
              <BosDurum ikon="scale-off" mesaj="Henüz tartım kaydı yok" />
            ) : (
              kayitlar.map((k, i) => (
                <View key={k.id} style={styles.tartimSatir}>
                  <View style={[styles.tartimNo, { backgroundColor: modulRenk }]}>
                    <Text style={styles.tartimNoYazi}>{kayitlar.length - i}</Text>
                  </View>
                  <View style={styles.tartimBilgi}>
                    <Text style={styles.tartimTarih}>{k.tarih}</Text>
                    <Text style={styles.tartimAlt}>Toplam yem: {k.toplam?.toFixed(0) || 0} kg</Text>
                  </View>
                  <Text style={[styles.tartimKilo, { color: modulRenk }]}>{k.kilo} kg</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── SAĞLIK TAB ─── */}
        {aktifTab === 'saglik' && (
          <View>
            <View style={[styles.bilgiKart, { marginBottom: 16 }]}>
              <Text style={styles.bilgiBaslik}>Aşı Kayıtları ({asilar.length})</Text>
              {asilar.length === 0 ? (
                <Text style={styles.bosYazi}>Aşı kaydı yok</Text>
              ) : (
                asilar.map(a => (
                  <BilgiSatir key={a.id} ikon="needle" label={a.asiTuru} deger={a.tarih} />
                ))
              )}
            </View>
            <View style={styles.bilgiKart}>
              <Text style={styles.bilgiBaslik}>Sağlık Sorunları ({saglik.length})</Text>
              {saglik.length === 0 ? (
                <Text style={{ color: COLORS.success, fontSize: 14, fontWeight: '600' }}>✅ Tüm kayıtlar temiz</Text>
              ) : (
                saglik.map(s => (
                  <View key={s.id} style={[styles.saglikSatir, { opacity: s.cozulduMu ? 0.5 : 1 }]}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color={s.cozulduMu ? COLORS.textLight : COLORS.danger} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.saglikDurum}>{s.durum}</Text>
                      <Text style={styles.saglikNot}>{s.not || '-'} • {s.tarih}</Text>
                    </View>
                    {s.cozulduMu && <Text style={{ color: COLORS.success, fontSize: 11 }}>Çözüldü</Text>}
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ─── TARTIM MODAL ─── */}
      <Modal visible={tartimModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Tartım Ekle — {hayvan.isim}</Text>
            <TouchableOpacity onPress={() => setTartimModal(false)}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <FormInput label="Güncel Kilo (kg) *" placeholder="Örn: 320" value={tartimForm.kilo} onChange={v => setTartimForm({ ...tartimForm, kilo: v })} klavye="numeric" renk={modulRenk} />
            <FormInput label="Tarih" placeholder="01.06.2026" value={tartimForm.tarih} onChange={v => setTartimForm({ ...tartimForm, tarih: v })} renk={modulRenk} />
            <Text style={styles.yemBaslik}>Bu Hafta Verilen Yemler (kg)</Text>
            <View style={styles.yemGrid}>
              {[
                { key: 'besiYemi', label: 'Besi Yemi' },
                { key: 'arpa', label: 'Arpa' },
                { key: 'saman', label: 'Saman' },
                { key: 'silaj', label: 'Silaj' },
                { key: 'misir', label: 'Mısır' },
                { key: 'yonca', label: 'Yonca' },
              ].map(y => (
                <View key={y.key} style={styles.yemInputKutu}>
                  <Text style={styles.yemLabel}>{y.label}</Text>
                  <TextInput
                    style={styles.yemInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={tartimForm[y.key]}
                    onChangeText={v => setTartimForm({ ...tartimForm, [y.key]: v })}
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: modulRenk }]}
              onPress={handleTartimKaydet}
            >
              <Text style={styles.kaydetYazi}>KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ─── SATIŞ MODAL ─── */}
      <Modal visible={satisModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>{hayvan.isim} — Satış Kaydı</Text>
            <TouchableOpacity onPress={() => setSatisModal(false)}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <FormInput label="Satış Fiyatı (TL) *" placeholder="Örn: 95000" value={satisForm.fiyat} onChange={v => setSatisForm({ ...satisForm, fiyat: v })} klavye="numeric" renk={COLORS.accent} />
            <FormInput label="Satış Tarihi" placeholder="01.06.2026" value={satisForm.tarih} onChange={v => setSatisForm({ ...satisForm, tarih: v })} renk={COLORS.accent} />
            <FormInput label="Alıcı Adı" placeholder="Örn: Ahmet Bey" value={satisForm.alici} onChange={v => setSatisForm({ ...satisForm, alici: v })} renk={COLORS.accent} />
            <FormInput label="Not" placeholder="Opsiyonel not" value={satisForm.not} onChange={v => setSatisForm({ ...satisForm, not: v })} renk={COLORS.accent} />
            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: COLORS.accent }]}
              onPress={handleSatisKaydet}
            >
              <Text style={[styles.kaydetYazi, { color: COLORS.textOnAccent }]}>SATIŞI KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function MetrikKart({ baslik, deger, birim, renk }) {
  return (
    <View style={styles.metrikKart}>
      <Text style={styles.metrikBaslik}>{baslik}</Text>
      <Text style={[styles.metrikDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.metrikBirim}>{birim}</Text>
    </View>
  );
}

function BilgiSatir({ ikon, label, deger, degerRenk }) {
  return (
    <View style={styles.bilgiSatir}>
      <MaterialCommunityIcons name={ikon} size={16} color={COLORS.textSecondary} />
      <Text style={styles.bilgiLabel}>{label}</Text>
      <Text style={[styles.bilgiDeger, degerRenk && { color: degerRenk }]}>{deger}</Text>
    </View>
  );
}

function FormInput({ label, placeholder, value, onChange, klavye, renk }) {
  return (
    <View style={styles.formGrup}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, { borderColor: (renk || COLORS.border) + '60' }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChange}
        keyboardType={klavye || 'default'}
      />
    </View>
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

function bugunTarih() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 11, gap: 4,
  },
  tabYazi: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },

  metrikGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metrikKart: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, alignItems: 'center', width: '31%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  metrikBaslik: { fontSize: 10, color: COLORS.textLight, marginBottom: 4, textAlign: 'center' },
  metrikDeger: { fontSize: 18, fontWeight: '900' },
  metrikBirim: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },

  bilgiKart: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  bilgiBaslik: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  bilgiSatir: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, gap: 8,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
  },
  bilgiLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  bilgiDeger: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },

  karKutu: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  karBaslik: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  karDeger: { fontSize: 26, fontWeight: '900', marginTop: 4 },

  satisButon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, padding: 16, gap: 8, marginTop: 8,
  },
  satisButonYazi: { fontSize: 15, fontWeight: '800', color: COLORS.textOnAccent },

  // Performans
  gcaaKart: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 20, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  gcaaBaslik: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  gcaaDeger: { fontSize: 36, fontWeight: '900' },
  gcaaAlt: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },

  performansUst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  performansRozet: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  performansRozetYazi: { fontSize: 11, fontWeight: '700' },
  performansMesajKutu: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, marginTop: 10 },
  performansMesaj: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  performansTavsiyeKutu: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 10, padding: 12, marginTop: 8, gap: 8,
  },
  performansTavsiye: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },

  hedefSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hedefText: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  hedefYuzde: { fontSize: 16, fontWeight: '900' },
  hedefBarKap: { height: 10, backgroundColor: COLORS.borderLight, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  hedefBar: { height: 10, borderRadius: 5 },
  hedefAlt: { fontSize: 12, color: COLORS.textSecondary },

  // Tartım
  ekleButon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 12, gap: 6, marginBottom: 16,
  },
  ekleButonYazi: { fontSize: 14, fontWeight: '700', color: '#fff' },
  tartimSatir: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
  },
  tartimNo: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tartimNoYazi: { fontSize: 14, fontWeight: '900', color: '#fff' },
  tartimBilgi: { flex: 1 },
  tartimTarih: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  tartimAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  tartimKilo: { fontSize: 18, fontWeight: '900' },

  // Sağlık
  saglikSatir: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.divider,
  },
  saglikDurum: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  saglikNot: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  bosDurum: { alignItems: 'center', paddingTop: 40, gap: 10 },
  bosYazi: { fontSize: 14, color: COLORS.textLight },

  yemBaslik: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10, marginTop: 6 },
  yemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  yemInputKutu: { width: '30%' },
  yemLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '600' },
  yemInput: {
    backgroundColor: COLORS.background, borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: COLORS.border,
    fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center',
  },

  modalContainer: { flex: 1, backgroundColor: COLORS.surface },
  modalUst: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalBaslik: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },

  formGrup: { marginBottom: 14 },
  formLabel: {
    fontSize: 12, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: COLORS.background, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1,
  },

  kaydetButon: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  kaydetYazi: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
