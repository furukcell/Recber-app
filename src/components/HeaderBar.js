// Reçber - HeaderBar Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../theme/colors';

export default function HeaderBar({ baslik, altBaslik, modulRenk, sagIcon, sagOnPress, geriOnPress }) {
  const renk = modulRenk || COLORS.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: renk }]}>
      <View style={styles.icerik}>
        {/* Sol: Geri veya Logo */}
        <TouchableOpacity
          style={styles.solButon}
          onPress={geriOnPress}
          disabled={!geriOnPress}
        >
          {geriOnPress ? (
            <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
          ) : (
            <Text style={styles.logo}>🐄</Text>
          )}
        </TouchableOpacity>

        {/* Orta: Başlık */}
        <View style={styles.ortaKisim}>
          <Text style={styles.baslik} numberOfLines={1}>{baslik}</Text>
          {altBaslik ? (
            <Text style={styles.altBaslik} numberOfLines={1}>{altBaslik}</Text>
          ) : null}
        </View>

        {/* Sağ: Aksiyon butonu */}
        <TouchableOpacity
          style={styles.sagButon}
          onPress={sagOnPress}
          disabled={!sagOnPress}
        >
          {sagIcon ? (
            <MaterialCommunityIcons name={sagIcon} size={26} color="#fff" />
          ) : (
            <View style={styles.bos} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
  },
  icerik: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  solButon: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 26,
  },
  ortaKisim: {
    flex: 1,
    alignItems: 'center',
  },
  baslik: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  altBaslik: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  sagButon: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bos: {
    width: 26,
  },
});
