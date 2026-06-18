import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import {
  getAmbarYemleri,
  ambarYemEkle,
  ambarYemSil,
  getAktifModul,
} from '../data/storage';

const AMBAR_RENK = '#8E5A2A';

const BOS_YEM = {
  ad: '',
  kategori: 'besi',
  miktarKg: '',
  toplamTutar: '',
  tarih: '',
  not: '',
};

const KATEGORILER = [
  { key: 'besi', label: 'Besi', icon: 'cow' },
  { key: 'sut', label: 'Süt/Sürü', icon: 'cup-water' },
  { key: 'kumes', label: 'Kümes', icon: 'egg' },
  { key: 'genel', label: 'Genel / Ortak', icon: 'barn' },
];

function bugunTarih() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${d.getFullYear()}`;
}

function paraFormat(deger) {
  const sayi = Number(deger || 0);
  return `${sayi.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} TL`;
}

function kgFormat(deger) {
  const sayi = Number(deger || 0);
  return `${sayi.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} kg`;
}

function kategoriBilgi(kategori) {
  return KATEGORILER.find((k) => k.key === kategori) || KATEGORILER[0];
}
function aktifModulKategorisi(modul) {
  if (modul === 'suru' || modul === 'sut') return 'sut';
  if (modul === 'kumes') return 'kumes';
  return 'besi';
}

export default function AmbarScreen() {
  const [yemler, setYemler] = useState([]);
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState({ ...BOS_YEM, tarih: bugunTarih() });
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const liste = await getAmbarYemleri();
    setYemler(liste || []);
  };

  useFocusEffect(
    useCallback(() => {
      veriYukle();
    }, [])
  );

  const onYenile = async () => {
    setYenileniyor(true);
    await veriYukle();
    setYenileniyor(false);
  };

  const toplamKg = yemler.reduce(
    (acc, yem) => acc + Number(yem.kalanKg || 0),
    0
  );

  const toplamDeger = yemler.reduce(
    (acc, yem) =>
      acc + Number(yem.kalanKg || 0) * Number(yem.kgMaliyet || 0),
    0
  );

  const yemKaydet = async () => {
    if (!form.ad || !form.miktarKg || !form.toplamTutar) {
      Alert.alert(
        'Eksik Bilgi',
        'Yem adı, miktar kg ve toplam tutar zorunludur.'
      );
      return;
    }

    const miktarKg = Number(form.miktarKg || 0);
    const toplamTutar = Number(form.toplamTutar || 0);

    if (miktarKg <= 0) {
      Alert.alert('Hatalı Miktar', 'Miktar 0’dan büyük olmalıdır.');
      return;
    }

    if (toplamTutar < 0) {
      Alert.alert('Hatalı Tutar', 'Toplam tutar negatif olamaz.');
      return;
    }

    const adKucuk = String(form.ad || '').toLocaleLowerCase('tr-TR');
const ortakUyariGerekli =
  form.kategori === 'genel' &&
  ['saman', 'silaj', 'yonca'].some((kelime) => adKucuk.includes(kelime));

if (ortakUyariGerekli) {
  Alert.alert(
    'Genel / Ortak Yem Uyarısı',
    'Bu ürün kümes tarafında da görünebilir. Devam etmek istiyor musunuz?',
    [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Devam Et',
        onPress: async () => {
          await ambarYemEkle({
            ...form,
            tarih: form.tarih || bugunTarih(),
          });
          setModalAcik(false);
          setForm({ ...BOS_YEM, tarih: bugunTarih() });
          veriYukle();
        },
      },
    ]
  );
  return;
}
    
    await ambarYemEkle({
      ...form,
      tarih: form.tarih || bugunTarih(),
    });

    setModalAcik(false);
    setForm({ ...BOS_YEM, tarih: bugunTarih() });
    veriYukle();
  };

  const yemSilOnay = (yem) => {
    Alert.alert(
      'Yem Silinsin mi?',
      `${yem.ad} ambar kaydından silinecek. Emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await ambarYemSil(yem.id);
            veriYukle();
          },
        },
      ]
    );
  };

  const yeniYemModalAc = async () => {
  const modul = await getAktifModul();
  const kategori = aktifModulKategorisi(modul);

  setForm({ ...BOS_YEM, kategori, tarih: bugunTarih() });
  setModalAcik(true);
};

  return (
    <View style={styles.container}>
      <HeaderBar title="Ambar" subtitle="Ortak yem stokları" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={
          <RefreshControl
            refreshing={yenileniyor}
            onRefresh={onYenile}
            tintColor={AMBAR_RENK}
          />
        }
      >
        <View style={styles.ozetSatir}>
          <View style={styles.ozetKart}>
            <MaterialCommunityIcons name="sack" size={26} color={AMBAR_RENK} />
            <Text style={styles.ozetBaslik}>Toplam Stok</Text>
            <Text style={styles.ozetDeger}>{kgFormat(toplamKg)}</Text>
          </View>

          <View style={styles.ozetKart}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={26}
              color={COLORS.success || '#2E7D32'}
            />
            <Text style={styles.ozetBaslik}>Stok Değeri</Text>
            <Text style={styles.ozetDeger}>{paraFormat(toplamDeger)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ekleButon}
          onPress={yeniYemModalAc}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
          <Text style={styles.ekleButonYazi}>Yem Ekle</Text>
        </TouchableOpacity>

        <View style={styles.bilgiKutu}>
          <MaterialCommunityIcons
            name="information-outline"
            size={22}
            color={AMBAR_RENK}
          />
          <Text style={styles.bilgiYazi}>
            Ambar ücretsizdir. Besi, süt ve kümes yemleri ortak stok olarak
            burada takip edilir.
          </Text>
        </View>

        <Text style={styles.bolumBaslik}>Yem Stokları</Text>

        {yemler.length === 0 ? (
          <View style={styles.bosKutu}>
            <MaterialCommunityIcons
              name="barn"
              size={48}
              color={COLORS.textSecondary || '#777'}
            />
            <Text style={styles.bosBaslik}>Ambarda yem yok</Text>
            <Text style={styles.bosYazi}>
              İlk yem alışını ekleyerek stok takibine başlayabilirsiniz.
            </Text>
          </View>
        ) : (
          yemler.map((yem) => {
            const kategori = kategoriBilgi(yem.kategori);
            const kalanDeger =
              Number(yem.kalanKg || 0) * Number(yem.kgMaliyet || 0);

            return (
              <View key={yem.id} style={styles.yemKart}>
                <View style={styles.yemUst}>
                  <View style={styles.yemSol}>
                    <View style={styles.yemIkon}>
                      <MaterialCommunityIcons
                        name={kategori.icon}
                        size={24}
                        color={AMBAR_RENK}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.yemAd}>{yem.ad}</Text>
                      <Text style={styles.yemAlt}>
                        {kategori.label} • {yem.tarih || 'Tarih yok'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.silButon}
                    onPress={() => yemSilOnay(yem)}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={21}
                      color={COLORS.danger || '#C62828'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.metrikSatir}>
                  <View style={styles.metrik}>
                    <Text style={styles.metrikBaslik}>Kalan</Text>
                    <Text style={styles.metrikDeger}>
                      {kgFormat(yem.kalanKg)}
                    </Text>
                  </View>

                  <View style={styles.metrik}>
                    <Text style={styles.metrikBaslik}>Kg Maliyet</Text>
                    <Text style={styles.metrikDeger}>
                      {paraFormat(yem.kgMaliyet)}
                    </Text>
                  </View>

                  <View style={styles.metrik}>
                    <Text style={styles.metrikBaslik}>Kalan Değer</Text>
                    <Text style={styles.metrikDeger}>
                      {paraFormat(kalanDeger)}
                    </Text>
                  </View>
                </View>

                {!!yem.not && <Text style={styles.notYazi}>Not: {yem.not}</Text>}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalAcik}
        animationType="slide"
        transparent
        onRequestClose={() => setModalAcik(false)}
      >
        <View style={styles.modalArka}>
          <View style={styles.modalKutu}>
            <View style={styles.modalBaslikSatir}>
              <Text style={styles.modalBaslik}>Yem Ekle</Text>

              <TouchableOpacity onPress={() => setModalAcik(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputEtiket}>Yem Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Süt yemi, arpa, tavuk yemi"
              value={form.ad}
              onChangeText={(v) => setForm({ ...form, ad: v })}
            />

            <Text style={styles.inputEtiket}>Kategori</Text>
            <View style={styles.kategoriSatir}>
              {KATEGORILER.map((kategori) => {
                const secili = form.kategori === kategori.key;

                return (
                  <TouchableOpacity
                    key={kategori.key}
                    style={[
                      styles.kategoriButon,
                      secili && styles.kategoriButonSecili,
                    ]}
                    onPress={() =>
                      setForm({ ...form, kategori: kategori.key })
                    }
                  >
                    <MaterialCommunityIcons
                      name={kategori.icon}
                      size={18}
                      color={secili ? '#fff' : AMBAR_RENK}
                    />
                    <Text
                      style={[
                        styles.kategoriYazi,
                        secili && styles.kategoriYaziSecili,
                      ]}
                    >
                      {kategori.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

              {form.kategori === 'genel' && (
                 <View style={styles.ortakUyariKutu}>
                 <MaterialCommunityIcons
                 name="alert-circle-outline"
                 size={18}
                 color={AMBAR_RENK}
               />
            <Text style={styles.ortakUyariYazi}>
                Bu ürün besi, süt/sürü ve kümes tarafında ortak görünür.
           </Text>
         </View>
          )}

            <Text style={styles.inputEtiket}>Miktar Kg</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 500"
              keyboardType="numeric"
              value={form.miktarKg}
              onChangeText={(v) => setForm({ ...form, miktarKg: v })}
            />

            <Text style={styles.inputEtiket}>Toplam Tutar TL</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 6500"
              keyboardType="numeric"
              value={form.toplamTutar}
              onChangeText={(v) => setForm({ ...form, toplamTutar: v })}
            />

            <Text style={styles.inputEtiket}>Tarih</Text>
            <TextInput
              style={styles.input}
              placeholder="gg.aa.yyyy"
              value={form.tarih}
              onChangeText={(v) => setForm({ ...form, tarih: v })}
            />

            <Text style={styles.inputEtiket}>Not</Text>
            <TextInput
              style={[styles.input, styles.notInput]}
              placeholder="İsteğe bağlı"
              value={form.not}
              multiline
              onChangeText={(v) => setForm({ ...form, not: v })}
            />

            <TouchableOpacity style={styles.kaydetButon} onPress={yemKaydet}>
              <Text style={styles.kaydetYazi}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F7F7F7',
  },
  scroll: {
    flex: 1,
  },
  scrollIcerik: {
    padding: 16,
    paddingBottom: 32,
  },
  ozetSatir: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  ozetKart: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
  },
  ozetBaslik: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textSecondary || '#777',
  },
  ozetDeger: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text || '#222',
  },
  ekleButon: {
    height: 52,
    borderRadius: 16,
    backgroundColor: AMBAR_RENK,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  ekleButonYazi: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  bilgiKutu: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF7EC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  bilgiYazi: {
    flex: 1,
    color: '#5D4037',
    fontSize: 13,
    lineHeight: 19,
  },
  bolumBaslik: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text || '#222',
    marginBottom: 10,
  },
  bosKutu: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    elevation: 1,
  },
  bosBaslik: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text || '#222',
  },
  bosYazi: {
    marginTop: 6,
    textAlign: 'center',
    color: COLORS.textSecondary || '#777',
    lineHeight: 20,
  },
  yemKart: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  yemUst: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yemSol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yemIkon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yemAd: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text || '#222',
  },
  yemAlt: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textSecondary || '#777',
  },
  silButon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrikSatir: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metrik: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 10,
  },
  metrikBaslik: {
    fontSize: 11,
    color: COLORS.textSecondary || '#777',
  },
  metrikDeger: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text || '#222',
  },
  notYazi: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textSecondary || '#777',
  },
  modalArka: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalKutu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '92%',
  },
  modalBaslikSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalBaslik: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text || '#222',
  },
  inputEtiket: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text || '#222',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.text || '#222',
  },
  notInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  kategoriSatir: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kategoriButon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: AMBAR_RENK,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  kategoriButonSecili: {
    backgroundColor: AMBAR_RENK,
  },
  kategoriYazi: {
    color: AMBAR_RENK,
    fontWeight: '700',
    fontSize: 13,
  },
  kategoriYaziSecili: {
    color: '#fff',
  },
  kaydetButon: {
    marginTop: 18,
    height: 52,
    borderRadius: 16,
    backgroundColor: AMBAR_RENK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaydetYazi: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  ortakUyariKutu: {
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',
  backgroundColor: '#FFF7EC',
  borderRadius: 12,
  padding: 10,
  marginTop: 10,
},
ortakUyariYazi: {
  flex: 1,
  color: '#5D4037',
  fontSize: 12,
  lineHeight: 17,
},
});
