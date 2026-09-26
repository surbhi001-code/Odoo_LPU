import { httpRequest } from './httpClient'
import { mapDocument, mutateOperation } from '../features/dashboard/api'

const key = (value) => (value == null ? '' : String(value))

async function allPages(path, collection, signal) {
  const first = await httpRequest(`${path}?page=1&limit=100`, { signal })
  const rows = [...first[collection]]
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await httpRequest(`${path}?page=${page}&limit=100`, { signal })
    rows.push(...next[collection])
  }
  return rows
}

export const apiClient = {
  mode: 'api',
  async getWorkspace(signal) {
    const [products, warehouses, categories, inventory, documents, ledger] =
      await Promise.all([
        allPages('/products', 'products', signal),
        httpRequest('/warehouses', { signal }),
        httpRequest('/categories', { signal }),
        allPages('/stock/inventory', 'inventory', signal),
        allPages('/operations', 'documents', signal),
        allPages('/stock/ledger', 'ledger', signal),
      ])
    const locations = warehouses.flatMap((w) =>
      (w.Locations || []).map((l) => ({
        id: key(l.id),
        name: l.name,
        code: l.code,
        warehouseId: key(w.id),
        warehouseName: w.name,
      })),
    )
    const locationById = new Map(locations.map((l) => [l.id, l]))
    const operations = documents.map(mapDocument)
    const operationById = new Map(operations.map((o) => [o.id, o]))
    const balances = new Map()
    for (const row of inventory) {
      const productId = key(row.product_id)
      if (!balances.has(productId))
        balances.set(productId, { stock: {}, locationStock: {} })
      const balance = balances.get(productId)
      const locationId = key(row.location_id)
      const warehouseId = key(
        row.Location?.warehouse_id || locationById.get(locationId)?.warehouseId,
      )
      balance.stock[warehouseId] =
        (balance.stock[warehouseId] || 0) + Number(row.quantity)
      balance.locationStock[locationId] = Number(row.quantity)
    }
    return {
      version: 1,
      categories,
      locations,
      products: products.map((p) => ({
        id: key(p.id),
        name: p.name,
        sku: p.sku,
        category: p.Category?.name || '',
        categoryId: key(p.category_id),
        unit: p.unit_of_measure,
        reorderLevel: Number(p.reorder_point),
        reorderQuantity: p.reorder_qty == null ? '' : Number(p.reorder_qty),
        stock: balances.get(key(p.id))?.stock || {},
        locationStock: balances.get(key(p.id))?.locationStock || {},
      })),
      warehouses: warehouses.map((w) => ({
        ...w,
        id: key(w.id),
        location: w.address || '',
      })),
      operations,
      movements: ledger.map((m) => {
        const location = locationById.get(key(m.location_id))
        const operation = operationById.get(key(m.document_id))
        return {
          id: key(m.id),
          productId: key(m.product_id),
          product: m.Product,
          quantity: Number(m.change_qty),
          balance: Number(m.balance_after),
          locationId: key(m.location_id),
          locationName: m.Location?.name || location?.name || '',
          warehouseId: location?.warehouseId || '',
          warehouseName: location?.warehouseName || '',
          reference:
            operation?.reference || `${m.document_type} #${m.document_id}`,
          type:
            m.document_type.charAt(0) + m.document_type.slice(1).toLowerCase(),
          createdAt: m.createdAt || m.created_at,
        }
      }),
    }
  },
  async command(action, payload) {
    if (action === 'saveProduct') {
      const name = payload.category.trim()
      let category = null
      if (name) {
        const categories = await httpRequest('/categories')
        category = categories.find(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        )
        if (!category) {
          try {
            category = await httpRequest('/categories', {
              method: 'POST',
              body: { name },
            })
          } catch (error) {
            if (error.status !== 409) throw error
            category = (await httpRequest('/categories')).find(
              (c) => c.name.toLowerCase() === name.toLowerCase(),
            )
            if (!category) throw error
          }
        }
      }
      return httpRequest(`/products${payload.id ? `/${payload.id}` : ''}`, {
        method: payload.id ? 'PATCH' : 'POST',
        body: {
          name: payload.name.trim(),
          sku: payload.sku.trim(),
          category_id: category?.id || null,
          unit_of_measure: payload.unit,
          reorder_point: Number(payload.reorderLevel),
          reorder_qty:
            payload.reorderQuantity === '' || payload.reorderQuantity == null
              ? null
              : Number(payload.reorderQuantity),
          ...(!payload.id
            ? {
                initial_stock: Number(payload.initialStock || 0),
                location_id: payload.locationId
                  ? Number(payload.locationId)
                  : null,
              }
            : {}),
        },
      })
    }
    if (action === 'saveWarehouse')
      return httpRequest(`/warehouses${payload.id ? `/${payload.id}` : ''}`, {
        method: payload.id ? 'PATCH' : 'POST',
        body: {
          name: payload.name.trim(),
          code: payload.code.trim(),
          address: payload.location.trim(),
        },
      })
    if (action === 'createLocation' || action === 'updateLocation')
      return httpRequest(
        action === 'updateLocation'
          ? `/warehouses/locations/${payload.id}`
          : `/warehouses/${payload.warehouseId}/locations`,
        {
          method: action === 'updateLocation' ? 'PATCH' : 'POST',
          body: {
            name: payload.name.trim(),
            code: payload.code.trim() || null,
          },
        },
      )
    if (action === 'deleteLocation')
      return httpRequest(`/warehouses/locations/${payload.id}`, {
        method: 'DELETE',
      })
    if (action === 'createOperation' || action === 'updateOperation')
      return mutateOperation(action, payload)
    throw new Error('This action is not supported by the connected API.')
  },
}
