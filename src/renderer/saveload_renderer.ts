import {
  ReduxStore,
  CleanReduxState,
  resetState,
  getCleanReduxState,
} from './redux/store'
import ipcChannels from '../shared/ipc_channels'

// const SELECT_FILES = 'select-files'
const CACHED_STATE_KEY = 'cached-state'
const AUTO_SAVE_INTERVAL = 1000 // ms

// Modify this function to fix any state changes between upgrades
export function fixState(state: CleanReduxState): CleanReduxState {
  const light = state.control.light

  const dmx = state.dmx
  dmx.universe.forEach((fixture) => {
    const ogGroups = fixture.groups
    if (ogGroups !== undefined) {
      fixture.group = ogGroups[0] ?? 'Default'
    }
    delete fixture.groups
  })

  dmx.activeGroups = Array.from(
    dmx.universe.reduce<Set<string>>((acc, fixture) => {
      acc.add(fixture.group)
      return acc
    }, new Set())
  )

  light.ids.forEach((id) => {
    const lightScene = light.byId[id]

    const ogBaseParams = lightScene.baseParams
    const ogRandomizer = lightScene.randomizer
    if (ogBaseParams !== undefined && ogRandomizer !== undefined) {
      lightScene.splits = lightScene.splitScenes
      lightScene.splits.unshift({
        baseParams: ogBaseParams,
        randomizer: ogRandomizer,
        groups: [],
      })
    }
    delete lightScene.splitScenes

    lightScene.modulators.forEach((modulator) => {
      const ogModulation = modulator.modulation
      if (ogModulation !== undefined) {
        modulator.splitModulations.unshift(ogModulation)
      }
      delete modulator.modulation
    })
  })
  return state
}

export const captivateFileFilters = {
  dmx: { name: 'captivate dmx', extensions: ['.cap_dmx'] },
  scenes: { name: 'captivate scenes', extensions: ['.cap_scenes'] },
}

// const videoFileFilters: Electron.FileFilter[] = [
//   { name: 'MP4', extensions: ['.mp4'] },
//   { name: 'OGG', extensions: ['.ogg'] },
//   { name: 'WebM', extensions: ['.webm'] },
// ]

function refreshLastSession(store: ReduxStore) {
  const cachedState = localStorage.getItem(CACHED_STATE_KEY)
  if (!!cachedState) {
    // const lastState: ReduxState = fixState( JSON.parse(cachedState) )
    const lastState: CleanReduxState = fixState(JSON.parse(cachedState))
    store.dispatch(resetState(lastState))
  }
}

function saveState(state: CleanReduxState) {
  if (!!state) {
    localStorage.setItem(CACHED_STATE_KEY, JSON.stringify(state))
  }
}

export const autoSave = (store: ReduxStore) => {
  // refreshLastSession(store)

  setInterval(() => {
    saveState(getCleanReduxState(store.getState()))
  }, AUTO_SAVE_INTERVAL)
}

// @ts-ignore: Typescript doesn't recognize the globals set in "src/main/preload.js"
const ipcRenderer = window.electron.ipcRenderer

export async function loadFile(
  title: string,
  fileFilters: Electron.FileFilter[]
): Promise<string> {
  return ipcRenderer.invoke(ipcChannels.load_file, title, fileFilters)
}

export async function saveFile(
  title: string,
  data: string,
  fileFilters: Electron.FileFilter[]
): Promise<NodeJS.ErrnoException> {
  return ipcRenderer.invoke(ipcChannels.save_file, title, data, fileFilters)
}

// export async function selectVideoFiles() {
//   return ipcRenderer.invoke(SELECT_FILES, 'Video Select', videoFileFilters)
// }
