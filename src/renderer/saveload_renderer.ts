import {
  ReduxStore,
  CleanReduxState,
  resetState,
  getCleanReduxState,
} from './redux/store'
import { fixState } from 'shared/fixState'
import ipcChannels from '../shared/ipc_channels'

// const SELECT_FILES = 'select-files'
const CACHED_STATE_KEY = 'cached-state'
const AUTO_SAVE_INTERVAL = 1000 // ms

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
    const lastState = JSON.parse(cachedState)
    fixState(lastState)
    store.dispatch(resetState(lastState))
  }
}

function saveState(state: CleanReduxState) {
  if (!!state) {
    localStorage.setItem(CACHED_STATE_KEY, JSON.stringify(state))
  }
}

export const autoSave = (store: ReduxStore) => {
  refreshLastSession(store)

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
