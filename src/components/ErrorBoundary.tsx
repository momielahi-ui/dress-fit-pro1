import React, { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-muted/20 border border-muted rounded-xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive opacity-80" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">3D Model Loading... Check your connection.</h3>
            <p className="text-sm text-muted-foreground mt-2">
              There was an issue rendering the 3D scene. Try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
