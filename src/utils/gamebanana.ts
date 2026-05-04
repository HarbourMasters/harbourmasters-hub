const API_BASE = 'https://gamebanana.com/apiv11'

export async function fetchModCount(gameId: number): Promise<number> {
  const params = new URLSearchParams({
    '_aFilters[Generic_Game]': gameId.toString(),
    '_nPerpage': '1',
    '_nPage': '1',
    '_csvProperties': '_idRow'
  })

  const response = await fetch(`${API_BASE}/Mod/Index?${params}`)
  if (!response.ok) {
    throw new Error(`GameBanana API error: ${response.status}`)
  }

  const data = await response.json()
  return data._aMetadata?._nRecordCount ?? 0
}
