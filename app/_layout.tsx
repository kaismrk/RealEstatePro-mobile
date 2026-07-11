import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { I18nextProvider } from 'react-i18next';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary';
import { ThemeProvider } from '@/lib/theme';
import i18n from '@/lib/i18n';
import { detectLanguage } from '@/lib/i18n/detect';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void (async () => {
      await hydrate();
      const lang = await detectLanguage();
      if (i18n.language !== lang) {
        await i18n.changeLanguage(lang);
      }
    })();
  }, [hydrate]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AppErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }} />
            <Toast />
          </QueryClientProvider>
        </AppErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  );
}
