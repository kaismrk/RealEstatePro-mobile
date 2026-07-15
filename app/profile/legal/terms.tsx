import { useTranslation } from 'react-i18next';
import { LegalDocScreen } from '@/components/legal/LegalDocScreen';

export default function TermsScreen() {
  const { t } = useTranslation();
  return <LegalDocScreen docPath="/legal/terms" title={t('settings.legal.terms')} />;
}
