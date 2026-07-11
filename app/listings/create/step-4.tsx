import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  StyleSheet,
  type ListRenderItemInfo,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/lib/stores/ui.store';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, fontWeight, fontSize } from '@/constants/theme';

const MAX_IMAGES = 20;

export default function CreateStep4() {
  const { t } = useTranslation();
  const draft = useUIStore((s) => s.createListingDraft);
  const setDraft = useUIStore((s) => s.setDraft);

  const initialUris = Array.isArray(draft?.image_urls)
    ? (draft.image_urls as string[])
    : [];
  const [imageUris, setImageUris] = useState<string[]>(initialUris);

  async function handlePickImages() {
    if (imageUris.length >= MAX_IMAGES) {
      Alert.alert('Limit reached', t('listings.create.step4.limitReached', { max: MAX_IMAGES }));
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission denied',
        t('listings.create.step4.permissionDenied')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_IMAGES - imageUris.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map((a) => a.uri);
      setImageUris((prev) => [...prev, ...newUris].slice(0, MAX_IMAGES));
    }
  }

  function handleRemove(uri: string) {
    setImageUris((prev) => prev.filter((u) => u !== uri));
  }

  function handleNext() {
    setDraft({ image_urls: imageUris });
    router.push('/listings/create/step-5');
  }

  function renderItem({ item, index }: ListRenderItemInfo<string>) {
    return (
      <View style={styles.photoWrap}>
        <Image
          source={{ uri: item }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel={t('listings.create.step4.photoAlt', { index: index + 1 })}
        />
        <TouchableOpacity
          onPress={() => handleRemove(item)}
          style={styles.removeBtn}
          accessibilityRole="button"
          accessibilityLabel={t('listings.create.step4.removePhotoLabel', { index: index + 1 })}
        >
          <Icon name="x" size={12} color={colors.textOnBrand} />
        </TouchableOpacity>
        {index === 0 && (
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>{t('listings.create.step4.coverBadge')}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Text style={styles.linkText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{t('listings.create.step4.photosTitle')}</Text>
        <Text style={styles.stepSubtitle}>
          {t('listings.create.step4.photoCount', { count: imageUris.length, max: MAX_IMAGES })}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Upload button */}
        <TouchableOpacity
          onPress={handlePickImages}
          style={styles.uploadBtn}
          accessibilityRole="button"
          accessibilityLabel={t('listings.create.step4.addPhotos')}
        >
          <Icon name="plus" size={40} color={colors.textTertiary} />
          <Text style={styles.uploadTitle}>{t('listings.create.step4.addPhotos')}</Text>
          <Text style={styles.uploadSubtitle}>
            {t('listings.create.step4.uploadSubtitle', { max: MAX_IMAGES })}
          </Text>
        </TouchableOpacity>

        {/* Photo grid */}
        {imageUris.length > 0 && (
          <>
            <Text style={styles.selectedLabel}>
              {t('listings.create.step4.selectedPhotos')}
            </Text>
            <FlatList<string>
              data={imageUris}
              renderItem={renderItem}
              keyExtractor={(uri, i) => `${uri}-${i}`}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.photoColumnWrapper}
            />
          </>
        )}

        <View style={styles.scrollBottom} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button onPress={handleNext} size="lg">
          {t('listings.create.step4.next')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackBtn: {
    marginBottom: 8,
  },
  linkText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  screenTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  uploadBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.xl2,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: 8,
  },
  uploadSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 4,
  },
  selectedLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  photoColumnWrapper: {
    gap: 8,
  },
  photoWrap: {
    marginRight: 12,
    marginBottom: 12,
    position: 'relative',
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  coverBadgeText: {
    color: colors.textOnBrand,
    fontSize: fontSize.xs,
  },
  scrollBottom: {
    height: 128,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
