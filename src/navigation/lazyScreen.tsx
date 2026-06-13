import React from 'react';

/**
 * Defers screen module loading until the route is first rendered.
 * Keeps hub screens eager while heavy stacks load on demand.
 */
export function lazyNamedScreen<P extends object>(
  loader: () => Record<string, React.ComponentType<P>>,
  exportName: string,
): React.ComponentType<P> {
  let Cached: React.ComponentType<P> | undefined;

  function LazyScreen(props: P) {
    if (!Cached) {
      Cached = loader()[exportName];
    }
    return <Cached {...props} />;
  }

  LazyScreen.displayName = `Lazy(${exportName})`;
  return LazyScreen;
}
