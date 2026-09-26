import { httpRequest } from '../../lib/httpClient'

const title = (value = '') => value.charAt(0) + value.slice(1).toLowerCase()
const id = (value) => (value == null ? '' : String(value))

export function mapDocument(document) {
  return {
    id: id(document.id),
    reference: document.reference_no,
    type: title(document.type),
    status: title(document.status),
    warehouseId: id(
      (document.type === 'RECEIPT'
        ? document.destinationLocation
        : document.sourceLocation
      )?.warehouse_id,
    ),
    destinationId: id(document.destinationLocation?.warehouse_id),
    sourceLocation: document.sourceLocation?.name,
    destinationLocation: document.destinationLocation?.name,
    partner: document.partner_name,
    notes: document.notes || '',
    sourceLocationId: id(document.source_location_id),
    destinationLocationId: id(document.destination_location_id),
    scheduledDate: document.scheduled_date,
    createdAt: document.createdAt || document.created_at,
    lines: (document.lines || []).map((line) => ({
      id: id(line.id),
      productId: id(line.product_id),
      quantity: Number(line.quantity),
      product: {
        id: id(line.product_id),
        name: line.Product?.name,
        sku: line.Product?.sku,
        unit: line.Product?.unit_of_measure,
      },
    })),
  }
}

async function allPages(path, key, signal) {
  const first = await httpRequest(
    `${path}${path.includes('?') ? '&' : '?'}page=1&limit=100`,
    { signal },
  )
  const rows = [...first[key]]
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await httpRequest(
      `${path}${path.includes('?') ? '&' : '?'}page=${page}&limit=100`,
      { signal },
    )
    rows.push(...next[key])
  }
  return rows
}

export async function getDashboard(signal) {
  const [kpis, warehouses, categories, lowStock, ledger, received] =
    await Promise.all([
      httpRequest('/dashboard/kpis', { signal }),
      httpRequest('/warehouses', { signal }),
      httpRequest('/categories', { signal }),
      httpRequest('/stock/low-stock', { signal }),
      httpRequest('/stock/ledger?limit=4', { signal }),
      httpRequest('/dashboard/documents?type=RECEIPT&status=DONE&limit=1', {
        signal,
      }),
    ])
  return {
    kpis,
    categories,
    hasReceipt: received.total > 0,
    warehouses: warehouses.map((w) => ({ ...w, id: id(w.id) })),
    attention: lowStock.map((p) => ({
      ...p,
      id: id(p.id),
      stock: { total: Number(p.totalStock) },
      reorderLevel: Number(p.reorder_point),
    })),
    movements: ledger.ledger.map((m) => ({
      id: id(m.id),
      productName: m.Product?.name || 'Product',
      reference: `${title(m.document_type)} #${m.document_id}`,
      quantity: Number(m.change_qty),
      createdAt: m.createdAt || m.created_at,
    })),
  }
}

export async function getDocuments(filters, page, signal) {
  const query = new URLSearchParams()
  if (filters.type) query.set('type', filters.type.toUpperCase())
  if (filters.status) query.set('status', filters.status.toUpperCase())
  if (filters.category) query.set('category_id', filters.category)
  if (filters.location) query.set('location_id', filters.location)
  // The backend warehouse filter only checks the source. Fetch every matching
  // page and include either end so receipts and inbound transfers stay visible.
  if (filters.warehouse) {
    const documents = await allPages(
      `/dashboard/documents?${query}`,
      'documents',
      signal,
    )
    const rows = documents
      .map(mapDocument)
      .filter(
        (d) =>
          (d.warehouseId === filters.warehouse ||
            d.destinationId === filters.warehouse) &&
          (!filters.location ||
            d.sourceLocationId === filters.location ||
            d.destinationLocationId === filters.location),
      )
    return {
      rows: rows.slice((page - 1) * 8, page * 8),
      total: rows.length,
      totalPages: Math.ceil(rows.length / 8),
    }
  }
  query.set('page', page)
  query.set('limit', 8)
  const data = await httpRequest(`/dashboard/documents?${query}`, { signal })
  return {
    rows: data.documents.map(mapDocument),
    total: data.total,
    totalPages: data.totalPages,
  }
}

export async function getOperationWorkspace(
  warehouses,
  documentId,
  signal,
  editing = false,
) {
  if (documentId) {
    const operation = mapDocument(
      await httpRequest(`/operations/${documentId}`, { signal }),
    )
    if (editing) {
      const workspace = await getOperationWorkspace(warehouses, null, signal)
      const products = new Map(
        operation.lines.map((line) => [line.product.id, line.product]),
      )
      workspace.products.forEach((product) => products.set(product.id, product))
      return {
        ...workspace,
        products: [...products.values()],
        operations: [operation],
      }
    }
    return {
      warehouses,
      operations: [operation],
      products: operation.lines.map((line) => line.product),
    }
  }
  const products = await allPages('/products', 'products', signal)
  return {
    products: products.map((p) => ({
      id: id(p.id),
      name: p.name,
      sku: p.sku,
      unit: p.unit_of_measure,
    })),
    warehouses: warehouses.flatMap((w) =>
      (w.Locations || []).map((location) => ({
        id: id(location.id),
        name: `${w.name} / ${location.name}`,
      })),
    ),
    operations: [],
  }
}

export async function mutateOperation(action, payload) {
  if (action === 'createOperation' || action === 'editOperation') {
    const receipt = payload.type === 'Receipt'
    if (
      payload.type === 'Transfer' &&
      payload.warehouseId === payload.destinationId
    )
      throw new Error('Select different source and destination locations.')
    return httpRequest(
      action === 'editOperation' ? `/operations/${payload.id}` : '/operations',
      {
        method: action === 'editOperation' ? 'PATCH' : 'POST',
        body: {
          ...(action === 'createOperation'
            ? { type: payload.type.toUpperCase() }
            : {}),
          notes: payload.notes || null,
          partner_name: payload.partner || null,
          scheduled_date: payload.scheduledDate,
          source_location_id: receipt ? null : Number(payload.warehouseId),
          destination_location_id: receipt
            ? Number(payload.warehouseId)
            : payload.type === 'Transfer'
              ? Number(payload.destinationId)
              : null,
          lines: payload.lines.map((line) => ({
            product_id: Number(line.productId),
            quantity: Number(line.quantity),
          })),
        },
      },
    )
  }
  const endpoint =
    payload.status === 'Done'
      ? '/validate'
      : payload.status === 'Canceled'
        ? '/cancel'
        : ''
  return httpRequest(`/operations/${payload.id}${endpoint}`, {
    method: endpoint ? 'POST' : 'PATCH',
    ...(endpoint ? {} : { body: { status: payload.status.toUpperCase() } }),
  })
}
