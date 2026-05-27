import { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary] Uncaught error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
          <Text className="text-5xl mb-4">{'\uD83D\uDE1F'}</Text>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8">
            An unexpected error occurred. Please try again.
          </Text>
          {__DEV__ && this.state.error ? (
            <Text className="text-xs text-red-400 text-center mb-6 font-mono">
              {this.state.error.message}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={this.handleRetry}
            className="bg-primary-500 px-8 py-4 rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text className="text-white font-semibold text-base">Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
