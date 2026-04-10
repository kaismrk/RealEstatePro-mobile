'use strict';

const React = require('react');

// Lightweight BottomSheet mock for tests — renders children when visible
const BottomSheet = ({ visible, children }) =>
  visible ? React.createElement(React.Fragment, null, children) : null;

module.exports = { BottomSheet };
