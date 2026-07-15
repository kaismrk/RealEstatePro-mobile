import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useTheme } from '@/lib/theme';
import { fontSize } from '@/constants/theme';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';

// Fallback shown when the backend is unreachable (mirrors assets/legal/*.md)
const FALLBACK_TEXT =
  'Loading legal document...\n\nIf this persists, ensure you are online.';

/**
 * Minimal markdown → HTML for legal documents served by
 * GET /api/v1/legal/{terms,privacy} (headings, bold, italics, lists,
 * paragraphs). Content is authored in-house, not user-generated.
 */
export function markdownToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s: string) =>
    s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const out: string[] = [];
  let inList = false;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trimEnd();
    const li = /^[-*] (.*)$/.exec(line);
    if (li) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(esc(li[1] ?? ''))}</li>`);
      continue;
    }
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
    const h = /^(#{1,3}) (.*)$/.exec(line);
    if (h) {
      const level = (h[1] ?? '#').length;
      out.push(`<h${level}>${inline(esc(h[2] ?? ''))}</h${level}>`);
    } else if (line.trim()) {
      out.push(`<p>${inline(esc(line))}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

function htmlShell(body: string, textColor: string, bgColor: string): string {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, Roboto, sans-serif; padding: 16px 20px;
         color: ${textColor}; background: ${bgColor}; line-height: 1.6; }
  h1 { font-size: 1.4em; } h2 { font-size: 1.2em; } h3 { font-size: 1.05em; }
</style></head><body>${body}</body></html>`;
}

type Props = {
  /** Backend path relative to the api client base URL (already /api/v1). */
  docPath: '/legal/terms' | '/legal/privacy';
  title: string;
};

export function LegalDocScreen({ docPath, title }: Props) {
  const { i18n } = useTranslation();
  const { palette } = useTheme();
  const countryCode = useAuthStore((s) => s.countryCode);
  const [html, setHtml] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    setHasError(false);
    api
      .get<string>(docPath, {
        params: { lang: i18n.language, country: countryCode },
        // Endpoint returns text/markdown, not JSON
        responseType: 'text',
        transformResponse: [(d: string) => d],
      })
      .then((res) => {
        if (!cancelled) {
          setHtml(
            htmlShell(
              markdownToHtml(res.data),
              palette.textPrimary,
              palette.background,
            ),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [docPath, i18n.language, countryCode, palette.textPrimary, palette.background]);

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <ScreenHeader title={title} back />

      {hasError ? (
        <ScrollView contentContainerStyle={styles.fallback}>
          <Text style={[styles.fallbackText, { color: palette.textSecondary }]}>
            {FALLBACK_TEXT}
          </Text>
        </ScrollView>
      ) : html === null ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <WebView
          source={{ html }}
          originWhitelist={['about:blank']}
          onError={() => setHasError(true)}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webview: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallback: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fallbackText: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
});
