import { useTranslation } from 'react-i18next';
import { LegalDocScreen } from '@/components/legal/LegalDocScreen';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  return (
    <LegalDocScreen docPath="/legal/privacy" title={t('settings.legal.privacy')} />
  );
}
