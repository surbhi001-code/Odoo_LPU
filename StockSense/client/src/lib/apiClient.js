import { applyCommand } from './inventory'

const storageKey = 'stocksense.workspace.v1'
const useApi = import.meta.env.VITE_DATA_SOURCE === 'api'
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const endpoints = {
  saveProduct: 'products',
  saveWarehouse: 'warehouses',
  createOperation: 'operations',
  updateOperation: 'operations',
}
let queue = Promise.resolve()

async function request(path, options) {
  const response = await fetch(path, options)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      body.message || `Request failed (${response.status}). Please try again.`,
    )
  }
  return response.json()
}
function validateWorkspace(value) {
  if (
    !value ||
    !['products', 'warehouses', 'operations', 'movements'].every((key) =>
      Array.isArray(value[key]),
    )
  )
    throw new Error(
      'The workspace data format is invalid. Check your JSON data source.',
    )
  return value
}

export const apiClient = {
  mode: useApi ? 'api' : 'json',
  async getWorkspace() {
    if (useApi)
      return validateWorkspace(
        await request(`${baseUrl}/workspace`, { credentials: 'include' }),
      )
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        return validateWorkspace(JSON.parse(saved))
      } catch {
        throw new Error(
          'Saved workspace data could not be read. Export or remove the stocksense.workspace.v1 browser storage entry to recover.',
        )
      }
    }
    return validateWorkspace(
      await request(`${import.meta.env.BASE_URL}data/workspace.json`),
    )
  },
  command(action, payload) {
    const run = async () => {
      if (useApi) {
        const isUpdate = Boolean(payload.id)
        const suffix = isUpdate
          ? `/${encodeURIComponent(payload.id)}${action === 'updateOperation' ? '/status' : ''}`
          : ''
        await request(`${baseUrl}/${endpoints[action]}${suffix}`, {
          method: isUpdate ? 'PATCH' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        return this.getWorkspace()
      }
      const next = applyCommand(await this.getWorkspace(), action, payload)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        throw new Error(
          'Browser storage is unavailable or full. Your changes were not saved.',
        )
      }
      return next
    }
    const result = queue.then(run)
    queue = result.catch(() => {})
    return result
  },
}
