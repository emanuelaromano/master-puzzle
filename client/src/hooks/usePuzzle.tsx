import { useState, useEffect, useCallback } from 'react'

const MET_OBJECTS_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'
const MET_OBJECT_IDS_URL = `${MET_OBJECTS_BASE}/objects?departmentIds=11%7C21`
const OBJECT_IDS_CACHE_KEY = 'puzzle-met-object-ids'
const OBJECT_IDS_CACHE_MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000 // 2 months
const PUZZLE_LOG_PREFIX = '[puzzle-api]'

function logPuzzleApi(message: string, meta?: unknown) {
  if (meta === undefined) {
    console.info(`${PUZZLE_LOG_PREFIX} ${message}`)
    return
  }
  console.info(`${PUZZLE_LOG_PREFIX} ${message}`, meta)
}

export type MetObject = {
  objectID: number
  primaryImage: string
  primaryImageSmall?: string
  title?: string
  artistDisplayName?: string
  country?: string
  objectDate?: string
}

export async function fetchObject(objectID: number): Promise<MetObject | null> {
  const endpoint = `${MET_OBJECTS_BASE}/objects/${objectID}`
  logPuzzleApi('GET object', { endpoint, objectID })
  const res = await fetch(endpoint)
  logPuzzleApi('GET object response', { endpoint, objectID, status: res.status, ok: res.ok })
  if (!res.ok) return null
  const data = (await res.json()) as { objectID?: number; primaryImage?: string; [key: string]: unknown }
  logPuzzleApi('GET object parsed', {
    endpoint,
    objectID: data?.objectID,
    hasPrimaryImage: Boolean(data?.primaryImage),
    hasPrimaryImageSmall: typeof data?.primaryImageSmall === 'string',
  })
  if (data?.primaryImage && data?.objectID != null) {
    return {
      objectID: data.objectID,
      primaryImage: data.primaryImage,
      primaryImageSmall: typeof data.primaryImageSmall === 'string' ? data.primaryImageSmall : undefined,
      title: typeof data.title === 'string' ? data.title : undefined,
      artistDisplayName: typeof data.artistDisplayName === 'string' ? data.artistDisplayName : undefined,
      country: typeof data.country === 'string' ? data.country : undefined,
      objectDate: typeof data.objectDate === 'string' ? data.objectDate : undefined,
    }
  }
  return null
}

type ObjectIdsCache = { objectIDs: number[]; fetchedAt: number }
type MetObjectIdsResponse = { total?: number; objectIDs?: number[] }

function getObjectIdsFromStorage(): number[] | null {
  try {
    const raw = localStorage.getItem(OBJECT_IDS_CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw) as ObjectIdsCache
    if (!Array.isArray(cached?.objectIDs)) return null
    const age = Date.now() - (cached.fetchedAt ?? 0)
    if (age > OBJECT_IDS_CACHE_MAX_AGE_MS) return null
    const ids = cached.objectIDs.filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
    logPuzzleApi('object IDs from cache', { count: ids.length, ageDays: Math.round(age / (24 * 60 * 60 * 1000)) })
    return ids
  } catch {
    return null
  }
}

function saveObjectIdsToStorage(objectIDs: number[]) {
  try {
    const payload: ObjectIdsCache = { objectIDs, fetchedAt: Date.now() }
    localStorage.setItem(OBJECT_IDS_CACHE_KEY, JSON.stringify(payload))
    logPuzzleApi('object IDs saved to cache', { count: objectIDs.length })
  } catch {
    // ignore
  }
}

let cachedObjectIds: number[] | null = null
let objectIdsRequest: Promise<number[]> | null = null

async function loadObjectIds(): Promise<number[]> {
  if (cachedObjectIds) return cachedObjectIds
  const fromStorage = getObjectIdsFromStorage()
  if (fromStorage != null && fromStorage.length > 0) {
    cachedObjectIds = fromStorage
    return fromStorage
  }
  if (!objectIdsRequest) {
    objectIdsRequest = fetch(MET_OBJECT_IDS_URL)
      .then(async (res) => {
        logPuzzleApi('GET object IDs', { url: MET_OBJECT_IDS_URL })
        logPuzzleApi('GET object IDs response', { status: res.status, ok: res.ok })
        if (!res.ok) return []
        const data = (await res.json()) as MetObjectIdsResponse
        const ids = Array.isArray(data.objectIDs)
          ? data.objectIDs.filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
          : []
        logPuzzleApi('GET object IDs parsed', { count: ids.length })
        if (ids.length > 0) saveObjectIdsToStorage(ids)
        cachedObjectIds = ids
        return ids
      })
      .finally(() => {
        objectIdsRequest = null
      })
  }
  return objectIdsRequest
}

