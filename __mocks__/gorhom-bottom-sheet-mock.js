'use strict';

const React = require('react');

// Minimal mock for @gorhom/bottom-sheet in test environment
const BottomSheet = ({ children }) => React.createElement(React.Fragment, null, children);
BottomSheet.displayName = 'BottomSheet';

const BottomSheetBackdrop = () => null;
BottomSheetBackdrop.displayName = 'BottomSheetBackdrop';

module.exports = {
  __esModule: true,
  default: BottomSheet,
  BottomSheetBackdrop,
};
