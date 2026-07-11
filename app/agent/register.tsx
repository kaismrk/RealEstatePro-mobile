import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRegisterAgent } from '@/hooks/useAgentProfile';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight } from '@/constants/theme';

export default function AgentRegisterScreen() {
  const { t } = useTranslation();
  const registerAgent = useRegisterAgent();

  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  function handleSubmit() {
    registerAgent.mutate(
      {
        bio: bio.trim() || null,
        phone: phone.trim() || null,
      },
      {
        onSuccess: () => {
          router.replace('/agent/dashboard');
        },
        onError: (err) => {
          const anyErr = err as unknown as { response?: { status?: number } };
          // 400 means profile already exists
          if (anyErr?.response?.status === 400) {
            Alert.alert(
              t('agent.register.alreadyRegistered.title'),
              t('agent.register.alreadyRegistered.body'),
              [{ text: t('common.close'), onPress: () => router.replace('/agent/profile') }]
            );
            return;
          }
          Alert.alert('Error', err.message ?? 'Failed to register as agent.');
        },
      }
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Icon name="chevron-left" size={18} color={colors.primary} />
          <Text style={styles.headerBackText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('agent.register.title')}</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.benefitsBanner}>
          <Text style={styles.benefitsTitle}>{t('agent.register.benefits.title')}</Text>
          <Text style={styles.benefitsBody}>
            {t('agent.register.benefits.body')}
          </Text>
        </View>

        <Text style={styles.fieldLabel}>{t('agent.register.bio.label')}</Text>
        <View style={styles.bioWrapper}>
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder={t('agent.register.bio.placeholder')}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </View>

        <Input
          label={t('common.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder="+216 XX XXX XXX"
          keyboardType="phone-pad"
        />

        <Text style={styles.footNote}>
          {t('agent.register.footNote')}
        </Text>

        <View style={styles.scrollPadBottom} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleSubmit} loading={registerAgent.isPending} size="lg">
          {t('agent.register.submit')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerBackText: {
    color: colors.primary,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  benefitsBanner: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  benefitsBody: {
    fontSize: 14,
    color: colors.primary,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bioWrapper: {
    marginBottom: 16,
  },
  footNote: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
    marginBottom: 24,
  },
  scrollPadBottom: {
    height: 96,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
