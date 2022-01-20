import styled from 'styled-components'
import { useDmxSelector } from '../redux/store'
import { useDispatch } from 'react-redux'
import { indexArray } from '../../util/util'
import Select from '../base/Select'
import {
  FixtureChannel,
  channelTypes,
  initFixtureChannel,
} from '../../engine/dmxFixtures'
import { colorList, Color } from '../../engine/dmxColors'
import NumberField from '../base/NumberField'
import {
  editFixtureChannel,
  addFixtureChannel,
  removeFixtureChannel,
} from '../redux/dmxSlice'
import { IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

interface Props {
  fixtureID: string
  isInUse: boolean
}

export default function FixtureChannels({ fixtureID, isInUse }: Props) {
  const channelCount = useDmxSelector(
    (state) => state.fixtureTypesByID[fixtureID].channels.length
  )
  const hasMaster = useDmxSelector((state) =>
    state.fixtureTypesByID[fixtureID].channels.find(
      (ch) => ch.type === 'master'
    )
      ? true
      : false
  )
  const dispatch = useDispatch()

  const indexes = indexArray(channelCount)

  const addChannelButton = isInUse ? null : (
    <IconButton
      onClick={() =>
        dispatch(
          addFixtureChannel({
            fixtureID: fixtureID,
            newChannel: hasMaster
              ? initFixtureChannel('other')
              : initFixtureChannel('master'),
          })
        )
      }
    >
      <AddIcon />
    </IconButton>
  )

  return (
    <Root>
      <Header>
        <Title>Channels</Title>
        {addChannelButton}
      </Header>
      <Channels>
        {indexes.map((channelIndex) => (
          <Channel
            key={channelIndex}
            fixtureID={fixtureID}
            channelIndex={channelIndex}
            hasMaster={hasMaster}
          />
        ))}
      </Channels>
    </Root>
  )
}

const Root = styled.div``

const Header = styled.div`
  display: flex;
  align-items: center;
`

const Title = styled.span`
  font-size: 1.2rem;
  margin: 0.5rem 0;
`

const Channels = styled.div`
  background-color: ${(props) => props.theme.colors.bg.darker};
`

interface Props2 {
  fixtureID: string
  channelIndex: number
  hasMaster: boolean
}

function Channel({ fixtureID, channelIndex, hasMaster }: Props2) {
  const ch = useDmxSelector(
    (state) => state.fixtureTypesByID[fixtureID].channels[channelIndex]
  )
  const dispatch = useDispatch()

  return (
    <Root2>
      {channelIndex + 1}
      <Sp2 />
      <Select
        label="Channel Type"
        val={ch.type}
        items={
          hasMaster && ch.type !== 'master'
            ? channelTypes.slice(1)
            : channelTypes
        }
        onChange={(newType) =>
          dispatch(
            editFixtureChannel({
              fixtureID: fixtureID,
              channelIndex: channelIndex,
              newChannel: initFixtureChannel(newType),
            })
          )
        }
      />
      <Sp2 />
      <Fields
        ch={ch}
        fixtureID={fixtureID}
        channelIndex={channelIndex}
        hasMaster={hasMaster}
      />
      <Sp />
      <IconButton
        onClick={() =>
          dispatch(
            removeFixtureChannel({
              fixtureID: fixtureID,
              channelIndex: channelIndex,
            })
          )
        }
      >
        <RemoveIcon />
      </IconButton>
    </Root2>
  )
}

const Root2 = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`

const Sp = styled.div`
  flex: 1 0 0;
`

const Sp2 = styled.div`
  width: 1rem;
`

interface Props3 extends Props2 {
  ch: FixtureChannel
}

function Fields({ ch, fixtureID, channelIndex }: Props3) {
  const dispatch = useDispatch()

  function updateChannel(newChannel: FixtureChannel) {
    dispatch(
      editFixtureChannel({
        fixtureID: fixtureID,
        channelIndex: channelIndex,
        newChannel: newChannel,
      })
    )
  }

  if (ch.type === 'color') {
    return (
      <Select
        label="color"
        val={ch.color}
        items={colorList}
        onChange={(newColor) =>
          updateChannel({
            type: 'color',
            color: newColor as Color,
          })
        }
      />
    )
  } else if (ch.type === 'master') {
    return null
  } else if (ch.type === 'other') {
    return (
      <NumberField
        val={ch.default}
        label="Default"
        min={1}
        max={255}
        onChange={(newVal) =>
          updateChannel({
            type: 'other',
            default: newVal,
          })
        }
      />
    )
  } else if (ch.type === 'strobe') {
    return (
      <>
        <NumberField
          val={ch.default_solid}
          label="Solid"
          min={1}
          max={255}
          onChange={(newVal) =>
            updateChannel({
              ...ch,
              default_solid: newVal,
            })
          }
        />
        <Sp2 />
        <NumberField
          val={ch.default_strobe}
          label="Strobe"
          min={1}
          max={255}
          onChange={(newVal) =>
            updateChannel({
              ...ch,
              default_strobe: newVal,
            })
          }
        />
      </>
    )
  } else {
    return null
  }
}