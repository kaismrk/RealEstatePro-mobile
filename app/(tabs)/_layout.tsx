import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarIcon: ({ color }) => <Icon name="search" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          title: t('tabs.updates'),
          tabBarIcon: ({ color }) => <Icon name="bell" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t('tabs.saved'),
          tabBarIcon: ({ color }) => <Icon name="heart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: t('tabs.loans'),
          tabBarIcon: ({ color }) => <Icon name="coins" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <Icon name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
