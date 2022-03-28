import { MidiMessage } from '../../shared/midi'
import { CleanReduxState } from '../../renderer/redux/store'
import { RealtimeState } from '../../renderer/redux/realtimeStore'
import { getActionID, SliderAction } from '../../renderer/redux/deviceState'
import {
  midiSetButtonAction,
  midiSetSliderAction,
  setActiveSceneIndex,
  setAutoSceneBombacity,
  setMaster,
  setBaseParams,
} from '../../renderer/redux/controlSlice'
import NodeLink from 'node-link'
import { PayloadAction } from '@reduxjs/toolkit'

interface MidiInput {
  id: string
  message: MidiMessage
}

// must uniquely identify a midi message source (for use in a hash table)
// does not need to be human readable. Just unique for a given action
function getInputID(msg: MidiMessage): string {
  if (msg.type === 'On' || msg.type === 'Off')
    return msg.channel + 'note' + msg.number.toString()
  if (msg.type === 'CC') return msg.channel + 'cc' + msg.number
  return 'unknown'
}

function getInput(msg: MidiMessage): MidiInput {
  return {
    id: getInputID(msg),
    message: msg,
  }
}

export function handleMessage(
  message: MidiMessage,
  state: CleanReduxState,
  rt_state: RealtimeState,
  nodeLink: NodeLink,
  dispatch: (action: PayloadAction<any>) => void,
  tapTempo: () => void
) {
  const input = getInput(message)
  const midiState = state.control.device

  if (midiState.isEditing && midiState.listening) {
    const listenType = midiState.listening.type
    if (listenType === 'setActiveSceneIndex' || listenType === 'tapTempo') {
      dispatch(
        midiSetButtonAction({
          inputID: input.id,
          action: midiState.listening,
        })
      )
    } else {
      if (input.message.type === 'CC') {
        dispatch(
          midiSetSliderAction({
            inputID: input.id,
            action: midiState.listening,
            options: {
              type: 'cc',
              min: 0,
              max: 1,
            },
          })
        )
      } else if (input.message.type === 'On') {
        const actionId = getActionID(midiState.listening)
        const existing: SliderAction | undefined =
          midiState.sliderActions[actionId]
        if (
          existing &&
          existing.inputID === input.id &&
          existing.options.type === 'note'
        ) {
          // if the note is already set, do nothing
        } else {
          dispatch(
            midiSetSliderAction({
              inputID: input.id,
              action: midiState.listening,
              options: {
                type: 'note',
                min: 0,
                max: 1,
                value: 'velocity',
                mode: 'hold',
              },
            })
          )
        }
      }
    }
  } else {
    const buttonAction = Object.entries(midiState.buttonActions).find(
      ([_actionId, action]) => action.inputID === input.id
    )?.[1]
    if (buttonAction) {
      if (input.message.type !== 'Off') {
        if (buttonAction.action.type === 'setActiveSceneIndex') {
          dispatch(
            setActiveSceneIndex({
              sceneType: buttonAction.action.sceneType,
              val: buttonAction.action.index,
            })
          )
        } else if (buttonAction.action.type === 'tapTempo') {
          tapTempo()
        }
      }
    }
    const sliderAction = Object.entries(midiState.sliderActions).find(
      ([_actionId, action]) => action.inputID === input.id
    )?.[1]
    if (sliderAction) {
      const action = sliderAction.action
      const getOldVal = () => {
        if (action.type === 'setAutoSceneBombacity') {
          return state.control.light.auto.bombacity
        } else if (action.type === 'setBpm') {
          return rt_state.time.bpm
        } else if (action.type === 'setBaseParam') {
          const mainSplitBaseParams =
            state.control.light.byId[state.control.light.active]?.splits[0]
              ?.baseParams
          return mainSplitBaseParams[action.paramKey] || 0.5
        } else if (action.type === 'setMaster') {
          return state.control.master
        } else return 0
      }
      const setNewVal = (newVal: number) => {
        if (action.type === 'setAutoSceneBombacity') {
          dispatch(
            setAutoSceneBombacity({
              sceneType: 'light',
              val: newVal,
            })
          )
        } else if (action.type === 'setMaster') {
          dispatch(setMaster(newVal))
        } else if (action.type === 'setBaseParam') {
          dispatch(
            setBaseParams({
              splitIndex: 0,
              params: {
                [action.paramKey]: newVal,
              },
            })
          )
        } else if (action.type === 'setBpm') {
          const newTempo = newVal * 70 + 70
          nodeLink.setTempo(newTempo)
        } else if (action.type === 'tapTempo') {
          tapTempo()
        }
      }
      const op = sliderAction.options
      const range = op.max - op.min
      if (op.type === 'cc') {
        if (input.message.type === 'CC') {
          setNewVal(op.min + (input.message.value / 127) * range)
        }
      } else if (op.type === 'note') {
        if (input.message.type === 'On') {
          const val =
            op.value === 'velocity'
              ? op.min + (input.message.velocity / 127) * range
              : op.max
          if (op.mode === 'hold') {
            setNewVal(val)
          } else if (op.mode === 'toggle') {
            if (getOldVal() > op.min) {
              setNewVal(op.min)
            } else {
              setNewVal(val)
            }
          }
        } else if (input.message.type == 'Off') {
          if (op.mode === 'hold') {
            setNewVal(op.min)
          }
        }
      }
    }
  }
}
