// Reçber - Ana Navigation
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import HayvanlarScreen from './src/screens/HayvanlarScreen';
import HayvanDetayScreen from './src/screens/HayvanDetayScreen';
import YemScreen from './src/screens/YemScreen';
import VeterinerScreen from './src/screens/VeterinerScreen';
import RaporScreen from './src/screens/RaporScreen';
import AyarlarScreen from './src/screens/AyarlarScreen';
import SuruScreen from './src/screens/SuruScreen';
import KumesScreen from './src/screens/KumesScreen';
import HakkimizdaScreen from './src/screens/HakkimizdaScreen';
import KvkkEkrani from './src/screens/KvkkEkrani';
import SuruRaporScreen from './src/screens/SuruRaporScreen';

// Theme
import COLORS from './src/theme/colors';

// Storage
import { getAktifModul, setAktifModul } from './src/data/storage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const KUMES_RENK = '#A0522D';

// ─── HAYVANLAR STACK ──────────────────────────────────────────────
function HayvanlarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HayvanlarListe" component={HayvanlarScreen} />
      <Stack.Screen name="HayvanDetay" component={HayvanDetayScreen} />
    </Stack.Navigator>
  );
}

// ─── BOTTOM TAB NAVIGATOR ─────────────────────────────────────────
function MainTabs({ aktifModul, onModulDegis }) {
  const modulRenk =
    aktifModul === 'besi' ? COLORS.besi :
    aktifModul === 'suru' ? COLORS.suru :
    KUMES_RENK;

 const ikonlar = {
  'Ana Sayfa': 'view-dashboard-outline',
  'Hayvanlar': 'cow',
  'Sürü': 'cow',
  'Süt Rapor': 'chart-bar',
  'Yem': 'barley',
  'Veteriner': 'medical-bag',
  'Rapor': 'chart-line',
  'Ayarlar': 'cog-outline',
  'Kümes': 'bird',
};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: modulRenk,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={ikonlar[route.name] || 'circle'}
            size={24}
            color={color}
          />
        ),
      })}
    >
      {aktifModul === 'kumes' ? (
  <>
    <Tab.Screen name="Kümes" component={KumesScreen} />

    <Tab.Screen
      name="Ayarlar"
      children={(props) => (
        <AyarlarScreen
          {...props}
          onModulDegis={onModulDegis}
        />
      )}
    />
  </>
) : aktifModul === 'suru' ? (
  <>
   <Tab.Screen name="Sürü" component={SuruScreen} />

     <Tab.Screen name="Süt Rapor" component={SuruRaporScreen} />

     <Tab.Screen
     name="Ayarlar"
     children={(props) => (
     <AyarlarScreen
      {...props}
      onModulDegis={onModulDegis}
        />
      )}
     />
  </>
) : (
  <>
    <Tab.Screen
      name="Ana Sayfa"
      component={HomeScreen}
      initialParams={{ aktifModul }}
    />

    <Tab.Screen
      name="Hayvanlar"
      component={HayvanlarStack}
    />

    <Tab.Screen name="Yem" component={YemScreen} />
    <Tab.Screen name="Veteriner" component={VeterinerScreen} />
    <Tab.Screen name="Rapor" component={RaporScreen} />

    <Tab.Screen
      name="Ayarlar"
      children={(props) => (
        <AyarlarScreen
          {...props}
          onModulDegis={onModulDegis}
        />
      )}
    />
  </>
)}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

