import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { H1, H2, BodyText, BodyTextSmall } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export const ContactScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundColor = isDark ? '#1A1A1A' : '#F5F1ED';
  const surfaceColor = isDark ? '#2D2D2D' : '#FFFFFF';
  const textColor = isDark ? '#E8E3D8' : '#1C1C1C';
  const placeholderColor = isDark ? '#A0A0A0' : '#6B7280';
  const borderColor = isDark ? '#404040' : '#E5E7EB';

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - in a real app, you'd send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Message Sent!',
        'Thank you for your message. We\'ll get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setErrors({});
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <BackButton onPress={() => navigation.goBack()} />
          <H1 className="text-h1" style={{ color: textColor }}>
            Contact Us
          </H1>
          <View className="w-8" />
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Introduction */}
          <View className="mb-8">
            <BodyText style={{ color: textColor, lineHeight: 24 }}>
              We&apos;d love to hear from you! Whether you have questions about the app,
              feedback, or need support with your yoga practice, we&apos;re here to help.
            </BodyText>
          </View>

          {/* Form */}
          <View
            className="rounded-2xl p-6 mb-8"
            style={{ backgroundColor: surfaceColor }}
          >
            {/* Name Field */}
            <View className="mb-6">
              <BodyText className="mb-2 font-ubuntu-medium" style={{ color: textColor }}>
                Name *
              </BodyText>
              <TextInput
                className="border rounded-xl px-4 py-3 font-ubuntu text-body"
                style={{
                  borderColor: errors.name ? '#EF4444' : borderColor,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                }}
                placeholder="Your full name"
                placeholderTextColor={placeholderColor}
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.name && (
                <BodyTextSmall className="mt-1" style={{ color: '#EF4444' }}>
                  {errors.name}
                </BodyTextSmall>
              )}
            </View>

            {/* Email Field */}
            <View className="mb-6">
              <BodyText className="mb-2 font-ubuntu-medium" style={{ color: textColor }}>
                Email *
              </BodyText>
              <TextInput
                className="border rounded-xl px-4 py-3 font-ubuntu text-body"
                style={{
                  borderColor: errors.email ? '#EF4444' : borderColor,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                }}
                placeholder="your.email@example.com"
                placeholderTextColor={placeholderColor}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              {errors.email && (
                <BodyTextSmall className="mt-1" style={{ color: '#EF4444' }}>
                  {errors.email}
                </BodyTextSmall>
              )}
            </View>

            {/* Subject Field */}
            <View className="mb-6">
              <BodyText className="mb-2 font-ubuntu-medium" style={{ color: textColor }}>
                Subject *
              </BodyText>
              <TextInput
                className="border rounded-xl px-4 py-3 font-ubuntu text-body"
                style={{
                  borderColor: errors.subject ? '#EF4444' : borderColor,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                }}
                placeholder="What's this about?"
                placeholderTextColor={placeholderColor}
                value={formData.subject}
                onChangeText={(text) => updateField('subject', text)}
                autoCapitalize="sentences"
                returnKeyType="next"
              />
              {errors.subject && (
                <BodyTextSmall className="mt-1" style={{ color: '#EF4444' }}>
                  {errors.subject}
                </BodyTextSmall>
              )}
            </View>

            {/* Message Field */}
            <View className="mb-6">
              <BodyText className="mb-2 font-ubuntu-medium" style={{ color: textColor }}>
                Message *
              </BodyText>
              <TextInput
                className="border rounded-xl px-4 py-3 font-ubuntu text-body"
                style={{
                  borderColor: errors.message ? '#EF4444' : borderColor,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  color: textColor,
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
                placeholder="Tell us more about your question or feedback..."
                placeholderTextColor={placeholderColor}
                value={formData.message}
                onChangeText={(text) => updateField('message', text)}
                multiline
                numberOfLines={6}
                autoCapitalize="sentences"
                returnKeyType="default"
              />
              {errors.message && (
                <BodyTextSmall className="mt-1" style={{ color: '#EF4444' }}>
                  {errors.message}
                </BodyTextSmall>
              )}
              <BodyTextSmall
                className="mt-1"
                style={{ color: placeholderColor, textAlign: 'right' }}
              >
                {formData.message.length} characters
              </BodyTextSmall>
            </View>

            {/* Submit Button */}
            <Button
              title={isSubmitting ? "Sending..." : "Send Message"}
              onPress={handleSubmit}
              disabled={isSubmitting}
              variant="primary"
              size="large"
              className="w-full"
            />
          </View>

          {/* Footer */}
          <View className="mb-8">
            <BodyTextSmall style={{ color: placeholderColor, textAlign: 'center' }}>
              We typically respond within 24 hours.{'\n'}
              Your privacy is important to us.
            </BodyTextSmall>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