function pickRandomId(ids: number[], excludeId?: number): number | null {
  const candidatePool = excludeId == null ? ids : ids.filter((id) => id !== excludeId)
  if (candidatePool.length === 0) return null
  const idx = Math.floor(Math.random() * candidatePool.length)
  return candidatePool[idx]
}

async function fetchRandomObject(excludeId?: number, maxAttempts = 12): Promise<MetObject | null> {
  const ids = await loadObjectIds()
  if (ids.length === 0) {
    logPuzzleApi('random object failed', { reason: 'empty object ID list' })
    return null
  }
  const attemptsLimit = Math.max(1, Math.min(maxAttempts, ids.length))
  const tried = new Set<number>()
  while (tried.size < attemptsLimit) {
    const id = pickRandomId(ids, excludeId)
    if (id == null || tried.has(id)) continue
    tried.add(id)
    logPuzzleApi('random object attempt', { attempt: tried.size, objectID: id, attemptsLimit })
    const obj = await fetchObject(id)
    if (obj) return obj
  }
  logPuzzleApi('random object failed', { reason: 'no valid object found', attempts: tried.size })
  return null
}

export const PUZZLE_SEED_KEY = 'puzzle-seed'
const MET_OBJECT_KEY = 'puzzle-met-object'

function placedSlotsStorageKey(seed: string) {
  return `puzzle-placed-${seed}`
}

function getPlacedSlotsFromStorage(seed: string): Set<number> {
  try {
    const raw = localStorage.getItem(placedSlotsStorageKey(seed))
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as number[]
    return Array.isArray(arr) ? new Set(arr) : new Set()
  } catch {
    return new Set()
  }
}

function savePlacedSlotsToStorage(seed: string, slots: Set<number>) {
  localStorage.setItem(placedSlotsStorageKey(seed), JSON.stringify([...slots]))
}

function getStoredMetObject(): MetObject | null {
  try {
    const raw = localStorage.getItem(MET_OBJECT_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw) as MetObject
    logPuzzleApi('localStorage met object read', {
      key: MET_OBJECT_KEY,
      objectID: obj?.objectID,
      hasPrimaryImage: Boolean(obj?.primaryImage),
      hasPrimaryImageSmall: Boolean(obj?.primaryImageSmall),
    })
    return obj?.primaryImage && obj?.objectID != null ? obj : null
  } catch {
    return null
  }
}

function saveMetObjectToStorage(obj: MetObject) {
  localStorage.setItem(MET_OBJECT_KEY, JSON.stringify(obj))
  localStorage.setItem(PUZZLE_SEED_KEY, String(obj.objectID))
}

export type PuzzleGrid = {
  workW: number
  workH: number
  cells: [number, number][][]
}

export type PendingDrop = { pieceId: number; clientX: number; clientY: number } | null

export type PieceImageData = { src: string; x: number; y: number; width: number; height: number }

type PuzzleState = {
  seed: string
  metObject: MetObject | null
  grid: PuzzleGrid | null
  pieceImages: Record<number, PieceImageData>
  pieceError: string | null
  /** URL of the image actually used for cutting (may differ from primaryImage if fallback was used) */
  resolvedImageUrl: string | null
  /** Full image as data URL, captured when we load for cutting — use on completion so we never refetch */
  fullImageDataUrl: string | null
  placedSlots: Set<number>
  pendingDrop: PendingDrop
  newSeedLoading: boolean
  newSeedError: string | null
}

function getInitialState(): PuzzleState {
  const met = getStoredMetObject()
  const seed = met ? String(met.objectID) : ''
  return {
    seed,
    metObject: met,
    grid: null,
    pieceImages: {},
    pieceError: null,
    resolvedImageUrl: null,
    fullImageDataUrl: null,
    placedSlots: seed ? getPlacedSlotsFromStorage(seed) : new Set(),
    pendingDrop: null,
    newSeedLoading: false,
    newSeedError: null,
  }
}

let state: PuzzleState = getInitialState()
const listeners = new Set<(value: PuzzleState) => void>()

function notifyListeners() {
  listeners.forEach((notify) => notify(state))
}

function setPuzzleGridGlobal(grid: PuzzleGrid | null) {
  state = {
    ...state,
    grid,
    resolvedImageUrl: grid == null ? null : state.resolvedImageUrl,
    fullImageDataUrl: grid == null ? null : state.fullImageDataUrl,
    placedSlots: getPlacedSlotsFromStorage(state.seed),
    pendingDrop: null,
  }
  notifyListeners()
}

function setResolvedImageUrlGlobal(url: string | null) {
  state = { ...state, resolvedImageUrl: url }
  notifyListeners()
}

function setFullImageDataUrlGlobal(dataUrl: string | null) {
  state = { ...state, fullImageDataUrl: dataUrl }
  notifyListeners()
}