// ─── MODÜL SEÇİM EKRANI ───────────────────────────────────────────
function ModulSecimEkrani({ onSecim }) {
  return (
    <SafeAreaView style={styles.modulContainer}>
      {/* Logo & Başlık */}
      <View style={styles.modulUst}>
        <Text style={styles.modulLogo}>🐄</Text>
        <Text style={styles.modulBaslik}>Reçber</Text>
        <Text style={styles.modulAlt}>Çiftlik Yönetim Uygulaması</Text>
      </View>

      <Text style={styles.modulSoru}>Hangi bölümle devam etmek istersiniz?</Text>

      {/* Besi Kartı */}
      <TouchableOpacity
        style={[styles.modulKart, { borderColor: COLORS.besi }]}
        onPress={() => onSecim('besi')}
        activeOpacity={0.85}
      >
        <View style={[styles.modulIkon, { backgroundColor: COLORS.besi }]}>
          <MaterialCommunityIcons name="cow" size={36} color="#fff" />
        </View>
        <View style={styles.modulBilgi}>
          <Text style={[styles.modulKartBaslik, { color: COLORS.besi }]}>Besi</Text>
          <Text style={styles.modulKartAlt}>Dana & Boğa Besi Takibi</Text>
          <Text style={styles.modulKartDetay}>
            Kilo takibi • Yem maliyeti • Satış kararı
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.besi} />
      </TouchableOpacity>

      {/* Sürü Kartı */}
      <TouchableOpacity
        style={[styles.modulKart, { borderColor: COLORS.suru }]}
        onPress={() => onSecim('suru')}
        activeOpacity={0.85}
      >
        <View style={[styles.modulIkon, { backgroundColor: COLORS.suru }]}>
          <MaterialCommunityIcons name="cow" size={36} color="#fff" />
        </View>
        <View style={styles.modulBilgi}>
          <Text style={[styles.modulKartBaslik, { color: COLORS.suru }]}>Sürü</Text>
          <Text style={styles.modulKartAlt}>Süt İneği & Laktasyon Takibi</Text>
          <Text style={styles.modulKartDetay}>
            Süt verimi • Laktasyon • Meme sağlığı
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.suru} />
      </TouchableOpacity>

      {/* Kümes Kartı */}
      <TouchableOpacity
        style={[styles.modulKart, { borderColor: KUMES_RENK }]}
        onPress={() => onSecim('kumes')}
        activeOpacity={0.85}
      >
        <View style={[styles.modulIkon, { backgroundColor: KUMES_RENK }]}>
          <MaterialCommunityIcons name="bird" size={36} color="#fff" />
        </View>
        <View style={styles.modulBilgi}>
          <Text style={[styles.modulKartBaslik, { color: KUMES_RENK }]}>Kümes</Text>
          <Text style={styles.modulKartAlt}>Tavuk & Yumurta Takibi</Text>
          <Text style={styles.modulKartDetay}>
            Yumurta verimi • Yem stoku • Satış geliri
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={28} color={KUMES_RENK} />
      </TouchableOpacity>

      <Text style={styles.modulNot}>
        İstediğiniz zaman ayarlardan modül değiştirebilirsiniz.
      </Text>
    </SafeAreaView>
  );
}

// ─── ANA APP ──────────────────────────────────────────────────────
export default function App() {
  const [aktifModul, setModul] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const modulYukle = async () => {
      const kayitliModul = await getAktifModul();
      // İlk kurulumda null döner, modül seçim ekranı gösterilir
      if (kayitliModul && kayitliModul !== 'ilkKurum') {
        setModul(kayitliModul);
      }
      setYukleniyor(false);
    };
    modulYukle();
  }, []);

  const handleModulSecim = async (modul) => {
    await setAktifModul(modul);
    setModul(modul);
  };

  if (yukleniyor) {
    return (
      <View style={styles.yuklemeEkrani}>
        <Text style={styles.yuklemeText}>🐄</Text>
        <Text style={styles.yuklemeAlt}>Reçber</Text>
      </View>
    );
  }

 return (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!aktifModul ? (
        <Stack.Screen name="ModulSecim">
          {() => <ModulSecimEkrani onSecim={handleModulSecim} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="MainTabs">
            {() => (
              <MainTabs
                aktifModul={aktifModul}
                onModulDegis={handleModulSecim}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
           name="Hakkimizda"
           component={HakkimizdaScreen}
          />
           <Stack.Screen
             name="Kvkk"
             component={KvkkEkrani}
          />
        </>
      )}
    </Stack.Navigator>
  </NavigationContainer>
);
}

// ─── STİLLER ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Yükleme
  yuklemeEkrani: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yuklemeText: {
    fontSize: 64,
    marginBottom: 10,
  },
  yuklemeAlt: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },

  // Modül Seçim
  modulContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  modulUst: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modulLogo: {
    fontSize: 64,
    marginBottom: 10,
  },
  modulBaslik: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  modulAlt: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  modulSoru: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 18,
  },
  modulKart: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modulIkon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modulBilgi: {
    flex: 1,
  },
  modulKartBaslik: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  modulKartAlt: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  modulKartDetay: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  modulNot: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
});
