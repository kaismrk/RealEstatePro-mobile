'use strict';

const React = require('react');
const { View, Text } = require('react-native');

/**
 * Minimal WebView mock for Jest.
 *
 * - Renders a <View testID="webview-mock"> containing the source URI so tests
 *   can assert the correct URL was passed.
 * - Exposes an `onError` prop so tests can simulate network failures by calling
 *   the injected callback.
 */
const WebView = React.forwardRef(function MockWebView(props, _ref) {
  const { source, testID } = props;
  const uri = (source && source.uri) ? source.uri : '';
  const html = (source && source.html) ? source.html : '';

  return React.createElement(
    View,
    { testID: testID || 'webview-mock' },
    React.createElement(Text, { testID: 'webview-uri' }, uri),
    React.createElement(Text, { testID: 'webview-html' }, html)
  );
});

WebView.displayName = 'MockWebView';

module.exports = { WebView };
