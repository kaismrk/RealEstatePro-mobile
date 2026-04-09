import GorhomBottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  snapPoints = ['50%'],
  children,
}: BottomSheetProps) {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onClose}
      />
    ),
    [onClose]
  );

  if (!visible) return null;

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      enablePanDownToClose
    >
      {children}
    </GorhomBottomSheet>
  );
}
