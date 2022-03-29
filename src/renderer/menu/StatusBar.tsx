import React from 'react'
import Counter2 from './Counter2'
import ConnectionStatus from './ConnectionStatus'
import { useRealtimeSelector } from '../redux/realtimeStore'
import useDragBasic from '../hooks/useDragBasic'
import styled from 'styled-components'
import { SliderMidiOverlay } from '../base/MidiOverlay'
import UndoRedo from 'renderer/controls/UndoRedo'
import UsbIcon from '@mui/icons-material/Usb'
import IconButton from '@mui/material/IconButton'
import PianoIcon from '@mui/icons-material/Piano'
import { useDeviceSelector, useTypedSelector } from '../redux/store'
import { useDispatch } from 'react-redux'
import { midiSetIsEditing } from '../redux/controlSlice'
import { setConnectionsMenu } from '../redux/guiSlice'
import { ControlState } from '../redux/controlSlice'
import { store, resetControl } from '../redux/store'
import { loadFile, saveFile, captivateFileFilters } from '../saveload_renderer'
import SaveIcon from '@mui/icons-material/Save'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import { send_user_command } from '../ipcHandler'
import TapTempo from './TapTempo'
import PlayPauseButton from './PlayPauseButton'
import { fixControlState } from 'shared/fixState'

type SaveType = ControlState

function loadScenes() {
  loadFile('Load Scenes', [captivateFileFilters.scenes])
    .then((serializedControlState) => {
      const newControlState: SaveType = JSON.parse(serializedControlState)
      fixControlState(newControlState)

      store.dispatch(
        resetControl({
          device: store.getState().control.present.device,
          master: 1,
          light: newControlState.light,
          visual: newControlState.visual,
        })
      )
    })
    .catch((err) => {
      console.error(err)
    })
}

function saveScenes() {
  const controlState: SaveType = store.getState().control.present
  const serializedControlState = JSON.stringify(controlState)
  saveFile('Save Scenes', serializedControlState, [captivateFileFilters.scenes])
    .then((err) => {
      if (err) {
        console.error(err)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}

function BPM() {
  const bpm = useRealtimeSelector((state) => state.time.bpm)

  const [dragContainer, onMouseDown] = useDragBasic((e) => {
    const dx = e.movementX / 3
    const dy = -e.movementY / 3
    send_user_command({ type: 'IncrementTempo', amount: dx + dy })
  })

  return (
    <SliderMidiOverlay action={{ type: 'setBpm' }}>
      <div
        ref={dragContainer}
        onMouseDown={onMouseDown}
        style={{
          margin: '0 1rem 0 0',
          cursor: 'nesw-resize',
          userSelect: 'none',
        }}
      >
        {`${Math.round(bpm)} BPM`}
      </div>
    </SliderMidiOverlay>
  )
}

function LinkButton() {
  const numPeers = useRealtimeSelector((state) => state.time.numPeers)
  const isEnabled = useRealtimeSelector((state) => state.time.isEnabled)

  const style: React.CSSProperties = {
    backgroundColor: isEnabled ? '#3d5a' : '#fff3',
    color: isEnabled ? '#eee' : '#fff9',
    borderRadius: '0.3rem',
    padding: '0.2rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginRight: '0.5rem',
  }

  return (
    <div
      onClick={() => {
        send_user_command({ type: 'SetLinkEnabled', isEnabled: !isEnabled })
      }}
      style={style}
    >
      Link{isEnabled ? `: ${numPeers}` : ''}
    </div>
  )
}

export default function StatusBar() {
  const isEditing = useDeviceSelector((state) => state.isEditing)
  const connectionMenu = useTypedSelector((state) => state.gui.connectionMenu)
  const dispatch = useDispatch()
  const midiConnected = useTypedSelector(
    (state) => state.gui.midi.connected.length > 0
  )

  return (
    <Root>
      <PlayPauseButton />
      <div style={{ width: '0.5rem' }} />
      <LinkButton />
      <TapTempo />
      <div style={{ width: '0.2rem' }} />
      <BPM />
      <Counter2 />
      <UndoRedo />
      <div style={{ flex: '1 0 0' }} />
      {midiConnected && (
        <IconButton onClick={() => dispatch(midiSetIsEditing(!isEditing))}>
          <PianoIcon />
        </IconButton>
      )}
      <IconButton onClick={() => dispatch(setConnectionsMenu(!connectionMenu))}>
        <UsbIcon />
      </IconButton>
      <IconButton onClick={saveScenes}>
        <SaveIcon />
      </IconButton>
      <IconButton onClick={loadScenes}>
        <FileOpenIcon />
      </IconButton>
      <Connections>
        <ConnectionStatus type={'midi'} />
        <ConnectionStatus type={'dmx'} />
      </Connections>
      {/* <IconButton>
        <CableIcon />
      </IconButton>
      <IconButton>
        <SettingsIcon />
      </IconButton>
      <IconButton>
        <SettingsInputSvideoIcon />
      </IconButton> */}
    </Root>
  )
}

const Root = styled.div`
  display: flex;
  justify-content: right;
  align-items: center;
  font-size: 1.2rem;
  padding: 0.2rem 1rem 0.2rem 0.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.divider};
  background-color: ${(props) => props.theme.colors.bg.primary};
`

const Connections = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`
