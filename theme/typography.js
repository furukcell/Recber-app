// Reçber - Tipografi
import { StyleSheet } from 'react-native';
import COLORS from './colors';

const TYPOGRAPHY = StyleSheet.create({
  // Başlıklar
  h1: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  h4: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Gövde Metinleri
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Etiket & Yardımcı
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textLight,
  },

  // Buton Metinleri
  buttonLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },

  // Sayısal Değerler (kilo, fiyat vb.)
  statLarge: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statMedium: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

export default TYPOGRAPHY;
