import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useRegisterAgent } from '@/hooks/useAgentProfile';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AgentRegisterScreen() {
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
              'Already registered',
              'You already have an agent profile. Redirecting...',
              [{ text: 'OK', onPress: () => router.replace('/agent/profile') }]
            );
            return;
          }
          Alert.alert('Error', err.message ?? 'Failed to register as agent.');
        },
      }
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary-500 text-base">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Become an Agent</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-5">
          <Text className="text-sm font-semibold text-primary-900 mb-1">
            Agent Benefits
          </Text>
          <Text className="text-sm text-primary-700">
            As an agent, you get access to a full dashboard, lead tracking, per-listing
            statistics, and the ability to link your profile to an agency.
          </Text>
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1">Bio</Text>
        <View className="mb-4">
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Tell buyers and renters about yourself..."
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </View>

        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="+216 XX XXX XXX"
          keyboardType="phone-pad"
        />

        <Text className="text-xs text-gray-400 mt-2 mb-6">
          Agency affiliation can be set after registration from your agent profile.
        </Text>

        <View className="h-24" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onPress={handleSubmit} loading={registerAgent.isPending} size="lg">
          Register as Agent
        </Button>
      </View>
    </View>
  );
}
