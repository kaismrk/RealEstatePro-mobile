import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

// Guests may browse search. Auth is enforced at the action level (favorites,
// contact, profile) via AuthGate components, not at the tab layout level.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#006AFF',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? '🔍' : '🔍'} />
          ),
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          title: 'Updates',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? '🔔' : '🔔'} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? '❤️' : '❤️'} />
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: 'Loans',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? '💰' : '💰'} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? '👤' : '👤'} />
          ),
        }}
      />
    </Tabs>
  );
}
