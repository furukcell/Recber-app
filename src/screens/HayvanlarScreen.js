// Reçber - Hayvanlar Listesi Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { besiLimitAsildi } from '../utils/proLimits';

import HeaderBar from '../components/HeaderBar';
import HayvanKart from '../components/HayvanKart';
import COLORS from '../theme/colors';
import {
  getHayvanlar, hayvanEkle, hayvanGuncelle, hayvanSil,
  getAktifModul, getProDurum
} from '../data/storage';
import { IRK_LISTESI, APP } from '../data/constants';

const BOŞ_HAYVAN = {
  isim: '', kupeNo: '', alisKilo: '', alisFiyat: '',
  alisYeri: '', alisTarihi: '', irk: '', cinsiyet: '',
  dogumTarihi: '', hedefKilo: '', not: '',
};

export default function HayvanlarScreen({ navigation }) {
  const [hayvanlar, setHayvanlar] = useState([]);
  const [aktifModul, setModul] = useState('besi');
  const [isPro, setIsPro] = useState(false);
  const [ekleModal, setEkleModal] = useState(false);
  const [duzenleModal, setDuzenleModal] = useState(false);
  const [proModal, setProModal] = useState(false);
  const [form, setForm] = useState(BOŞ_HAYVAN);
  const [duzenleForm, setDuzenleForm] = useState(BOŞ_HAYVAN);
  const [duzenlenecekId, setDuzenlenecekId] = useState(null);
  const [filtre, setFiltre] = useState('aktif');
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul || 'besi');
    const pro = await getProDurum();
    setIsPro(pro);
    const liste = await getHayvanlar();
    setHayvanlar(liste);
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const filtrelenmis = hayvanlar.filter(h => {
    if (filtre === 'aktif') return !h.satildiMi;
    if (filtre === 'satildi') return h.satildiMi;
    return true;
  });

  const aktifSayisi = hayvanlar.filter(h => !h.satildiMi).length;
  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

 // ─── HAYVAN EKLE ──────────────────────────────────────────────
