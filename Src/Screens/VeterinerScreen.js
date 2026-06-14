// Reçber - Veteriner Ekranı
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
  getHayvanlar, getAsilar, asiEkle,
  getSaglikKayitlar, saglikKayitEkle, saglikCoz,
  getAktifModul,
} from '../data/storage';
import { ASI_TURLERI, SAGLIK_BELIRTILERI } from '../data/constants';

const BOŞ_ASI = { hayvanId: '', asiTuru: '', tarih: bugunTarih(), not: '' };
const BOŞ_SAGLIK = { hayvanId: '', durum: 'istahsiz', not: '', tarih: bugunTarih() };

export default function VeterinerScreen() {
  const [aktifModul, setModul] = useState('besi');
  const [hayvanlar, setHayvanlar] = useState([]);
  const [asilar, setAsilar] = useState([]);
  const [saglikKayitlar, setSaglikKayitlar] = useState([]);
  const [aktifTab, setAktifTab] = useState('saglik');
  const [yenileniyor, setYenileniyor] = useState(false);

  // Modallar
  const [asiModal, setAsiModal] = useState(false);
  const [saglikModal, setSaglikModal] = useState(false);
  const [asiForm, setAsiForm] = useState(BOŞ_ASI);
  const [saglikForm, setSaglikForm] = useState(BOŞ_SAGLIK);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul);
    const h = await getHayvanlar();
    setHayvanlar(h.filter(x => !x.satildiMi));
    const a = await getAsilar();
    setAsilar(a);
    const s = await getSaglikKayitlar();
    setSaglikKayitlar(s);
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

  const hayvanAdi = (id) => hayvanlar.find(h => h.id === id)?.isim || 'Bilinmiyor';

  const aktifSorunlar = saglikKayitlar.filter(s => !s.cozulduMu);
  const cozulenler = saglikKayitlar.filter(s => s.cozulduMu);

  // ─── AŞI KAYDET ───────────────────────────────────────────────
  const handleAsiKaydet = async () => {
    if (!asiForm.hayvanId || !asiForm.asiTuru) {
      Alert.alert('Eksik Bilgi', 'Hayvan ve aşı türü seçiniz.');
      return;
    }
    await asiEkle(asiForm);
    setAsiModal(false);
    setAsiForm(BOŞ_ASI);
    veriYukle();
  };

  // ─── SAĞLIK KAYDET ────────────────────────────────────────────
  const handleSaglikKaydet = async () => {
    if (!saglikForm.hayvanId) {
      Alert.alert('Eksik Bilgi', 'Hayvan seçiniz.');
      return;
    }
    await saglikKayitEkle(saglikForm);
    setSaglikModal(false);
    setSaglikForm(BOŞ_SAGLIK);
    veriYukle();
  };

  // ─── SAĞLIK ÇÖZ ───────────────────────────────────────────────
  const handleCoz = (kayit) => {
    Alert.alert(
      'Sorunu Çöz',
      `${hayvanAdi(kayit.hayvanId)} için "${kayit.durum}" sorunu çözüldü olarak işaretlensin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çözüldü',
          onPress: async () => {
            await saglikCoz(kayit.id, kayit.hayvanId);
            veriYukle();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Veteriner"
        altBaslik={aktifSorunlar.length > 0 ? `${aktifSorunlar.length} aktif sorun` : 'Tümü sağlıklı'}
        modulRenk={modulRenk}
      />

      {/* Aktif Sorun Uyarısı */}
      {aktifSorunlar.length > 0 && (
        <View style={styles.uyariBant}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.danger} />
          <Text style={styles.uyariYazi}>
            {aktifSorunlar.length} hayvan takip altında!
          </Text>
        </View>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'saglik', label: 'Sağlık', ikon: 'heart-pulse', sayi: aktifSorunlar.length },
          { key: 'asi', label: 'Aşı Takvimi', ikon: 'needle', sayi: asilar.length },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, aktifTab === t.key && { borderBottomColor: modulRenk, borderBottomWidth: 2 }]}
            onPress={() => setAktifTab(t.key)}
          >
            <MaterialCommunityIcons name={t.ikon} size={16} color={aktifTab === t.key ? modulRenk : COLORS.textLight} />
            <Text style={[styles.tabYazi, aktifTab === t.key && { color: modulRenk }]}>{t.label}</Text>
            {t.sayi > 0 && (
              <View style={[styles.tabRozet, { backgroundColor: t.key === 'saglik' ? COLORS.danger : modulRenk }]}>
                <Text style={styles.tabRozetYazi}>{t.sayi}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={modulRenk} />}
      >

        {/* SAĞLIK TAB */}
        {aktifTab === 'saglik' && (
          <View>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: COLORS.danger }]}
              onPress={() => setSaglikModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={styles.ekleButonYazi}>Sağlık Sorunu Ekle</Text>
            </TouchableOpacity>

            {/* Aktif Sorunlar */}
            {aktifSorunlar.length > 0 && (
              <View>
                <Text style={styles.bolumBaslik}>⚠️ Aktif Sorunlar</Text>
                {aktifSorunlar.map(s => {
                  const belirti = SAGLIK_BELIRTILERI.find(b => b.id === s.durum);
                  return (
                    <View key={s.id} style={styles.saglikKart}>
                      <View style={[styles.saglikIkon, { backgroundColor: COLORS.danger + '20' }]}>
                        <MaterialCommunityIcons
                          name={belirti?.icon || 'alert-circle'}
                          size={22}
                          color={COLORS.danger}
                        />
                      </View>
                      <View style={styles.saglikBilgi}>
                        <Text style={styles.saglikHayvan}>{hayvanAdi(s.hayvanId)}</Text>
                        <Text style={styles.saglikDurum}>{belirti?.label || s.durum}</Text>
                        {s.not ? <Text style={styles.saglikNot}>{s.not}</Text> : null}
                        <Text style={styles.saglikTarih}>{s.tarih}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.cozButon}
                        onPress={() => handleCoz(s)}
                      >
                        <MaterialCommunityIcons name="check-circle" size={28} color={COLORS.success} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Tüm Sağlıklı Mesajı */}
            {aktifSorunlar.length === 0 && (
              <View style={styles.saglikliKutu}>
                <Text style={styles.saglikliIkon}>✅</Text>
                <Text style={styles.saglikliYazi}>Tüm hayvanlar sağlıklı!</Text>
              </View>
            )}

            {/* Çözülen Sorunlar */}
            {cozulenler.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.bolumBaslik}>✅ Çözülen Sorunlar</Text>
                {cozulenler.map(s => {
                  const belirti = SAGLIK_BELIRTILERI.find(b => b.id === s.durum);
                  return (
                    <View key={s.id} style={[styles.saglikKart, { opacity: 0.55 }]}>
                      <View style={[styles.saglikIkon, { backgroundColor: COLORS.success + '20' }]}>
                        <MaterialCommunityIcons
                          name={belirti?.icon || 'check-circle'}
                          size={22}
                          color={COLORS.success}
                        />
                      </View>
                      <View style={styles.saglikBilgi}>
                        <Text style={styles.saglikHayvan}>{hayvanAdi(s.hayvanId)}</Text>
                        <Text style={styles.saglikDurum}>{belirti?.label || s.durum}</Text>
                        {s.not ? <Text style={styles.saglikNot}>{s.not}</Text> : null}
                        <Text style={styles.saglikTarih}>{s.tarih}</Text>
                      </View>
                      <MaterialCommunityIcons name="check-all" size={22} color={COLORS.success} />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* AŞI TAB */}
        {aktifTab === 'asi' && (
          <View>
            <TouchableOpacity
              style={[styles.ekleButon, { backgroundColor: COLORS.info }]}
              onPress={() => setAsiModal(true)}
            >
              <MaterialCommunityIcons name="needle" size={18} color="#fff" />
              <Text style={styles.ekleButonYazi}>Aşı Kaydı Ekle</Text>
            </TouchableOpacity>

            {/* Hayvan bazlı aşı özeti */}
            {hayvanlar.map(h => {
              const hAsilar = asilar.filter(a => a.hayvanId === h.id);
              if (hAsilar.length === 0) return null;
              return (
                <View key={h.id} style={styles.hayvanAsiKart}>
                  <View style={styles.hayvanAsiUst}>
                    <View style={[styles.hayvanAsiIkon, { backgroundColor: modulRenk }]}>
                      <MaterialCommunityIcons name="cow" size={18} color="#fff" />
                    </View>
                    <Text style={styles.hayvanAsiIsim}>{h.isim}</Text>
                    <View style={[styles.asiSayiRozet, { backgroundColor: COLORS.info + '20' }]}>
                      <Text style={[styles.asiSayiYazi, { color: COLORS.info }]}>{hAsilar.length} aşı</Text>
                    </View>
                  </View>
                  {hAsilar.map((a, i) => (
                    <View key={a.id} style={[styles.asiSatir, i < hAsilar.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: COLORS.divider }]}>
                      <MaterialCommunityIcons name="needle" size={14} color={COLORS.info} />
                      <Text style={styles.asiTur}>{a.asiTuru}</Text>
                      <Text style={styles.asiTarih}>{a.tarih}</Text>
                    </View>
                  ))}
                </View>
              );
            })}

            {asilar.length === 0 && (
              <View style={styles.bosDurum}>
                <MaterialCommunityIcons name="needle-off" size={48} color={COLORS.textLight} />
                <Text style={styles.bosYazi}>Henüz aşı kaydı yok</Text>
                <TouchableOpacity
                  style={[styles.bosButon, { backgroundColor: COLORS.info }]}
                  onPress={() => setAsiModal(true)}
                >
                  <Text style={styles.bosButonYazi}>İlk Aşıyı Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* AŞI MODAL */}
      <Modal visible={asiModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Aşı Kaydı Ekle</Text>
            <TouchableOpacity onPress={() => { setAsiModal(false); setAsiForm(BOŞ_ASI); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>

            {/* Hayvan Seçimi */}
            <Text style={styles.formLabel}>Hayvan Seçin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {hayvanlar.map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.secimButon, asiForm.hayvanId === h.id && { backgroundColor: modulRenk, borderColor: modulRenk }]}
                  onPress={() => setAsiForm({ ...asiForm, hayvanId: h.id })}
                >
                  <Text style={[styles.secimYazi, asiForm.hayvanId === h.id && { color: '#fff' }]}>{h.isim}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Aşı Türü */}
            <Text style={styles.formLabel}>Aşı Türü</Text>
            <View style={styles.asiTurleriGrid}>
              {ASI_TURLERI.map(tur => (
                <TouchableOpacity
                  key={tur}
                  style={[styles.asiTurButon, asiForm.asiTuru === tur && { backgroundColor: COLORS.info, borderColor: COLORS.info }]}
                  onPress={() => setAsiForm({ ...asiForm, asiTuru: tur })}
                >
                  <Text style={[styles.asiTurYazi, asiForm.asiTuru === tur && { color: '#fff' }]}>{tur}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormInput
              label="Tarih"
              placeholder="01.06.2026"
              value={asiForm.tarih}
              onChange={v => setAsiForm({ ...asiForm, tarih: v })}
            />
            <FormInput
              label="Not (Opsiyonel)"
              placeholder="Örn: Doktor Ahmet tarafından yapıldı"
              value={asiForm.not}
              onChange={v => setAsiForm({ ...asiForm, not: v })}
            />

            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: COLORS.info }]}
              onPress={handleAsiKaydet}
            >
              <Text style={styles.kaydetYazi}>AŞIYI KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* SAĞLIK MODAL */}
      <Modal visible={saglikModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Sağlık Sorunu Ekle</Text>
            <TouchableOpacity onPress={() => { setSaglikModal(false); setSaglikForm(BOŞ_SAGLIK); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>

            {/* Hayvan Seçimi */}
            <Text style={styles.formLabel}>Hayvan Seçin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {hayvanlar.map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.secimButon, saglikForm.hayvanId === h.id && { backgroundColor: COLORS.danger, borderColor: COLORS.danger }]}
                  onPress={() => setSaglikForm({ ...saglikForm, hayvanId: h.id })}
                >
                  <Text style={[styles.secimYazi, saglikForm.hayvanId === h.id && { color: '#fff' }]}>{h.isim}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Belirti Seçimi */}
            <Text style={styles.formLabel}>Belirti / Durum</Text>
            <View style={styles.belirti}>
              {SAGLIK_BELIRTILERI.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.belirtiButon, saglikForm.durum === b.id && { backgroundColor: COLORS.danger, borderColor: COLORS.danger }]}
                  onPress={() => setSaglikForm({ ...saglikForm, durum: b.id })}
                >
                  <MaterialCommunityIcons
                    name={b.icon}
                    size={16}
                    color={saglikForm.durum === b.id ? '#fff' : COLORS.danger}
                  />
                  <Text style={[styles.belirtiYazi, saglikForm.durum === b.id && { color: '#fff' }]}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormInput
              label="Not"
              placeholder="Örn: Hangi ilaç kullanıldı, veteriner çağrıldı mı?"
              value={saglikForm.not}
              onChange={v => setSaglikForm({ ...saglikForm, not: v })}
            />
            <FormInput
              label="Tarih"
              placeholder="01.06.2026"
              value={saglikForm.tarih}
              onChange={v => setSaglikForm({ ...saglikForm, tarih: v })}
            />

            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: COLORS.danger }]}
              onPress={handleSaglikKaydet}
            >
              <Text style={styles.kaydetYazi}>KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
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

function bugunTarih() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollIcerik: { padding: 12, paddingBottom: 40 },

  uyariBant: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.danger + '30',
  },
  uyariYazi: { fontSize: 13, fontWeight: '700', color: COLORS.danger },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 5,
  },
  tabYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textLight },
  tabRozet: {
    minWidth: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  tabRozetYazi: { fontSize: 10, fontWeight: '900', color: '#fff' },

  ekleButon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 12, gap: 6, marginBottom: 16,
  },
  ekleButonYazi: { fontSize: 14, fontWeight: '700', color: '#fff' },

  bolumBaslik: { fontSize: 14, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.3 },

  saglikKart: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  saglikIkon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saglikBilgi: { flex: 1 },
  saglikHayvan: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  saglikDurum: { fontSize: 13, fontWeight: '600', color: COLORS.danger, marginTop: 2 },
  saglikNot: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  saglikTarih: { fontSize: 11, color: COLORS.textLight, marginTop: 3 },
  cozButon: { padding: 4 },

  saglikliKutu: {
    alignItems: 'center', paddingVertical: 30,
    backgroundColor: COLORS.success + '10',
    borderRadius: 16, gap: 8,
  },
  saglikliIkon: { fontSize: 40 },
  saglikliYazi: { fontSize: 16, fontWeight: '700', color: COLORS.success },

  hayvanAsiKart: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  hayvanAsiUst: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10, gap: 10,
  },
  hayvanAsiIkon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  hayvanAsiIsim: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  asiSayiRozet: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  asiSayiYazi: { fontSize: 11, fontWeight: '700' },
  asiSatir: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, gap: 8,
  },
  asiTur: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  asiTarih: { fontSize: 12, color: COLORS.textSecondary },

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
  modalBaslik: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },

  secimButon: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginRight: 8,
    backgroundColor: COLORS.background,
  },
  secimYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  asiTurleriGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  asiTurButon: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  asiTurYazi: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },

  belirti: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  belirtiButon: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.danger + '60', backgroundColor: COLORS.background,
  },
  belirtiYazi: { fontSize: 12, fontWeight: '600', color: COLORS.danger },

  formGrup: { marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  formInput: {
    backgroundColor: COLORS.background, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },

  kaydetButon: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  kaydetYazi: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
