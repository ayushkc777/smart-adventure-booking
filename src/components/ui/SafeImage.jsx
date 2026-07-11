export function SafeImage({
  alt,
  fallbackSrc = '/images/paragliding.jpg',
  onError,
  ...props
}) {
  function handleError(event) {
    onError?.(event)
    if (event.currentTarget.dataset.fallbackApplied === 'true') return
    event.currentTarget.dataset.fallbackApplied = 'true'
    event.currentTarget.src = fallbackSrc
  }

  return <img alt={alt} onError={handleError} {...props} />
}
