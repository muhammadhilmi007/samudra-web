// src/utils/createEmotionCache.ts
import createCache from '@emotion/cache';

// On the client side, Create a meta tag at the top of the <head> and set it as insertionPoint.
// This ensures MUI styles are loaded first and allows developers to easily override MUI styles with other styling solutions, like CSS modules.
export default function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}