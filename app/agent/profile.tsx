import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAgentProfile, useUpdateAgentProfile } from '@/hooks/useAgentProfile';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AgentProfileScreen() {
  const { data: agent, isLoading, isError } = useAgentProfile();
  const updateAgent = useUpdateAgentProfile();

  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!agent) return;
    setBio(agent.bio ?? '');
    setPhone(agent.phone ?? '');
  }, [agent]);

  function handleSave() {
    updateAgent.mutate(
      {
        bio: bio.trim() || null,
        phone: phone.trim() || null,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Agent profile updated.');
        },
        onError: (err) => {
          Alert.alert('Error', err.message ?? 'Failed to update profile.');
        },
      }
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isError || !agent) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">No agent profile found</Text>
        <Text className="text-gray-500 text-center mb-5">
          You need to register as an agent first.
        </Text>
        <Button onPress={() => router.replace('/agent/register')} size="lg">
          Register as Agent
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary-500 text-base">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Agent Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Verified badge */}
        <View className="flex-row items-center mb-4">
          <View
            className={`rounded-full px-3 py-1 ${agent.verified ? 'bg-green-100' : 'bg-gray-100'}`}
          >
            <Text
              className={`text-xs font-semibold ${agent.verified ? 'text-green-700' : 'text-gray-500'}`}
            >
              {agent.verified ? 'Verified Agent' : 'Not yet verified'}
            </Text>
          </View>
          {agent.verified && <Text className="ml-2 text-green-600 text-base">✓</Text>}
        </View>

        {agent.agency && (
          <View className="bg-gray-50 rounded-xl p-3 mb-4">
            <Text className="text-xs text-gray-500">Agency</Text>
            <Text className="text-sm font-semibold text-gray-900 mt-0.5">{agent.agency.name}</Text>
          </View>
        )}

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

        <Text className="text-xs text-gray-400 mt-1 mb-6">
          Verified status is set by the admin team and cannot be changed here.
        </Text>

        <View className="h-24" />
      </ScrollView>

      {/* Footer */}
      <View className="px-4 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onPress={handleSave} loading={updateAgent.isPending} size="lg">
          Save Changes
        </Button>
      </View>
    </View>
  );
}