const handleEkleBasin = () => {
  if (besiLimitAsildi(aktifSayisi)) {
    navigation.navigate('ProEkrani')
    return;
  }

  setEkleModal(true);
};

  const handleEkle = async () => {
    if (!form.isim || !form.alisKilo) {
      Alert.alert('Eksik Bilgi', 'İsim ve alış kilosu zorunludur.');
      return;
    }
    await hayvanEkle(form);
    setEkleModal(false);
    setForm(BOŞ_HAYVAN);
    veriYukle();
  };

  // ─── HAYVAN DÜZENLE ───────────────────────────────────────────
  const handleDuzenleBasin = (hayvan) => {
    setDuzenlenecekId(hayvan.id);
    setDuzenleForm({
      isim: hayvan.isim || '',
      kupeNo: hayvan.kupeNo || '',
      alisKilo: hayvan.alisKilo || '',
      alisFiyat: hayvan.alisFiyat || '',
      alisYeri: hayvan.alisYeri || '',
      alisTarihi: hayvan.alisTarihi || '',
      irk: hayvan.irk || '',
      cinsiyet: hayvan.cinsiyet || '',
      dogumTarihi: hayvan.dogumTarihi || '',
      hedefKilo: hayvan.hedefKilo || '',
      not: hayvan.not || '',
    });
    setDuzenleModal(true);
  };

  const handleDuzenleKaydet = async () => {
    if (!duzenleForm.isim || !duzenleForm.alisKilo) {
      Alert.alert('Eksik Bilgi', 'İsim ve alış kilosu zorunludur.');
      return;
    }
    await hayvanGuncelle(duzenlenecekId, duzenleForm);
    setDuzenleModal(false);
    setDuzenlenecekId(null);
    setDuzenleForm(BOŞ_HAYVAN);
    veriYukle();
    Alert.alert('Kaydedildi ✅', 'Hayvan bilgileri güncellendi.');
  };

  // ─── HAYVAN SİL ───────────────────────────────────────────────
  const handleSil = (hayvan) => {
    Alert.alert(
      'Hayvanı Sil',
      `"${hayvan.isim}" kalıcı olarak silinecek.\n\nTartım, aşı ve sağlık kayıtları da silinmez ama bu hayvana ait görünmez.\n\nEmin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            await hayvanSil(hayvan.id);
            veriYukle();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik={aktifModul === 'besi' ? 'Hayvanlar' : 'Sürü'}
        altBaslik={`${aktifSayisi} aktif hayvan`}
        modulRenk={modulRenk}
        sagIcon="plus-circle"
        sagOnPress={handleEkleBasin}
      />

      {/* Ücretsiz limit göstergesi */}
      {!isPro && (
        <View style={[styles.limitBant, {
          backgroundColor: aktifSayisi >= APP.ucretsizLimit
            ? COLORS.danger + '15' : modulRenk + '10'
        }]}>
          <MaterialCommunityIcons
            name={aktifSayisi >= APP.ucretsizLimit ? 'lock' : 'information-outline'}
            size={15}
            color={aktifSayisi >= APP.ucretsizLimit ? COLORS.danger : modulRenk}
          />
          <Text style={[styles.limitYazi, {
            color: aktifSayisi >= APP.ucretsizLimit ? COLORS.danger : COLORS.textSecondary
          }]}>
            {aktifSayisi >= APP.ucretsizLimit
              ? `Ücretsiz limit doldu (${APP.ucretsizLimit} hayvan). Pro'ya geç.`
              : `Ücretsiz: ${aktifSayisi}/${APP.ucretsizLimit} hayvan`}
          </Text>
          {aktifSayisi >= APP.ucretsizLimit && (
            <TouchableOpacity onPress={() => setProModal(true)}>
              <Text style={[styles.proLink, { color: COLORS.accent }]}>Pro →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Long-press ipucu */}
      <View style={styles.ipucuBant}>
        <MaterialCommunityIcons name="gesture-tap-hold" size={14} color={COLORS.textLight} />
        <Text style={styles.ipucuYazi}>Düzenlemek veya silmek için karta uzun bas</Text>
      </View>

      {/* Filtre Sekmeler */}
      <View style={styles.filtreSatir}>
        {[
          { key: 'aktif', label: 'Aktif' },
          { key: 'satildi', label: 'Satılan' },
          { key: 'hepsi', label: 'Hepsi' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtreButon, filtre === f.key && { backgroundColor: modulRenk }]}
            onPress={() => setFiltre(f.key)}
          >
            <Text style={[styles.filtreYazi, filtre === f.key && { color: '#fff' }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={
          <RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={modulRenk} />
        }
      >
        {filtrelenmis.length === 0 ? (
          <View style={styles.bosDurum}>
            <MaterialCommunityIcons name="cow-off" size={56} color={COLORS.textLight} />
            <Text style={styles.bosYazi}>Henüz hayvan yok</Text>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: modulRenk }]}
              onPress={handleEkleBasin}
            >
              <Text style={styles.ekleButonYazi}>+ Hayvan Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtrelenmis.map(h => (
            <HayvanKart
              key={h.id}
              hayvan={h}
              modulRenk={modulRenk}
              onPress={() => navigation.navigate('HayvanDetay', { hayvanId: h.id })}
              onDuzenle={handleDuzenleBasin}
              onSil={handleSil}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: modulRenk }]}
        onPress={handleEkleBasin}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* ─── HAYVAN EKLE MODAL ─── */}
      <Modal visible={ekleModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Yeni Hayvan Ekle</Text>
            <TouchableOpacity onPress={() => { setEkleModal(false); setForm(BOŞ_HAYVAN); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <HayvanForm
              form={form}
              setForm={setForm}
              modulRenk={modulRenk}
            />
            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: modulRenk }]}
              onPress={handleEkle}
            >
              <Text style={styles.kaydetYazi}>HAYVAN EKLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ─── HAYVAN DÜZENLE MODAL ─── */}
      <Modal visible={duzenleModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Hayvanı Düzenle</Text>
            <TouchableOpacity onPress={() => {
              setDuzenleModal(false);
              setDuzenlenecekId(null);
              setDuzenleForm(BOŞ_HAYVAN);
            }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <HayvanForm
              form={duzenleForm}
              setForm={setDuzenleForm}
              modulRenk={modulRenk}
            />
            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: modulRenk }]}
              onPress={handleDuzenleKaydet}
            >
              <Text style={styles.kaydetYazi}>KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ─── PRO MODAL ─── */}
      <Modal visible={proModal} animationType="slide" transparent>
        <View style={styles.proModalArkaPlan}>
          <View style={styles.proModalKutu}>
            <Text style={styles.proModalIkon}>⭐</Text>
            <Text style={styles.proModalBaslik}>Reçber Pro</Text>
            <Text style={styles.proModalAlt}>Sınırsız hayvan takibi</Text>
            <Text style={styles.proModalMetin}>
              Besi Pro ile sınırsız hayvan takip edin.{'\n\n'}
              Hayvan başı kilo artışı, yem maliyeti, veteriner gideri ve tahmini kâr/zarar hesabını görün.
              Satış zamanınızı daha bilinçli planlayın.{'\n\n'}
              Sadece 1 kg karkas farkı bile uygulama ücretini karşılayabilir.
            </Text>
            <View style={[styles.proFiyatKutu, { backgroundColor: COLORS.accent + '20' }]}>
              <Text style={styles.proFiyat}>{APP.proFiyat} TL</Text>
              <Text style={styles.proFiyatAlt}>Tek Seferlik</Text>
            </View>
            <TouchableOpacity
              style={[styles.proButon, { backgroundColor: COLORS.textLight }]}
              onPress={() => Alert.alert('Yakında', 'Satın alma özelliği yakında aktif olacak.')}
            >
              <Text style={styles.proButonYazi}>Satın alma yakında</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.proKapat} onPress={() => setProModal(false)}>
              <Text style={styles.proKapatYazi}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── HAYVAN FORM (Ekle ve Düzenle için ortak) ─────────────────────

