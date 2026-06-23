'use client';
import { Component, type ReactNode } from 'react';

// If the real glove model is missing or fails to load, render the fallback
// (the procedural silhouette glove) instead of crashing the canvas.
export default class GloveBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Expected when /research/models/glove.glb has not been added yet.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[research-film] glove model not loaded, using fallback:', error);
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
