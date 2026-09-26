export const saveProduct = (mutate, payload) =>
  mutate(
    'saveProduct',
    payload,
    payload.id ? 'Product updated' : 'Product created',
  )
