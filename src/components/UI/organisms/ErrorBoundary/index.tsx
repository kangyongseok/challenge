import { Component, ErrorInfo, ReactNode } from 'react';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import Error500 from '@pages/500';

interface Props {
  children?: ReactNode;
  disableFallback?: boolean;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { disableFallback } = this.props;

    logEvent(
      disableFallback ? attrKeys.commonEvent.MINOR_SCRIPT_ERROR : attrKeys.commonEvent.SCRIPT_ERROR,
      {
        title: 'client-500',
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    );
  }

  override render() {
    const { children, disableFallback } = this.props;
    const { hasError } = this.state;
    if (disableFallback && hasError) {
      return null;
    }
    if (hasError) {
      return <Error500 logging={false} />;
    }

    return children;
  }
}

export default ErrorBoundary;
