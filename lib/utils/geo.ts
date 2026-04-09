export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export function boundingBoxFromRegion(region: MapRegion): {
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
} {
  return {
    min_lat: region.latitude - region.latitudeDelta / 2,
    max_lat: region.latitude + region.latitudeDelta / 2,
    min_lng: region.longitude - region.longitudeDelta / 2,
    max_lng: region.longitude + region.longitudeDelta / 2,
  };
}
