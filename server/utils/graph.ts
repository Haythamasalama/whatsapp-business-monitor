type Query = Record<string, string | number | null | undefined>

export type GraphResponse = { error?: MetaError } & Record<string, any>

export async function graph(
  account: { token: string, version: string },
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  query: Query = {},
  body?: unknown,
): Promise<GraphResponse> {
  const url = new URL(`https://graph.facebook.com/${account.version}/${path}`)

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${account.token}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    })
    const json = await response.json().catch(() => null)

    return json && typeof json === 'object' ? json : { error: { message: t('server.metaUnexpected', { status: response.status }) } }
  }
  catch (error) {
    return { error: { message: t('server.metaUnreachable', { message: (error as Error).message }) } }
  }
}

/** Tries each field list in turn while Graph answers 100 (a field this account or version does not know). */
export async function graphFields(account: { token: string, version: string }, path: string, fieldSets: string[], query: Query = {}): Promise<GraphResponse> {
  let response: GraphResponse = {}

  for (const fields of fieldSets) {
    response = await graph(account, 'GET', path, { ...query, fields })

    if (response.error?.code !== 100) {
      return response
    }
  }

  return response
}

export function orFail(response: GraphResponse, statusCode = 502): GraphResponse {
  if (response.error) {
    throw createError({ statusCode, data: { error: response.error } })
  }

  return response
}

/**
 * Meta's Resumable Upload API, used for a profile photo: open an upload session on the token's app, send the
 * bytes, and get back a handle the profile accepts as profile_picture_handle.
 * https://developers.facebook.com/docs/graph-api/guides/upload
 */
export async function uploadHandle(account: { token: string, version: string }, file: { name: string, type: string, data: Uint8Array }): Promise<GraphResponse> {
  // https://developers.facebook.com/docs/graph-api/reference/debug_token
  const debug = await graph(account, 'GET', 'debug_token', { input_token: account.token })
  const appId = debug.data?.app_id

  if (!appId) {
    return { error: debug.error ?? { message: t('server.uploadFailed') } }
  }

  // https://developers.facebook.com/docs/graph-api/guides/upload#step-1--create-a-session
  const session = await graph(account, 'POST', `${appId}/uploads`, { file_name: file.name, file_length: file.data.byteLength, file_type: file.type })

  if (!session.id) {
    return { error: session.error ?? { message: t('server.uploadFailed') } }
  }

  try {
    // https://developers.facebook.com/docs/graph-api/guides/upload#step-2--initiate-upload
    const response = await fetch(`https://graph.facebook.com/${account.version}/${session.id}`, {
      method: 'POST',
      headers: { 'Authorization': `OAuth ${account.token}`, 'file_offset': '0' },
      body: new Blob([new Uint8Array(file.data)], { type: file.type }),
      signal: AbortSignal.timeout(60_000),
    })
    const json = await response.json().catch(() => null)

    return json?.h ? { handle: String(json.h) } : { error: json?.error ?? { message: t('server.uploadFailed') } }
  }
  catch (error) {
    return { error: { message: t('server.metaUnreachable', { message: (error as Error).message }) } }
  }
}
