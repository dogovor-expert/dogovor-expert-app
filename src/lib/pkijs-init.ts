let initialized = false;

export function initPkijsGost(): void {
  if (initialized) return;
  initialized = true;
}

export function isPkijsInitialized(): boolean {
  return initialized;
}