import { Component, ErrorInfo, ReactNode } from 'react';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import Error500 from '@pages/500';

interface Props {
  children?: ReactNode;
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
    logEvent(attrKeys.commonEvent.SCRIPT_ERROR, {
      title: 'client-500',
      userAgent: window.navigator.userAgent,
      url: window.location.href,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  override render() {
    const { children } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return <Error500 logging={false} />;
    }

    return children;
  }
}

export default ErrorBoundary;
