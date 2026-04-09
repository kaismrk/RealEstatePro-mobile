// Mock expo-secure-store for tests
jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    setItemAsync: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    getItemAsync: jest.fn(async (key) => store[key] ?? null),
    deleteItemAsync: jest.fn(async (key) => {
      delete store[key];
    }),
  };
});
