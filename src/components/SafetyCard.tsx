import React from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const TAUPE = '#A99985';
const UMBER = '#17130F';

// Shown once before the first practice (SessionSummary) and on demand from the practice controls.
export const SAFETY_SEEN_KEY = 'safety_card_seen';

const POINTS = [
  ['Find your edge', 'Go to the first point of real sensation, then back off a little. Around 60–70% is enough.'],
  ['Fine to feel', 'Tugging, a dull ache, pressure or slow heat. That is what yin works with.'],
  ['Come out if', 'You feel sharp, burning, electric or shooting pain, tingling or numbness, or you can\'t breathe easily. Never ignore tingling.'],
  ['Keep it low', 'If it hurts more than 3 out of 10, ease off or use a prop.'],
];

interface Props {
  visible: boolean;
  onClose: () => void;
  closeLabel?: string;
}

export const SafetyCard: React.FC<Props> = ({ visible, onClose, closeLabel = 'Back to the pose' }) => {
  const { isDark } = useTheme();
  const text = isDark ? '#EDE4D6' : UMBER;
  const muted = isDark ? '#A89C8C' : '#6B5E4F';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} accessibilityLabel="Close" />
      <View style={{ maxHeight: '85%', backgroundColor: isDark ? '#221D18' : '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }}>
          <Text accessibilityRole="header" style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 24, lineHeight: 32, color: text }}>
            Edge & pain
          </Text>
          {POINTS.map(([title, body]) => (
            <View key={title} style={{ gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: muted }}>{title}</Text>
              <Text style={{ fontSize: 16, lineHeight: 24, color: text }}>{body}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 13, lineHeight: 18, color: muted }}>
            This app is a timer, not medical advice, and it cannot see you or correct your form. If you are pregnant, injured or
            have a medical condition, check with a doctor or a qualified teacher before practising.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            style={{ height: 56, borderRadius: 9999, backgroundColor: TAUPE, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
          >
            <Text style={{ fontSize: 17, fontWeight: '500', color: UMBER }}>{closeLabel}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};
