/** A completed transaction must never be described as an unsaved answer. */
export class AnswerRefreshError extends Error {
  readonly refresh: () => Promise<unknown>
  constructor(refresh: () => Promise<unknown>, cause: unknown) {
    super('Answer saved; view refresh failed', {cause})
    this.refresh = refresh
  }
}
export async function saveAnswerAndRefresh(save: () => Promise<unknown>, refresh: () => Promise<unknown>): Promise<void> {
  await save()
  try { await refresh() } catch (cause) { throw new AnswerRefreshError(refresh, cause) }
}
