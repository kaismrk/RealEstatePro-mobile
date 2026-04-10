import { View, Text } from 'react-native';
import type { ReactNode } from 'react';

interface MenuSectionProps {
  title: string;
  children: ReactNode;
}

export function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <View className="mt-6">
      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 mb-1">
        {title}
      </Text>
      <View className="bg-white border-t border-gray-100">{children}</View>
    </View>
  );
}
