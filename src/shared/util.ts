export function clampNormalized(val: number) {
  if (val < 0.0) return 0.0
  if (val > 1.0) return 1.0
  return val
}

export function clamp(val: number, min: number, max: number) {
  if (val < min) return min
  if (val > max) return max
  return val
}

export function clampMaybe(val: number, min?: number, max?: number) {
  if (min !== undefined) {
    if (val < min) return min
  }
  if (max !== undefined) {
    if (val > max) return max
  }
  return val
}

export function randomElement<Type>(items: Type[]) {
  const randIndex = Math.floor(Math.random() * items.length)
  return items[randIndex]
}

export function randomElementExcludeCurrent<T>(items: T[], current: T) {
  const possibilities = items.filter((item) => item !== current)
  if (possibilities.length < 1) return current
  return randomElement(possibilities)
}

export function getFilename(path: string) {
  return path.substring(path.lastIndexOf('/') + 1)
}

export function lerp(start: number, stop: number, amt: number) {
  const delta = stop - start
  return start + delta * amt
}

export function indexArray(length: number) {
  return Array.from(Array(length).keys())
}

export function testSpeed(f: () => void, count: number, name: string) {
  const array = Array(count).fill(0)
  const startTime = Date.now()
  array.forEach(f)
  const endTime = Date.now()
  const duration = endTime - startTime
  console.log(`${name}: ${duration / count}ms per call`)
}

export function random(min: number, max?: number) {
  if (max === undefined) {
    return min * Math.random()
  }
  let range = max - min
  return min + Math.random() * range
}

export function randomBool() {
  return Math.random() > 0.5
}