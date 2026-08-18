const defaultE2eMongoUri = 'mongodb://127.0.0.1:27017/smart_adventure_e2e'

export function assertSafeE2eDatabaseUri(uri) {
  let databaseName

  try {
    databaseName = decodeURIComponent(new URL(uri).pathname.replace(/^\//, '').split('/')[0])
  } catch {
    throw new Error('E2E_MONGO_URI must be a valid MongoDB URI.')
  }

  if (!databaseName || !/(?:test|e2e)/i.test(databaseName)) {
    throw new Error(
      'Refusing destructive E2E database setup: the database name must contain "test" or "e2e".',
    )
  }

  return uri
}

export const E2E_MONGO_URI = assertSafeE2eDatabaseUri(
  process.env.E2E_MONGO_URI || defaultE2eMongoUri,
)
