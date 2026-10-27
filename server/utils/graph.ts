type Query = Record<string, string | number | null | undefined>

export type GraphResponse = { error?: MetaError } & Record<string, any>

export async function graph(
  account: { token: string, version: string },
  method: 'GET' | 'POST',
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

    return json && typeof json === 'object' ? json : { error: { message: `ردّ غير متوقع من Meta (${response.status})` } }
  }
  catch (error) {
    return { error: { message: `تعذّر الاتصال بـ Meta: ${(error as Error).message}` } }
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
