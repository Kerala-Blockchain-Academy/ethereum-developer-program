export interface ExpressError extends Error {
  code?: string
  errno?: number
  path?: string
  status?: number
  syscall?: string
}
