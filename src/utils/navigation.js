export function protectedReturnPath(from, fallbackPath) {
  const candidate =
    typeof from === 'string'
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search ?? ''}`
        : ''

  if (
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    [...candidate].some((character) => character.charCodeAt(0) < 32)
  ) {
    return fallbackPath
  }

  return candidate
}
