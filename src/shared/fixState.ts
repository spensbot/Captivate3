import { CleanReduxState } from 'renderer/redux/store'
import { ControlState } from 'renderer/redux/controlSlice'
import { DmxState } from 'renderer/redux/dmxSlice'

export function fixControlState(control: ControlState) {
  const light = control.light
  light.ids.forEach((id) => {
    const lightScene = light.byId[id]

    //@ts-ignore
    const ogBaseParams = lightScene.baseParams
    //@ts-ignore
    const ogRandomizer = lightScene.randomizer
    if (ogBaseParams !== undefined && ogRandomizer !== undefined) {
      //@ts-ignore
      lightScene.splits = lightScene.splitScenes
      lightScene.splits.unshift({
        baseParams: ogBaseParams,
        randomizer: ogRandomizer,
        groups: [],
      })
    }
    //@ts-ignore
    delete lightScene.splitScenes

    lightScene.modulators.forEach((modulator) => {
      //@ts-ignore
      const ogModulation = modulator.modulation
      if (ogModulation !== undefined) {
        modulator.splitModulations.unshift(ogModulation)
      }
      //@ts-ignore
      delete modulator.modulation
    })
  })
}

export function fixDmxState(dmx: DmxState) {
  dmx.universe.forEach((fixture) => {
    //@ts-ignore
    const ogGroups = fixture.groups
    if (ogGroups !== undefined) {
      fixture.group = ogGroups[0] ?? 'Default'
    }
    //@ts-ignore
    delete fixture.groups
  })

  dmx.activeGroups = Array.from(
    dmx.universe.reduce<Set<string>>((acc, fixture) => {
      acc.add(fixture.group)
      return acc
    }, new Set())
  )
}

// Modify this function to fix any state changes between upgrades
export function fixState(state: CleanReduxState) {
  fixControlState(state.control)
  fixDmxState(state.dmx)
}
