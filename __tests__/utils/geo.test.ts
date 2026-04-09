import { haversineKm, boundingBoxFromRegion } from '../../lib/utils/geo';

describe('haversineKm', () => {
  it('returns approximately correct distance for two Tunis coordinates', () => {
    // Two points in Tunis area — roughly 4-5 km apart
    const dist = haversineKm(36.8, 10.18, 36.84, 10.16);
    expect(dist).toBeGreaterThan(3);
    expect(dist).toBeLessThan(7);
  });

  it('returns 0 for the same point', () => {
    const dist = haversineKm(36.8, 10.18, 36.8, 10.18);
    expect(dist).toBeCloseTo(0, 5);
  });

  it('returns a positive distance for distinct points', () => {
    const dist = haversineKm(0, 0, 1, 1);
    expect(dist).toBeGreaterThan(0);
  });
});

describe('boundingBoxFromRegion', () => {
  const region = {
    latitude: 36.8,
    longitude: 10.18,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  it('returns correct min_lat', () => {
    const box = boundingBoxFromRegion(region);
    expect(box.min_lat).toBeCloseTo(36.75, 5);
  });

  it('returns correct max_lat', () => {
    const box = boundingBoxFromRegion(region);
    expect(box.max_lat).toBeCloseTo(36.85, 5);
  });

  it('returns correct min_lng', () => {
    const box = boundingBoxFromRegion(region);
    expect(box.min_lng).toBeCloseTo(10.13, 5);
  });

  it('returns correct max_lng', () => {
    const box = boundingBoxFromRegion(region);
    expect(box.max_lng).toBeCloseTo(10.23, 5);
  });
});
