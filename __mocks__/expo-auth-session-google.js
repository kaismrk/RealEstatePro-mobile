'use strict';
// Jest manual mock for expo-auth-session/providers/google.
// useIdTokenAuthRequest returns [request, response, promptAsync] like the real hook.

const mockPromptAsync = jest.fn(() =>
  Promise.resolve({ type: 'cancel' })
);

const useIdTokenAuthRequest = jest.fn(() => [
  { url: 'https://accounts.google.com/o/oauth2/auth?mock=1' }, // request
  null, // response (unused — tests drive via promptAsync result)
  mockPromptAsync,
]);

module.exports = { useIdTokenAuthRequest };
