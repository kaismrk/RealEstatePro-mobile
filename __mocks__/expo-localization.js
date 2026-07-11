'use strict';

module.exports = {
  getLocales: jest.fn(() => [{ languageCode: 'en', regionCode: 'US' }]),
  getCalendars: jest.fn(() => []),
};
