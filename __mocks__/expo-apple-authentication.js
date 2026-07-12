'use strict';
// Jest manual mock for expo-apple-authentication.
// The real module requires native iOS APIs — this stub lets tests run on Node.

const mockIsAvailableAsync = jest.fn(() => Promise.resolve(true));
const mockSignInAsync = jest.fn(() =>
  Promise.resolve({
    user: 'mock-apple-user-id',
    email: 'apple@example.com',
    identityToken: 'mock-identity-token',
    authorizationCode: 'mock-auth-code',
    fullName: {
      givenName: 'John',
      familyName: 'Doe',
      namePrefix: null,
      nameSuffix: null,
      middleName: null,
      nickname: null,
    },
    realUserStatus: 1,
    state: null,
  })
);

const AppleAuthenticationScope = {
  FULL_NAME: 'FULL_NAME',
  EMAIL: 'EMAIL',
};

module.exports = {
  isAvailableAsync: mockIsAvailableAsync,
  signInAsync: mockSignInAsync,
  AppleAuthenticationScope,
};
