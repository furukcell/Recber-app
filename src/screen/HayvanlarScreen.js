// Reçber - Hayvanlar Listesi Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import HayvanKart from '../components/HayvanKart';
import COLORS from '../theme/colors';
import { getHayvanlar, hayvanEkle, hayvanSil, getAktifModul } from '../data/storage';

const BOŞ_HAYVAN = {
  isim: '', kupeNo: '', alisKilo: '',
  alisFiyat: '', alisYeri: '', alisTarihi: '',
};

export default function HayvanlarScreen({ navigation }) {
  const [hayvanlar, setHayvanlar] = useState([]);
  const [aktifModul, setModul] = useState('besi');
  const [ekleModal, setEkleModal] = useState(false);
  const [form, setForm] = useState(BOŞ_HAYVAN);
  const [filtre, setFiltre] = useState('aktif'); // aktif | satildi | hepsi
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul);
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

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

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

  const handleSil = (hayvan) => {
    Alert.alert(
      'Hayvanı Sil',
      `${hayvan.isim} silinecek. Emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive',
          onPress: async () => {
            await hayvanSil(hayvan.id);
            veriYukle();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik={aktifModul === 'besi' ? 'Hayvanlar' : 'Sürü'}
        altBaslik={`${filtrelenmis.length} hayvan`}
        modulRenk={modulRenk}
        sagIcon="plus-circle"
        sagOnPress={() => setEkleModal(true)}
      />

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
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={modulRenk} />}
      >
        {filtrelenmis.length === 0 ? (
          <View style={styles.bosDurum}>
            <MaterialCommunityIcons name="cow-off" size={56} color={COLORS.textLight} />
            <Text style={styles.bosYazi}>Henüz hayvan yok</Text>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: modulRenk }]}
              onPress={() => setEkleModal(true)}
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
              onPress={() => navigation.navigate('HayvanDetay', { hayvan: h })}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: modulRenk }]}
        onPress={() => setEkleModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Hayvan Ekle Modal */}
      <Modal visible={ekleModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Yeni Hayvan Ekle</Text>
            <TouchableOpacity onPress={() => { setEkleModal(false); setForm(BOŞ_HAYVAN); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <FormInput label="İsim / Takma Ad *" placeholder="Örn: Paşa" value={form.isim} onChange={v => setForm({ ...form, isim: v })} />
            <FormInput label="Küpe No" placeholder="Örn: TR48-001" value={form.kupeNo} onChange={v => setForm({ ...form, kupeNo: v })} />
            <FormInput label="Alış Kilo (kg) *" placeholder="Örn: 250" value={form.alisKilo} onChange={v => setForm({ ...form, alisKilo: v })} klavye="numeric" />
            <FormInput label="Alış Fiyatı (TL)" placeholder="Örn: 75000" value={form.alisFiyat} onChange={v => setForm({ ...form, alisFiyat: v })} klavye="numeric" />
            <FormInput label="Alındığı Yer" placeholder="Örn: Milas Hayvan Pazarı" value={form.alisYeri} onChange={v => setForm({ ...form, alisYeri: v })} />
            <FormInput label="Alış Tarihi" placeholder="Örn: 01.03.2026" value={form.alisTarihi} onChange={v => setForm({ ...form, alisTarihi: v })} />

            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: modulRenk }]}
              onPress={handleEkle}
            >
              <Text style={styles.kaydetYazi}>HAYVAN EKLE</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollIcerik: { padding: 12, paddingBottom: 90 },

  filtreSatir: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtreButon: {
    flex: 1, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  filtreYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  bosDurum: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80, gap: 12,
  },
  bosYazi: { fontSize: 15, color: COLORS.textLight },
  ekleButon: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  ekleButonYazi: { fontSize: 14, fontWeight: '700', color: '#fff' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  formInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12, padding: 14,
    fontSize: 15, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },

  kaydetButon: {
    borderRadius: 16, padding: 16,
    alignItems: 'center', marginTop: 10, marginBottom: 30,
  },
  kaydetYazi: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