function setPieceImagesGlobal(images: Record<number, PieceImageData>) {
  state = { ...state, pieceImages: images }
  notifyListeners()
}

function setPieceErrorGlobal(pieceError: string | null) {
  state = { ...state, pieceError }
  notifyListeners()
}

function setPlacedSlotGlobal(slotIndex: number) {
  const nextPlaced = new Set(state.placedSlots).add(slotIndex)
  state = {
    ...state,
    placedSlots: nextPlaced,
  }
  savePlacedSlotsToStorage(state.seed, nextPlaced)
  notifyListeners()
}

function setPendingDropGlobal(pending: PendingDrop) {
  state = { ...state, pendingDrop: pending }
  notifyListeners()
}

function clearPendingDropGlobal() {
  state = { ...state, pendingDrop: null }
  notifyListeners()
}

function setSeedAndMetObjectGlobal(metObject: MetObject) {
  localStorage.removeItem(placedSlotsStorageKey(state.seed))
  const seed = String(metObject.objectID)
  saveMetObjectToStorage(metObject)
  state = {
    ...state,
    seed,
    metObject,
    grid: null,
    pieceImages: {},
    pieceError: null,
    resolvedImageUrl: null,
    fullImageDataUrl: null,
    placedSlots: new Set(),
    pendingDrop: null,
  }
  notifyListeners()
}

function loadMetObjectByIdGlobal(objectID: number) {
  fetchObject(objectID).then((obj) => {
    if (obj) setSeedAndMetObjectGlobal(obj)
  })
}

export function usePuzzle() {
  const [localState, setLocal] = useState<PuzzleState>(() => state)

  useEffect(() => {
    listeners.add(setLocal)
    return () => {
      listeners.delete(setLocal)
    }
  }, [])

  const setPuzzleGrid = useCallback((grid: PuzzleGrid | null) => {
    setPuzzleGridGlobal(grid)
  }, [])

  const setPieceImages = useCallback((images: Record<number, PieceImageData>) => {
    setPieceImagesGlobal(images)
  }, [])

  const setResolvedImageUrl = useCallback((url: string | null) => {
    setResolvedImageUrlGlobal(url)
  }, [])

  const setFullImageDataUrl = useCallback((dataUrl: string | null) => {
    setFullImageDataUrlGlobal(dataUrl)
  }, [])

  const setPieceError = useCallback((pieceError: string | null) => {
    setPieceErrorGlobal(pieceError)
  }, [])

  const setPlacedSlot = useCallback((slotIndex: number) => {
    setPlacedSlotGlobal(slotIndex)
  }, [])

  const setPendingDrop = useCallback((pending: PendingDrop) => {
    setPendingDropGlobal(pending)
  }, [])

  const clearPendingDrop = useCallback(() => {
    clearPendingDropGlobal()
  }, [])

  const newSeed = useCallback(() => {
    state = { ...state, newSeedLoading: true, newSeedError: null }
    notifyListeners()
    const currentSeedId = Number(state.seed)
    fetchRandomObject(Number.isNaN(currentSeedId) ? undefined : currentSeedId)
      .then((obj) => {
        if (obj) {
          setSeedAndMetObjectGlobal(obj)
          state = { ...state, newSeedLoading: false, newSeedError: null }
        } else {
          state = { ...state, newSeedLoading: false, newSeedError: 'Failed to pick a valid puzzle from object IDs' }
        }
        notifyListeners()
      })
      .catch((err) => {
        state = {
          ...state,
          newSeedLoading: false,
          newSeedError: err instanceof Error ? err.message : 'Failed to load new puzzle',
        }
        notifyListeners()
      })
  }, [])

  useEffect(() => {
    if (localState.metObject) return
    if (localState.seed) {
      const id = Number(localState.seed)
      if (!Number.isNaN(id)) loadMetObjectByIdGlobal(id)
      return
    }
    fetchRandomObject().then((obj) => {
      if (obj) setSeedAndMetObjectGlobal(obj)
    })
  }, [localState.seed, localState.metObject])

  return {
    seed: localState.seed,
    metObject: localState.metObject,
    newSeed,
    newSeedLoading: localState.newSeedLoading,
    newSeedError: localState.newSeedError,
    puzzleGrid: localState.grid,
    setPuzzleGrid,
    pieceImages: localState.pieceImages,
    setPieceImages,
    pieceError: localState.pieceError,
    setPieceError,
    resolvedImageUrl: localState.resolvedImageUrl,
    setResolvedImageUrl,
    fullImageDataUrl: localState.fullImageDataUrl,
    setFullImageDataUrl,
    placedSlots: localState.placedSlots,
    setPlacedSlot,
    pendingDrop: localState.pendingDrop,
    setPendingDrop,
    clearPendingDrop,
  }
}
