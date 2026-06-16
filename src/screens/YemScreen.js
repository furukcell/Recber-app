// Reçber - Yem Ekranı
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import StokBar from '../components/StokBar';
import COLORS from '../theme/colors';
import { getYemAlimlar, yemAlimEkle, yemAlimSil, getStokDurum, getAktifModul } from '../data/storage';
import { YEM_TIPLERI } from '../data/constants';

const BOŞ_FORM = { tip: 'arpa', miktar: '', fiyat: '', tarih: bugunTarih(), not: '' };

export default function YemScreen() {
  const [aktifModul, setModul] = useState('besi');
  const [alimlar, setAlimlar] = useState([]);
  const [stoklar, setStoklar] = useState([]);
  const [ekleModal, setEkleModal] = useState(false);
  const [form, setForm] = useState(BOŞ_FORM);
  const [aktifTab, setAktifTab] = useState('stok');
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul);
    const a = await getYemAlimlar();
    setAlimlar(a);
    const s = await getStokDurum();
    setStoklar(s);
  };

  useFocusEffect(useCallback(() => { veriYukle(); }, []));

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

  // Toplam harcama sadece alım kayıtlarından (anlamlı)
  const toplamHarcama = alimlar.reduce((acc, a) => acc + parseFloat(a.fiyat || 0), 0);
  const toplamKg = alimlar.reduce((acc, a) => acc + parseFloat(a.miktar || 0), 0);

  // Kritik stok: alım yapılmış ama %10 veya altında kalanlar
  const kritikStok = stoklar.filter(s => s.toplamAlinan > 0 && s.yuzde <= 10);

  // Alım yapılmadan yem verilmiş tipler — uyarı göster
  const kayitsizKullanim = stoklar.filter(s => s.kayitsizKullanim);

  const handleEkle = async () => {
    if (!form.miktar || !form.fiyat) {
      Alert.alert('Eksik Bilgi', 'Miktar ve fiyat zorunludur.');
      return;
    }
    await yemAlimEkle(form);
    setEkleModal(false);
    setForm(BOŞ_FORM);
    veriYukle();
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Yem & Stok"
        altBaslik={`${alimlar.length} alım kaydı`}
        modulRenk={modulRenk}
        sagIcon="plus-circle"
        sagOnPress={() => setEkleModal(true)}
      />

      {/* Kritik Stok Uyarısı */}
      {kritikStok.length > 0 && (
        <View style={styles.kritikBant}>
          <MaterialCommunityIcons name="alert" size={18} color={COLORS.danger} />
          <Text style={styles.kritikYazi}>
            {kritikStok.map(s => {
              const bilgi = YEM_TIPLERI.find(y => y.id === s.tip);
              return bilgi?.label || s.tip;
            }).join(', ')} stoğu kritik seviyede!
          </Text>
        </View>
      )}

      {/* Kayıtsız Kullanım Uyarısı */}
      {kayitsizKullanim.length > 0 && (
        <View style={[styles.kritikBant, { backgroundColor: COLORS.warning + '20', borderBottomColor: COLORS.warning + '40' }]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.warning} />
          <Text style={[styles.kritikYazi, { color: COLORS.warning }]}>
            {kayitsizKullanim.map(s => {
              const bilgi = YEM_TIPLERI.find(y => y.id === s.tip);
              return bilgi?.label || s.tip;
            }).join(', ')} için alım kaydı yok ama tartımda kullanım var. Alım girmeyi unutmadın mı?
          </Text>
        </View>
      )}

      {/* Özet Kartlar */}
      <View style={styles.ozetSatir}>
        <OzetMini
          ikon="cash"
          baslik="Toplam Harcama"
          deger={`${Math.round(toplamHarcama).toLocaleString('tr-TR')} ₺`}
          renk={modulRenk}
        />
        <OzetMini
          ikon="weight"
          baslik="Toplam Alınan"
          deger={`${Math.round(toplamKg).toLocaleString('tr-TR')} kg`}
          renk={COLORS.accent}
        />
        <OzetMini
          ikon="package-variant"
          baslik="Stokta"
          deger={`${stoklar
            .filter(s => s.toplamAlinan > 0)
            .reduce((acc, s) => acc + s.kalan, 0)
            .toLocaleString('tr-TR')} kg`}
          renk={COLORS.success}
        />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'stok', label: 'Stok Durumu', ikon: 'warehouse' },
          { key: 'gecmis', label: 'Alım Geçmişi', ikon: 'history' },
        ].map(t => (
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onYenile} tintColor={modulRenk} />}
      >
        {/* STOK TAB */}
        {aktifTab === 'stok' && (
          <View>
            {stoklar.filter(s => s.toplamAlinan > 0).length === 0 ? (
              <BosDurum
                ikon="barley-off"
                mesaj="Henüz yem alımı yapılmamış"
                butonYazi="Yem Alımı Ekle"
                onPress={() => setEkleModal(true)}
                renk={modulRenk}
              />
            ) : (
              stoklar
                .filter(s => s.toplamAlinan > 0)
                .sort((a, b) => a.yuzde - b.yuzde)
                .map(s => {
                  const bilgi = YEM_TIPLERI.find(y => y.id === s.tip);
                  return (
                    <View key={s.tip} style={styles.stokKart}>
                      <StokBar stok={s} modulRenk={modulRenk} />
                      {/* Tip bazında kg başına maliyet */}
                      {s.kgBasinaMaliyet && (
                        <View style={styles.stokMaliyetSatir}>
                          <MaterialCommunityIcons name="calculator-variant-outline" size={13} color={COLORS.textLight} />
                          <Text style={styles.stokMaliyetYazi}>
                            {bilgi?.label || s.tip} için ortalama{' '}
                            <Text style={{ fontWeight: '800', color: COLORS.textSecondary }}>
                              {s.kgBasinaMaliyet} TL/kg
                            </Text>
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
            )}
          </View>
        )}

        {/* GEÇMİŞ TAB */}
        {aktifTab === 'gecmis' && (
          <View>
            {alimlar.length === 0 ? (
              <BosDurum
                ikon="history"
                mesaj="Henüz alım kaydı yok"
                butonYazi="İlk Alımı Ekle"
                onPress={() => setEkleModal(true)}
                renk={modulRenk}
              />
            ) : (
              alimlar.map(a => {
                const bilgi = YEM_TIPLERI.find(y => y.id === a.tip);
                const miktarSayi = parseFloat(a.miktar || 0);
                const fiyatSayi = parseFloat(a.fiyat || 0);
                const kgFiyat = miktarSayi > 0 ? (fiyatSayi / miktarSayi).toFixed(2) : null;

                return (
                  <View key={a.id} style={styles.alimKart}>
                    <View style={[styles.alimIkon, { backgroundColor: (bilgi?.renk || modulRenk) + '20' }]}>
                      <MaterialCommunityIcons
                        name={bilgi?.icon || 'barley'}
                        size={22}
                        color={bilgi?.renk || modulRenk}
                      />
                    </View>
                    <View style={styles.alimBilgi}>
                      <Text style={styles.alimTip}>{bilgi?.label || a.tip}</Text>
                      <Text style={styles.alimAlt}>
                        {a.tarih} • {miktarSayi.toLocaleString('tr-TR')} kg
                      </Text>
                      {kgFiyat && (
                        <Text style={styles.alimKgDetay}>
                          {kgFiyat} TL/kg
                        </Text>
                      )}
                      {a.not ? <Text style={styles.alimNot}>{a.not}</Text> : null}
                    </View>
                    <View style={styles.alimFiyatKutu}>
                      <Text style={[styles.alimFiyat, { color: modulRenk }]}>
                        {fiyatSayi.toLocaleString('tr-TR')} ₺
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Kaydı Sil',
                          `${bilgi?.label || a.tip} — ${miktarSayi} kg alım kaydı silinecek.\n\nBu işlem stok miktarını da etkiler. Emin misiniz?`,
                          [
                            { text: 'İptal', style: 'cancel' },
                            {
                              text: 'Evet, Sil',
                              style: 'destructive',
                              onPress: async () => {
                                await yemAlimSil(a.id);
                                veriYukle();
                              },
                            },
                          ]
                        );
                      }}
                      style={styles.silButon}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: modulRenk }]}
        onPress={() => setEkleModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* YEM ALIM MODAL */}
      <Modal visible={ekleModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalUst}>
            <Text style={styles.modalBaslik}>Yeni Yem Alımı</Text>
            <TouchableOpacity onPress={() => { setEkleModal(false); setForm(BOŞ_FORM); }}>
              <MaterialCommunityIcons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }}>
            {/* Yem Tipi Seçimi */}
            <Text style={styles.formLabel}>Yem Tipi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {YEM_TIPLERI.map(y => (
                <TouchableOpacity
                  key={y.id}
                  style={[
                    styles.tipButon,
                    form.tip === y.id && { backgroundColor: y.renk, borderColor: y.renk }
                  ]}
                  onPress={() => setForm({ ...form, tip: y.id })}
                >
                  <MaterialCommunityIcons
                    name={y.icon}
                    size={20}
                    color={form.tip === y.id ? '#fff' : y.renk}
                  />
                  <Text style={[styles.tipButonYazi, form.tip === y.id && { color: '#fff' }]}>
                    {y.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FormInput
              label="Miktar (kg) *"
              placeholder="Örn: 500"
              value={form.miktar}
              onChange={v => setForm({ ...form, miktar: v })}
              klavye="numeric"
            />
            <FormInput
              label="Toplam Fiyat (TL) *"
              placeholder="Örn: 3500"
              value={form.fiyat}
              onChange={v => setForm({ ...form, fiyat: v })}
              klavye="numeric"
            />
            <FormInput
              label="Tarih"
              placeholder="01.06.2026"
              value={form.tarih}
              onChange={v => setForm({ ...form, tarih: v })}
            />
            <FormInput
              label="Not (Opsiyonel)"
              placeholder="Örn: Milas Kooperatifinden"
              value={form.not}
              onChange={v => setForm({ ...form, not: v })}
            />

            {/* Kg başına maliyet önizleme */}
            {form.miktar && form.fiyat && parseFloat(form.miktar) > 0 ? (
              <View style={[styles.onizlemeKutu, { backgroundColor: modulRenk + '15' }]}>
                <Text style={[styles.onizlemeYazi, { color: modulRenk }]}>
                  kg başına ≈ {(parseFloat(form.fiyat) / parseFloat(form.miktar)).toFixed(2)} TL
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.kaydetButon, { backgroundColor: modulRenk }]}
              onPress={handleEkle}
            >
              <Text style={styles.kaydetYazi}>ALIMI KAYDET</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function OzetMini({ ikon, baslik, deger, renk }) {
  return (
    <View style={styles.ozetMini}>
      <MaterialCommunityIcons name={ikon} size={18} color={renk} />
      <Text style={[styles.ozetDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.ozetBaslik}>{baslik}</Text>
    </View>
  );
}

function BosDurum({ ikon, mesaj, butonYazi, onPress, renk }) {
  return (
    <View style={styles.bosDurum}>
      <MaterialCommunityIcons name={ikon} size={48} color={COLORS.textLight} />
      <Text style={styles.bosYazi}>{mesaj}</Text>
      <TouchableOpacity style={[styles.bosButon, { backgroundColor: renk }]} onPress={onPress}>
        <Text style={styles.bosButonYazi}>{butonYazi}</Text>
      </TouchableOpacity>
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
  scrollIcerik: { padding: 12, paddingBottom: 90 },

  kritikBant: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.danger + '30',
  },
  kritikYazi: { fontSize: 13, fontWeight: '600', color: COLORS.danger, flex: 1 },

  ozetSatir: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ozetMini: { flex: 1, alignItems: 'center', gap: 4 },
  ozetDeger: { fontSize: 15, fontWeight: '900' },
  ozetBaslik: { fontSize: 10, color: COLORS.textLight, textAlign: 'center' },

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

  // Stok kart sarmalayıcı (StokBar + maliyet satırı)
  stokKart: {
    marginBottom: 4,
  },
  stokMaliyetSatir: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 4, paddingBottom: 10,
  },
  stokMaliyetYazi: { fontSize: 12, color: COLORS.textLight },

  alimKart: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 2,
  },
  alimIkon: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  alimBilgi: { flex: 1 },
  alimTip: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  alimAlt: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  alimKgDetay: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  alimNot: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  alimFiyatKutu: { alignItems: 'flex-end' },
  alimFiyat: { fontSize: 15, fontWeight: '900' },
  silButon: { padding: 6 },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },

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

  tipButon: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.border, marginRight: 8,
    backgroundColor: COLORS.background,
  },
  tipButonYazi: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  onizlemeKutu: { borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12 },
  onizlemeYazi: { fontSize: 14, fontWeight: '700' },

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

  kaydetButon: {
    borderRadius: 16, padding: 16, alignItems: 'center',
    marginTop: 10, marginBottom: 30,
  },
  kaydetYazi: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