function HayvanForm({ form, setForm, modulRenk }) {
  return (
    <>
      <FormInput
        label="İsim / Takma Ad *"
        placeholder="Örn: Paşa"
        value={form.isim}
        onChange={v => setForm({ ...form, isim: v })}
      />
      <FormInput
        label="Küpe No"
        placeholder="Örn: TR48-001"
        value={form.kupeNo}
        onChange={v => setForm({ ...form, kupeNo: v })}
      />

      {/* Irk Seçimi */}
      <Text style={styles.formLabel}>Irk</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {IRK_LISTESI.map(irk => (
          <TouchableOpacity
            key={irk.id}
            style={[styles.irkButon, form.irk === irk.id && { backgroundColor: modulRenk, borderColor: modulRenk }]}
            onPress={() => setForm({ ...form, irk: irk.id })}
          >
            <Text style={[styles.irkButonYazi, form.irk === irk.id && { color: '#fff' }]}>
              {irk.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cinsiyet */}
      <Text style={styles.formLabel}>Cinsiyet</Text>
      <View style={styles.cinsiyetSatir}>
        {[
          { id: 'erkek', label: '♂ Erkek' },
          { id: 'disi', label: '♀ Dişi' },
        ].map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.cinsiyetButon, form.cinsiyet === c.id && { backgroundColor: modulRenk, borderColor: modulRenk }]}
            onPress={() => setForm({ ...form, cinsiyet: c.id })}
          >
            <Text style={[styles.cinsiyetYazi, form.cinsiyet === c.id && { color: '#fff' }]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FormInput label="Doğum Tarihi" placeholder="Örn: 15.03.2024" value={form.dogumTarihi} onChange={v => setForm({ ...form, dogumTarihi: v })} />
      <FormInput label="Alış Kilo (kg) *" placeholder="Örn: 250" value={form.alisKilo} onChange={v => setForm({ ...form, alisKilo: v })} klavye="numeric" />
      <FormInput label="Hedef Kilo (kg)" placeholder="Örn: 550" value={form.hedefKilo} onChange={v => setForm({ ...form, hedefKilo: v })} klavye="numeric" />
      <FormInput label="Alış Fiyatı (TL)" placeholder="Örn: 75000" value={form.alisFiyat} onChange={v => setForm({ ...form, alisFiyat: v })} klavye="numeric" />
      <FormInput label="Alındığı Yer" placeholder="Örn: Milas Hayvan Pazarı" value={form.alisYeri} onChange={v => setForm({ ...form, alisYeri: v })} />
      <FormInput label="Alış Tarihi" placeholder="Örn: 01.03.2026" value={form.alisTarihi} onChange={v => setForm({ ...form, alisTarihi: v })} />
      <FormInput label="Not" placeholder="Opsiyonel not" value={form.not} onChange={v => setForm({ ...form, not: v })} />
    </>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

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

  limitBant: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  limitYazi: { flex: 1, fontSize: 12, fontWeight: '600' },
  proLink: { fontSize: 13, fontWeight: '800' },

  ipucuBant: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  ipucuYazi: { fontSize: 11, color: COLORS.textLight },

  filtreSatir: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    padding: 8, gap: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  filtreButon: {
    flex: 1, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.background, alignItems: 'center',
  },
  filtreYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  bosDurum: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  bosYazi: { fontSize: 15, color: COLORS.textLight },
  ekleButon: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  ekleButonYazi: { fontSize: 14, fontWeight: '700', color: '#fff' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },

  modalContainer: { flex: 1, backgroundColor: COLORS.surface },
  modalUst: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalBaslik: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  modalScroll: { padding: 16 },

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

  irkButon: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginRight: 8,
    backgroundColor: COLORS.background,
  },
  irkButonYazi: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },

  cinsiyetSatir: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  cinsiyetButon: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.background,
  },
  cinsiyetYazi: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },

  kaydetButon: {
    borderRadius: 16, padding: 16, alignItems: 'center',
    marginTop: 10, marginBottom: 30,
  },
  kaydetYazi: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Pro Modal
  proModalArkaPlan: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  proModalKutu: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 28, alignItems: 'center',
  },
  proModalIkon: { fontSize: 48, marginBottom: 8 },
  proModalBaslik: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary },
  proModalAlt: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: 16 },
  proModalMetin: {
    fontSize: 14, color: COLORS.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 20,
  },
  proFiyatKutu: { borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16, width: '100%' },
  proFiyat: { fontSize: 32, fontWeight: '900', color: COLORS.accent },
  proFiyatAlt: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  proButon: {
    width: '100%', borderRadius: 16, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  proButonYazi: { fontSize: 16, fontWeight: '700', color: '#fff' },
  proKapat: { paddingVertical: 8 },
  proKapatYazi: { fontSize: 14, color: COLORS.textLight },
});
