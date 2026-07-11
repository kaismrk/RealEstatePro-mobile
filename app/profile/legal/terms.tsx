import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { colors, fontSize } from '@/constants/theme';

// Localization scaffold — replace with t('legal.termsTitle') in task #48
const SCREEN_TITLE = 'Terms of Use';

// Interim URL — TODO(task#47-backend): swap to `${API_BASE_URL}/api/v1/legal/terms`
// once backend endpoints are added
const TERMS_URL = 'https://admin.hovioo.com/terms';

// Fallback text from assets/legal/terms.md — shown when WebView fires onError
const FALLBACK_TEXT =
  'Loading legal document...\n\nIf this persists, ensure you are online.';

export default function TermsScreen() {
  const [hasError, setHasError] = useState(false);

  return (
    <View style={styles.root}>
      <ScreenHeader title={SCREEN_TITLE} back />

      {hasError ? (
        <ScrollView contentContainerStyle={styles.fallback}>
          <Text style={styles.fallbackText}>{FALLBACK_TEXT}</Text>
        </ScrollView>
      ) : (
        <WebView
          source={{ uri: TERMS_URL }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          onError={() => setHasError(true)}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  fallback: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fallbackText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
