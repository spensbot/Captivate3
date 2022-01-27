import { TimeState, isNewPeriod } from './TimeState'

type Normalized = number

export interface Point {
  level: Normalized
  rising: boolean
}

export type RandomizerState = Point[]

export function initRandomizerOptions() {
  return {
    triggerPeriod: 1,
    triggerDensity: 0.3,
    riseTime: 20,
    fallTime: 300,
    envelopeRatio: 0.1,
    envelopeDuration: 500,
  }
}

export type RandomizerOptions = ReturnType<typeof initRandomizerOptions>

function initPoint(): Point {
  return {
    level: 0,
    rising: false,
  }
}

export function initRandomizerState(): RandomizerState {
  return []
}

export function syncAndUpdate(
  state: RandomizerState,
  size: number,
  ts: TimeState,
  options: RandomizerOptions
) {
  return update(sync(state, size), ts, options)
}

// returns a new randomizerState with the desired size. Growing or shrinking as necessary
function sync(state: RandomizerState, size: number) {
  const syncedState: Point[] = []
  Array(size)
    .fill(0)
    .forEach((_, i) => {
      let oldState = state[i]
      syncedState[i] = oldState ?? initPoint()
    })
  return syncedState
}

// returns the desired amount of random indexes
function pickRandomIndexes(randCount: number, size: number) {
  const randomIndexes: number[] = []
  const availableIndexes = Array.from(Array(size).keys())
  for (let i = 0; i < randCount; i++) {
    // Old method
    // const randomIndex = Math.floor(Math.random() * size)
    // randomIndexes.push(randomIndex)

    const index = Math.floor(Math.random() * availableIndexes.length)
    const randomIndex = availableIndexes[index]
    availableIndexes.splice(index, 1)
    randomIndexes.push(randomIndex)
  }
  return randomIndexes
}

function update(
  state: RandomizerState,
  ts: TimeState,
  {
    triggerPeriod,
    triggerDensity,
    envelopeRatio,
    envelopeDuration,
  }: RandomizerOptions
) {
  const riseTime = envelopeDuration * envelopeRatio
  const fallTime = envelopeDuration - riseTime
  const nextState = state.map<Point>(({ level, rising }) => {
    if (rising) {
      const newLevel = level + ts.dt / riseTime
      if (newLevel > 1) {
        return {
          level: 1,
          rising: false,
        }
      } else {
        return {
          level: newLevel,
          rising: true,
        }
      }
    } else {
      const newLevel = level - ts.dt / fallTime
      return {
        level: newLevel < 0 ? 0 : newLevel,
        rising: false,
      }
    }
  })

  if (isNewPeriod(ts, triggerPeriod)) {
    let randCount = Math.ceil(state.length * triggerDensity)
    if (randCount === 0 && state.length > 0) randCount = 1
    pickRandomIndexes(randCount, state.length).forEach(
      (index) => (nextState[index].rising = true)
    )
  }

  return nextState
}
