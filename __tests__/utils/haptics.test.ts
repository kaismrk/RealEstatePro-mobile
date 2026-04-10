// Mock expo-haptics before importing the module under test
const mockImpactAsync = jest.fn().mockResolvedValue(undefined);
const mockNotificationAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-haptics', () => ({
  impactAsync: (...args: unknown[]) => mockImpactAsync(...args),
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

import { haptic } from '@/lib/utils/haptics';

describe('haptic utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('haptic.light calls impactAsync with Light style', async () => {
    await haptic.light();
    expect(mockImpactAsync).toHaveBeenCalledWith('Light');
    expect(mockNotificationAsync).not.toHaveBeenCalled();
  });

  it('haptic.medium calls impactAsync with Medium style', async () => {
    await haptic.medium();
    expect(mockImpactAsync).toHaveBeenCalledWith('Medium');
  });

  it('haptic.heavy calls impactAsync with Heavy style', async () => {
    await haptic.heavy();
    expect(mockImpactAsync).toHaveBeenCalledWith('Heavy');
  });

  it('haptic.success calls notificationAsync with Success type', async () => {
    await haptic.success();
    expect(mockNotificationAsync).toHaveBeenCalledWith('Success');
    expect(mockImpactAsync).not.toHaveBeenCalled();
  });

  it('haptic.warning calls notificationAsync with Warning type', async () => {
    await haptic.warning();
    expect(mockNotificationAsync).toHaveBeenCalledWith('Warning');
  });

  it('haptic.error calls notificationAsync with Error type', async () => {
    await haptic.error();
    expect(mockNotificationAsync).toHaveBeenCalledWith('Error');
  });
});
