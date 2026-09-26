export const createOperation = (mutate, payload) =>
  mutate("createOperation", payload, "Operation saved as draft");
export const updateOperation = (mutate, id, status) =>
  mutate(
    "updateOperation",
    { id, status },
    status === "Done"
      ? "Operation validated. Stock and move history updated."
      : `Operation moved to ${status.toLowerCase()}`,
  );
