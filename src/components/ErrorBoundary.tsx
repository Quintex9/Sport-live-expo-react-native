import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>❌ Chyba v aplikácii</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.errorText}>
              {this.state.error?.message || 'Neznáma chyba'}
            </Text>
            {this.state.error?.stack && (
              <Text style={styles.stackText}>
                {this.state.error.stack}
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: colors.live,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  errorText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 20,
  },
  stackText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

