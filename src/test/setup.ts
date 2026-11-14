// jsdom has no ResizeObserver, which Radix checkbox and radio controls use.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
