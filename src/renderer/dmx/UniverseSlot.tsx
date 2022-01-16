import styled from 'styled-components'
import { useTypedSelector } from '../redux/store'
import { Fixture } from '../../engine/dmxFixtures'
import { Slot_t } from './MyUniverse'
import { useDispatch } from 'react-redux'
import { setSelectedFixture, setFixtureWindowEnabled } from '../redux/dmxSlice'
import ToggleButton from '../base/ToggleButton'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'

function ChannelSpan({ start, count }: { start: number; count: number }) {
  const end = start + count - 1
  return count == 1 ? (
    <div style={{ fontSize: '0.8rem' }}>{start}</div>
  ) : (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
      }}
    >
      <div>{start}</div>
      <div>-</div>
      <div>{end}</div>
    </div>
  )
}

function GapSlot({ ch, count }: { ch: number; count: number }) {
  const start = ch
  // const end = start + count - 1
  // const channelString = (count > 1) ? `${start} ... ${end}` : `${start}`
  return (
    <Slot style={{ backgroundColor: '#000a' }}>
      <GSRoot>
        <ChannelSpan start={start} count={count} />
      </GSRoot>
    </Slot>
  )
}

const GSRoot = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
`

function FixtureSlot({ fixture, index }: { fixture: Fixture; index: number }) {
  const fixtureType = useTypedSelector(
    (state) => state.dmx.fixtureTypesByID[fixture.type]
  )
  const selectedFixture = useTypedSelector((state) => state.dmx.selectedFixture)
  const dispatch = useDispatch()
  const count = fixtureType.channels.length
  const start = fixture.ch
  const isSelected = selectedFixture === index
  function setWindowEnabled(dimension: 'x' | 'y', isEnabled: boolean) {
    return (e: React.MouseEvent) => {
      dispatch(
        setFixtureWindowEnabled({
          dimension: dimension,
          index: index,
          isEnabled: isEnabled,
        })
      )
    }
  }
  return (
    <Slot
      onClick={() => {
        dispatch(setSelectedFixture(index))
      }}
    >
      <ChannelSpan start={start} count={count} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>{fixtureType.name}</div>
      </div>
      {isSelected ? (
        <div style={{ display: 'flex', fontSize: '0.9rem', zIndex: 1 }}>
          <ToggleButton
            isEnabled={!!fixture.window.x}
            onClick={setWindowEnabled('x', !fixture.window.x)}
          >
            X
          </ToggleButton>
          <ToggleButton
            isEnabled={!!fixture.window.y}
            onClick={setWindowEnabled('y', !fixture.window.y)}
          >
            Y
          </ToggleButton>
        </div>
      ) : (
        <div style={{ fontSize: '0.8rem', color: 'fff7' }}>
          {fixtureType.manufacturer}
        </div>
      )}
    </Slot>
  )
}

export default function UniverseSlot({ slot }: { slot: Slot_t }) {
  switch (slot.kind) {
    case 'gap':
      return <GapSlot ch={slot.ch} count={slot.count} />
    case 'fixture':
      return <FixtureSlot fixture={slot.fixture} index={slot.index} />
  }
}

const height = 5
const width = 7

const Slot = styled.div`
  height: ${height}rem;
  padding: 0.5rem;
  min-width: ${width}rem;
  margin-right: 0.3rem;
  margin-bottom: 0.3rem;
  color: #fff8;
  background-color: '#000';
  display: 'flex';
  justify-content: 'center';
  align-items: 'center';
  border: 1px solid #fff8;
  :hover {
    border: 1px solid #fffc;
    cursor: pointer;
    color: #fffc;
  }
  box-sizing: border-box;
`
