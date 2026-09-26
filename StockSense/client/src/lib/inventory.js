export const operationTypes = ['Receipt', 'Delivery', 'Transfer', 'Adjustment']
export const statuses = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled']
export const units = ['Units', 'kg', 'Liters', 'Meters', 'Boxes']
export const quantityAt = (product, warehouseId) =>
  Number(product.stock?.[warehouseId] || 0)
export const totalStock = (product) =>
  Object.values(product.stock || {}).reduce(
    (sum, value) => sum + Number(value),
    0,
  )
export const stockStatus = (product) =>
  totalStock(product) === 0
    ? 'Out of stock'
    : totalStock(product) <= product.reorderLevel
      ? 'Low stock'
      : 'In stock'
export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : '—'
export const today = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export const warehouseName = (state, id) =>
  state.warehouses.find((warehouse) => warehouse.id === id)?.name || '—'

// This reducer is the JSON adapter's implementation, never imported by pages.
// The future backend must enforce these rules again within a transaction.
export function applyCommand(current, action, payload) {
  const state = structuredClone(current)
  const id = () => crypto.randomUUID()
  const nonnegative = (value, label) => {
    if (!Number.isFinite(Number(value)) || Number(value) < 0)
      throw new Error(`${label} must be a non-negative number.`)
  }
  const requireWarehouse = (value) => {
    if (!state.warehouses.some((w) => w.id === value))
      throw new Error('Select an existing warehouse.')
  }
  const addMovement = (productId, quantity, from, to, reference, type) =>
    state.movements.unshift({
      id: id(),
      productId,
      quantity,
      from,
      to,
      reference,
      type,
      createdAt: new Date().toISOString(),
    })

  if (action === 'saveProduct') {
    if (!payload.name.trim() || !payload.sku.trim() || !payload.category.trim())
      throw new Error('Name, SKU, and category are required.')
    if (
      state.products.some(
        (p) =>
          p.id !== payload.id &&
          p.sku.toLowerCase() === payload.sku.trim().toLowerCase(),
      )
    )
      throw new Error('A product with this SKU already exists.')
    nonnegative(payload.reorderLevel, 'Reorder level')
    const existing = state.products.find((p) => p.id === payload.id)
    const product = {
      id: existing?.id || id(),
      name: payload.name.trim(),
      sku: payload.sku.trim(),
      category: payload.category.trim(),
      unit: payload.unit,
      reorderLevel: Number(payload.reorderLevel),
      stock: existing?.stock || {},
    }
    if (!existing) {
      nonnegative(payload.initialStock, 'Initial stock')
      if (Number(payload.initialStock) > 0) {
        requireWarehouse(payload.warehouseId)
        product.stock[payload.warehouseId] = Number(payload.initialStock)
        addMovement(
          product.id,
          Number(payload.initialStock),
          'Opening balance',
          payload.warehouseId,
          'Opening stock',
          'Adjustment',
        )
      }
      state.products.push(product)
    } else
      state.products = state.products.map((p) =>
        p.id === product.id ? product : p,
      )
  } else if (action === 'saveWarehouse') {
    if (
      !payload.name.trim() ||
      !payload.code.trim() ||
      !payload.location.trim()
    )
      throw new Error('Name, code, and location are required.')
    if (
      state.warehouses.some(
        (w) =>
          w.id !== payload.id &&
          w.code.toLowerCase() === payload.code.trim().toLowerCase(),
      )
    )
      throw new Error('This warehouse code already exists.')
    const warehouse = {
      id: payload.id || id(),
      name: payload.name.trim(),
      code: payload.code.trim(),
      location: payload.location.trim(),
    }
    if (payload.id)
      state.warehouses = state.warehouses.map((w) =>
        w.id === payload.id ? warehouse : w,
      )
    else state.warehouses.push(warehouse)
  } else if (action === 'createOperation') {
    if (!operationTypes.includes(payload.type))
      throw new Error('Select an operation type.')
    requireWarehouse(payload.warehouseId)
    if (!payload.scheduledDate) throw new Error('Choose a scheduled date.')
    if (
      ['Receipt', 'Delivery'].includes(payload.type) &&
      !payload.partner.trim()
    )
      throw new Error('Supplier or customer is required.')
    if (payload.type === 'Transfer') {
      requireWarehouse(payload.destinationId)
      if (payload.destinationId === payload.warehouseId)
        throw new Error('Choose a different destination warehouse.')
    }
    if (!payload.lines?.length) throw new Error('Add at least one product.')
    if (
      new Set(payload.lines.map((line) => line.productId)).size !==
      payload.lines.length
    )
      throw new Error('Each product should appear only once.')
    for (const line of payload.lines) {
      if (!state.products.some((p) => p.id === line.productId))
        throw new Error('Choose a product for every line.')
      nonnegative(line.quantity, 'Quantity')
      if (payload.type !== 'Adjustment' && Number(line.quantity) === 0)
        throw new Error('Quantity must be greater than zero.')
    }
    const prefix = {
      Receipt: 'REC',
      Delivery: 'DEL',
      Transfer: 'INT',
      Adjustment: 'ADJ',
    }[payload.type]
    state.operations.unshift({
      ...payload,
      id: id(),
      reference: `${prefix}-${String(state.operations.length + 1).padStart(4, '0')}`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    })
  } else if (action === 'updateOperation') {
    const operation = state.operations.find((o) => o.id === payload.id)
    if (!operation) throw new Error('Operation not found.')
    const transitions = {
      Draft: ['Waiting', 'Canceled'],
      Waiting: ['Ready', 'Canceled'],
      Ready: ['Done', 'Canceled'],
    }
    if (!transitions[operation.status]?.includes(payload.status))
      throw new Error('This operation cannot move to that status.')
    if (payload.status === 'Done') {
      for (const line of operation.lines) {
        const product = state.products.find((p) => p.id === line.productId)
        const quantity = Number(line.quantity)
        const available = quantityAt(product, operation.warehouseId)
        if (
          ['Delivery', 'Transfer'].includes(operation.type) &&
          quantity > available
        )
          throw new Error(
            `Insufficient stock for ${product.name}: ${available} ${product.unit} available.`,
          )
        let from = operation.warehouseId
        let to = operation.destinationId
        let moved = quantity
        if (operation.type === 'Receipt') {
          product.stock[operation.warehouseId] = available + quantity
          from = operation.partner
          to = operation.warehouseId
        }
        if (operation.type === 'Delivery') {
          product.stock[operation.warehouseId] = available - quantity
          to = operation.partner
        }
        if (operation.type === 'Transfer') {
          product.stock[operation.warehouseId] = available - quantity
          product.stock[operation.destinationId] =
            quantityAt(product, operation.destinationId) + quantity
        }
        if (operation.type === 'Adjustment') {
          product.stock[operation.warehouseId] = quantity
          moved = quantity - available
          from = 'Inventory adjustment'
          to = operation.warehouseId
        }
        addMovement(
          product.id,
          moved,
          from,
          to,
          operation.reference,
          operation.type,
        )
      }
    }
    operation.status = payload.status
  } else throw new Error('Unsupported action.')
  return state
}
