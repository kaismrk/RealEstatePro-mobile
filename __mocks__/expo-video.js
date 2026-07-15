'use strict';

/**
 * Minimal expo-video mock for Jest (same pattern as react-native-webview.js).
 *
 * - `useVideoPlayer(source, setup)` returns a mock player with spied
 *   play/pause and a working addListener/emit pair so tests can drive
 *   timeUpdate / playingChange / playToEnd events.
 * - `VideoView` renders a plain <View testID=...>.
 * - `__getLastMockPlayer()` exposes the most recently created player so tests
 *   can assert autoplay behaviour and emit playback events.
 */

const React = require('react');
const { View } = require('react-native');

let lastPlayer = null;

function createMockPlayer() {
  const listeners = {};
  const player = {
    loop: false,
    muted: false,
    timeUpdateEventInterval: 0,
    duration: 10,
    currentTime: 0,
    playing: false,
    play: jest.fn(() => {
      player.playing = true;
    }),
    pause: jest.fn(() => {
      player.playing = false;
    }),
    release: jest.fn(),
    addListener: jest.fn((event, cb) => {
      (listeners[event] = listeners[event] || []).push(cb);
      return {
        remove: () => {
          listeners[event] = (listeners[event] || []).filter((f) => f !== cb);
        },
      };
    }),
    emit: (event, payload) => {
      (listeners[event] || []).forEach((f) => f(payload));
    },
  };
  return player;
}

function useVideoPlayer(_source, setup) {
  const ref = React.useRef(null);
  if (ref.current == null) {
    ref.current = createMockPlayer();
    if (typeof setup === 'function') setup(ref.current);
    lastPlayer = ref.current;
  }
  return ref.current;
}

const VideoView = React.forwardRef(function MockVideoView(props, _ref) {
  return React.createElement(View, { testID: props.testID || 'video-view-mock' });
});
VideoView.displayName = 'MockVideoView';

module.exports = {
  useVideoPlayer,
  VideoView,
  __getLastMockPlayer: () => lastPlayer,
};
