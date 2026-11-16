import React from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings, Settings } from '../hooks/useSettings';
import { INTERMISSION_OPTIONS } from '../components/IntermissionModal';

const REBOUND_STEPS = INTERMISSION_OPTIONS.map((option) => option.duration);

const CLAY = '#C08A6A';
const TAUPE = '#A99985';
const UMBER = '#17130F';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark, toggleTheme } = useTheme();
  const [settings, update] = useSettings();

  const sheet = isDark ? '#221D18' : '#FFFFFF';
  const text = isDark ? '#EDE4D6' : UMBER;
  const muted = isDark ? '#A89C8C' : '#6B5E4F';
  const line = isDark ? '#3A3128' : '#E3D9CB';

  const toggles: [keyof Settings, string, string][] = [
    ['haptics', 'Haptics', 'A soft tap when you switch sides'],
    ['keepAwake', 'Keep screen on', 'Off: bells only, screen sleeps'],
  ];

  const stepRebound = (delta: number) => {
    const current = Math.max(0, REBOUND_STEPS.indexOf(settings.reboundSeconds));
    const next = Math.min(REBOUND_STEPS.length - 1, Math.max(0, current + delta));
    update({ reboundSeconds: REBOUND_STEPS[next] });
  };

  const stepper = (label: string, icon: '−' | '+', delta: number) => (
    <TouchableOpacity
      onPress={() => stepRebound(delta)}
      accessibilityLabel={label}
      style={{ width: 44, height: 44, borderRadius: 9999, borderWidth: 1, borderColor: line, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: text, fontSize: 18 }}>{icon}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0E0B08' : '#EDE4D6' }}>
      <Pressable style={{ height: 64 }} onPress={() => navigation.goBack()} accessibilityLabel="Close settings" />
      <ScrollView
        style={{ flex: 1, backgroundColor: sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        contentContainerStyle={{ padding: 24, paddingTop: 12, gap: 20, flexGrow: 1 }}
      >
        <View style={{ width: 40, height: 4, borderRadius: 9999, backgroundColor: line, alignSelf: 'center' }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text accessibilityRole="header" style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 24, lineHeight: 32, color: text }}>
            Settings
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Close" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={22} color={text} />
          </TouchableOpacity>
        </View>

        <View>
          {toggles.map(([key, label, note]) => {
            const on = settings[key] as boolean;
            return (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 56, borderBottomWidth: 1, borderBottomColor: line }}>
                <View style={{ flexShrink: 1 }}>
                  <Text style={{ fontSize: 16, lineHeight: 24, color: text }}>{label}</Text>
                  <Text style={{ fontSize: 13, lineHeight: 18, color: muted }}>{note}</Text>
                </View>
                <Pressable
                  onPress={() => update({ [key]: !on })}
                  accessibilityRole="switch"
                  accessibilityLabel={label}
                  accessibilityState={{ checked: on }}
                  style={{ width: 52, height: 32, borderRadius: 9999, padding: 3, flexDirection: 'row', justifyContent: on ? 'flex-end' : 'flex-start', backgroundColor: on ? CLAY : line }}
                >
                  <View style={{ width: 26, height: 26, borderRadius: 9999, backgroundColor: on ? UMBER : muted }} />
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontSize: 16, lineHeight: 24, color: text }}>Default rebound</Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: muted }}>Rest between poses in new sessions</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {stepper('Shorter', '−', -1)}
            <Text style={{ width: 48, textAlign: 'center', fontSize: 16, color: text, fontVariant: ['tabular-nums'] }}>
              {settings.reboundSeconds} s
            </Text>
            {stepper('Longer', '+', 1)}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, lineHeight: 24, color: text }}>Theme</Text>
          <View style={{ flexDirection: 'row', padding: 4, borderRadius: 9999, backgroundColor: isDark ? UMBER : '#F5F1ED' }} accessibilityRole="radiogroup">
            {(['Dark', 'Light'] as const).map((label) => {
              const on = (label === 'Dark') === isDark;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => !on && toggleTheme()}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  style={{ height: 36, paddingHorizontal: 16, borderRadius: 9999, justifyContent: 'center', backgroundColor: on ? CLAY : 'transparent' }}
                >
                  <Text style={{ fontSize: 15, color: on ? UMBER : text }}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Contact')}
          style={{ marginTop: 'auto', minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={{ fontSize: 16, color: TAUPE }}>Send feedback</Text>
          <Ionicons name="chevron-forward" size={18} color={TAUPE} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
