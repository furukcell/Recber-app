// Reçber - Yem / Ambar Stok Ekranı
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import HeaderBar from '../components/HeaderBar';
import COLORS from '../theme/colors';
import { getAktifModul, getAmbarStokOzeti } from '../data/storage';

export default function YemScreen({ navigation }) {
  const [aktifModul, setModul] = useState('besi');
  const [ambarStok, setAmbarStok] = useState({
    yemler: [],
    toplamKg: 0,
    toplamDeger: 0,
  });
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = async () => {
    const modul = await getAktifModul();
    setModul(modul || 'besi');

    const stok = await getAmbarStokOzeti('besi');
    setAmbarStok(stok);
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

  const modulRenk = aktifModul === 'besi' ? COLORS.besi : COLORS.suru;

  const yemler = ambarStok.yemler || [];
  const toplamKg = Number(ambarStok.toplamKg || 0);
  const toplamDeger = Number(ambarStok.toplamDeger || 0);

  const kritikYemler = yemler.filter((yem) => {
    const miktarKg = Number(yem.miktarKg || 0);
    const kalanKg = Number(yem.kalanKg || 0);

    if (miktarKg <= 0) return false;

    const yuzde = (kalanKg / miktarKg) * 100;
    return yuzde <= 10;
  });

  const paraFormat = (deger) =>
    Number(deger || 0).toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const kgFormat = (deger) =>
    Number(deger || 0).toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const kategoriLabel = (kategori) => {
    if (kategori === 'besi') return 'Besi';
    if (kategori === 'sut') return 'Süt';
    if (kategori === 'kumes') return 'Kümes';
    return 'Genel';
  };

  const kategoriIcon = (kategori) => {
    if (kategori === 'besi') return 'cow';
    if (kategori === 'sut') return 'cup-water';
    if (kategori === 'kumes') return 'bird';
    return 'barn';
  };

  const ambarAc = () => {
    navigation.navigate('Ambar');
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        baslik="Yem & Stok"
        altBaslik="Besi yem stokları Ambar’dan alınır"
        modulRenk={modulRenk}
        sagIcon="barn"
        sagOnPress={ambarAc}
      />

      {kritikYemler.length > 0 && (
        <View style={styles.kritikBant}>
          <MaterialCommunityIcons
            name="alert"
            size={18}
            color={COLORS.danger}
          />
          <Text style={styles.kritikYazi}>
            {kritikYemler.map((yem) => yem.ad).join(', ')} stoğu kritik
            seviyede!
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        refreshControl={
          <RefreshControl
            refreshing={yenileniyor}
            onRefresh={onYenile}
            tintColor={modulRenk}
          />
        }
      >
        {/* Ambar Özet Kartları */}
        <View style={styles.ozetSatir}>
          <OzetMini
            ikon="sack"
            baslik="Kalan Yem"
            deger={`${kgFormat(toplamKg)} kg`}
            renk={modulRenk}
          />

          <OzetMini
            ikon="cash"
            baslik="Stok Değeri"
            deger={`${paraFormat(toplamDeger)} TL`}
            renk={COLORS.success}
          />

          <OzetMini
            ikon="package-variant"
            baslik="Yem Çeşidi"
            deger={`${yemler.length}`}
            renk={COLORS.accent}
          />
        </View>

        {/* Bilgi Kutusu */}
        <View style={styles.bilgiKutu}>
          <MaterialCommunityIcons
            name="information-outline"
            size={22}
            color={modulRenk}
          />
          <Text style={styles.bilgiYazi}>
            Yem ve maliyet girişi artık yalnızca Ambar’dan yapılır. Bu ekranda
            Ambar’daki Besi ve Genel kategorili yem stokları gösterilir.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.ambarButon, { backgroundColor: modulRenk }]}
          onPress={ambarAc}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="barn" size={22} color="#fff" />
          <Text style={styles.ambarButonYazi}>Ambar / Yem Stoklarına Git</Text>
        </TouchableOpacity>

        <Text style={styles.bolumBaslik}>Besi Yem Stokları</Text>

        {yemler.length === 0 ? (
          <BosDurum
            ikon="barley-off"
            mesaj="Ambarda besi veya genel yem kaydı yok"
            butonYazi="Ambar'a Yem Ekle"
            onPress={ambarAc}
            renk={modulRenk}
          />
        ) : (
          yemler.map((yem) => {
            const miktarKg = Number(yem.miktarKg || 0);
            const kalanKg = Number(yem.kalanKg || 0);
            const kgMaliyet = Number(yem.kgMaliyet || 0);
            const kalanDeger = kalanKg * kgMaliyet;
            const yuzde =
              miktarKg > 0 ? Math.round((kalanKg / miktarKg) * 100) : 0;

            return (
              <View key={yem.id} style={styles.yemKart}>
                <View style={styles.yemUst}>
                  <View style={styles.yemSol}>
                    <View
                      style={[
                        styles.yemIkon,
                        { backgroundColor: modulRenk + '18' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={kategoriIcon(yem.kategori)}
                        size={24}
                        color={modulRenk}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.yemAd}>{yem.ad}</Text>
                      <Text style={styles.yemAlt}>
                        {kategoriLabel(yem.kategori)} • {yem.tarih || 'Tarih yok'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.yuzdeKutu}>
                    <Text
                      style={[
                        styles.yuzdeYazi,
                        {
                          color:
                            yuzde <= 10
                              ? COLORS.danger
                              : yuzde <= 30
                              ? COLORS.warning
                              : COLORS.success,
                        },
                      ]}
                    >
                      %{yuzde}
                    </Text>
                  </View>
                </View>

                <View style={styles.barArka}>
                  <View
                    style={[
                      styles.barDolgu,
                      {
                        width: `${Math.min(yuzde, 100)}%`,
                        backgroundColor:
                          yuzde <= 10
                            ? COLORS.danger
                            : yuzde <= 30
                            ? COLORS.warning
                            : modulRenk,
                      },
                    ]}
                  />
                </View>

                <View style={styles.metrikSatir}>
                  <View style={styles.metrik}>
                    <Text style={styles.metrikBaslik}>Kalan</Text>
                    <Text style={styles.metrikDeger}>
                      {kgFormat(kalanKg)} kg
                    </Text>
                  </View>

                  <View style={styles.metrik}>
                    <Text style={styles.metrikBaslik}>Kg Maliyet</Text>
                    <Text style={styles.metrikDeger}>
                      {paraFormat(kgMaliyet)} TL
                    </Text>
                  </View>

                  <View style={styles.metrik}>
                    <Text style={styles.metrikBaslik}>Kalan Değer</Text>
                    <Text style={styles.metrikDeger}>
                      {paraFormat(kalanDeger)} TL
                    </Text>
                  </View>
                </View>

                {!!yem.not && <Text style={styles.notYazi}>Not: {yem.not}</Text>}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ─── ALT COMPONENTLER ─────────────────────────────────────────────

function OzetMini({ ikon, baslik, deger, renk }) {
  return (
    <View style={styles.ozetMini}>
      <MaterialCommunityIcons name={ikon} size={20} color={renk} />
      <Text style={[styles.ozetDeger, { color: renk }]}>{deger}</Text>
      <Text style={styles.ozetBaslik}>{baslik}</Text>
    </View>
  );
}

function BosDurum({ ikon, mesaj, butonYazi, onPress, renk }) {
  return (
    <View style={styles.bosDurum}>
      <MaterialCommunityIcons name={ikon} size={50} color={COLORS.textLight} />
      <Text style={styles.bosYazi}>{mesaj}</Text>
      <TouchableOpacity
        style={[styles.bosButon, { backgroundColor: renk }]}
        onPress={onPress}
      >
        <Text style={styles.bosButonYazi}>{butonYazi}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollIcerik: {
    padding: 12,
    paddingBottom: 32,
  },

  kritikBant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.danger + '30',
  },
  kritikYazi: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
    flex: 1,
  },

  ozetSatir: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ozetMini: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  ozetDeger: {
    fontSize: 15,
    fontWeight: '900',
  },
  ozetBaslik: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  bilgiKutu: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bilgiYazi: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  ambarButon: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ambarButonYazi: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  bolumBaslik: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  yemKart: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  yemAd: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  yemAlt: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  yuzdeKutu: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  yuzdeYazi: {
    fontSize: 15,
    fontWeight: '900',
  },
  barArka: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 12,
  },
  barDolgu: {
    height: '100%',
    borderRadius: 999,
  },
  metrikSatir: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  metrik: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 9,
  },
  metrikBaslik: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  metrikDeger: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  notYazi: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.textLight,
  },

  bosDurum: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  bosYazi: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  bosButon: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  bosButonYazi: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
