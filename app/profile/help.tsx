/**
 * Help & Feedback screen — app/profile/help.tsx
 *
 * Two sections:
 *  1. Contact support: category picker + subject + message + submit
 *  2. FAQ: expandable list sourced from assets/faq/{lang}.json
 *
 * Design constraints:
 *  - Palette via useTheme() — no hex literals
 *  - Modal+FlatList picker pattern reused from settings.tsx
 *  - LayoutAnimation for FAQ expand/collapse (no new dep)
 *  - ScreenHeader with back prop (commit 5a1af77)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useTheme } from '@/lib/theme';
import { fontWeight } from '@/constants/theme';
import { useSubmitFeedback } from '@/lib/api/support';
import type { FeedbackCategory } from '@/lib/api/support';

import faqEn from '@/assets/faq/en.json';
import faqFr from '@/assets/faq/fr.json';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ── Static data ────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: Record<string, FaqItem[]> = {
  en: faqEn as FaqItem[],
  fr: faqFr as FaqItem[],
};

const CATEGORIES: Array<{ labelKey: string; value: FeedbackCategory }> = [
  { labelKey: 'help.contact.category.bug',      value: 'bug'      },
  { labelKey: 'help.contact.category.feature',  value: 'feature'  },
  { labelKey: 'help.contact.category.question', value: 'question' },
  { labelKey: 'help.contact.category.other',    value: 'other'    },
];

const SUBJECT_MAX = 100;
const MESSAGE_MAX = 2000;

// ── Component ──────────────────────────────────────────────────────────────

export default function HelpScreen() {
  const { t, i18n } = useTranslation();
  const { palette } = useTheme();

  // Form state
  const [category, setCategory]                   = useState<FeedbackCategory | null>(null);
  const [subject, setSubject]                     = useState('');
  const [message, setMessage]                     = useState('');
  const [categoryPickerVisible, setPickerVisible] = useState(false);
  const [submitError, setSubmitError]             = useState<string | null>(null);

  // FAQ state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const mutation = useSubmitFeedback();

  const isSubmitDisabled =
    !category || subject.trim().length === 0 || message.trim().length === 0 || mutation.isPending;

  function handleCategorySelect(value: FeedbackCategory) {
    setPickerVisible(false);
    setCategory(value);
  }

  function handleSubmit() {
    if (!category || subject.trim().length === 0 || message.trim().length === 0) return;
    setSubmitError(null);
    mutation.mutate(
      { subject: subject.trim(), message: message.trim(), category },
      {
        onSuccess: () => {
          Alert.alert(t('help.contact.success'));
          router.back();
        },
        onError: () => {
          setSubmitError(t('help.contact.error'));
        },
      }
    );
  }

  function toggleFaq(index: number) {
    // Optional chain guards against jest-expo test environment where
    // LayoutAnimation may be undefined. Has no effect at runtime on device.
    LayoutAnimation?.configureNext?.(LayoutAnimation.Presets?.easeInEaseOut);
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  const categoryLabel = category
    ? t(CATEGORIES.find((c) => c.value === category)?.labelKey ?? '')
    : t('help.contact.category.label');

  const faqItems: FaqItem[] = FAQ_DATA[i18n.language] ?? FAQ_DATA['en'] ?? [];

  // ── Styles (inline with palette) ────────────────────────────────────────
  const s = makeStyles(palette);

  return (
    <View style={s.root}>
      <ScreenHeader title={t('help.title')} back />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Contact support ───────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>{t('help.contact.title')}</Text>
          <View style={s.card}>

            {/* Category picker row */}
            <Text style={s.fieldLabel}>{t('help.contact.category.label')}</Text>
            <TouchableOpacity
              testID="category-picker-trigger"
              style={s.pickerRow}
              onPress={() => setPickerVisible(true)}
              accessibilityLabel={t('help.contact.category.label')}
            >
              <Text style={[s.pickerText, !category && s.placeholder]}>
                {categoryLabel}
              </Text>
              <ChevronDown size={18} color={palette.textTertiary} />
            </TouchableOpacity>

            {/* Subject */}
            <Text style={s.fieldLabel}>{t('help.contact.subject.label')}</Text>
            <TextInput
              testID="subject-input"
              style={s.textInput}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('help.contact.subject.placeholder')}
              placeholderTextColor={palette.textTertiary}
              maxLength={SUBJECT_MAX}
              returnKeyType="next"
            />

            {/* Message */}
            <Text style={s.fieldLabel}>{t('help.contact.message.label')}</Text>
            <TextInput
              testID="message-input"
              style={[s.textInput, s.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder={t('help.contact.message.placeholder')}
              placeholderTextColor={palette.textTertiary}
              maxLength={MESSAGE_MAX}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {/* Error */}
            {submitError ? (
              <Text testID="submit-error" style={s.errorText}>{submitError}</Text>
            ) : null}

            {/* Submit button */}
            <TouchableOpacity
              testID="submit-button"
              style={[s.submitBtn, isSubmitDisabled && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              accessibilityRole="button"
              accessibilityLabel={t('help.contact.submit')}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color={palette.textOnBrand} />
              ) : (
                <Text style={s.submitBtnText}>{t('help.contact.submit')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <View style={[s.section, s.sectionLast]}>
          <Text style={s.sectionLabel}>{t('help.faq.title')}</Text>
          <View style={s.card}>
            {faqItems.map((item, index) => (
              <View key={index} style={index < faqItems.length - 1 ? s.faqItemBorder : undefined}>
                <TouchableOpacity
                  testID={`faq-item-${index}`}
                  style={s.faqQuestion}
                  onPress={() => toggleFaq(index)}
                  accessibilityRole="button"
                  accessibilityLabel={item.question}
                >
                  <Text style={s.faqQuestionText}>{item.question}</Text>
                  {expandedIndex === index ? (
                    <ChevronUp size={18} color={palette.textTertiary} />
                  ) : (
                    <ChevronDown size={18} color={palette.textTertiary} />
                  )}
                </TouchableOpacity>
                {expandedIndex === index && (
                  <Text testID={`faq-answer-${index}`} style={s.faqAnswer}>
                    {item.answer}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* ── Category picker modal ─────────────────────────────────── */}
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={s.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t('help.contact.category.label')}</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={s.modalClose}>{t('settings.picker.close')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  testID={`category-option-${item.value}`}
                  style={s.pickerOption}
                  onPress={() => handleCategorySelect(item.value)}
                  accessibilityLabel={t(item.labelKey)}
                >
                  <Text style={s.pickerOptionLabel}>{t(item.labelKey)}</Text>
                  {category === item.value && (
                    <Text style={s.pickerCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={s.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Styles factory (consumes palette — no hex literals) ────────────────────

type Palette = ReturnType<typeof useTheme>['palette'];

function makeStyles(p: Palette) {
  return StyleSheet.create({
    root:  { flex: 1, backgroundColor: p.background },
    scroll: { flex: 1 },

    section: {
      marginTop: 24,
    },
    sectionLast: {
      marginBottom: 40,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: fontWeight.semibold,
      color: p.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    card: {
      backgroundColor: p.surface,
      borderTopWidth: 1,
      borderTopColor: p.border,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
    },

    // Form
    fieldLabel: {
      fontSize: 14,
      fontWeight: fontWeight.semibold,
      color: p.textSecondary,
      marginTop: 12,
      marginBottom: 6,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: p.surfaceSunken,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    pickerText: {
      fontSize: 16,
      color: p.textPrimary,
      flex: 1,
    },
    placeholder: {
      color: p.textTertiary,
    },
    textInput: {
      backgroundColor: p.surfaceSunken,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: p.textPrimary,
    },
    textArea: {
      height: 140,
      paddingTop: 10,
    },
    errorText: {
      fontSize: 13,
      color: p.error,
      marginTop: 8,
    },
    submitBtn: {
      marginTop: 16,
      backgroundColor: p.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtnDisabled: {
      opacity: 0.45,
    },
    submitBtnText: {
      fontSize: 16,
      fontWeight: fontWeight.semibold,
      color: p.textOnBrand,
    },

    // FAQ
    faqItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: p.border,
    },
    faqQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      gap: 8,
    },
    faqQuestionText: {
      fontSize: 15,
      fontWeight: fontWeight.medium,
      color: p.textPrimary,
      flex: 1,
    },
    faqAnswer: {
      fontSize: 14,
      color: p.textSecondary,
      lineHeight: 21,
      paddingBottom: 14,
    },

    // Modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: p.overlayScrim,
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: p.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 32,
      maxHeight: '50%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: p.border,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: fontWeight.semibold,
      color: p.textPrimary,
    },
    modalClose: {
      fontSize: 15,
      color: p.primary,
    },
    pickerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    pickerOptionLabel: {
      fontSize: 16,
      color: p.textPrimary,
    },
    pickerCheck: {
      fontSize: 18,
      color: p.primary,
    },
    separator: {
      height: 1,
      backgroundColor: p.border,
      marginHorizontal: 16,
    },
  });
}
