import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import RemoveIcon from '@mui/icons-material/Remove'
import { useState } from 'react'
import { useActiveLightScene, useDmxSelector } from 'renderer/redux/store'
import styled from 'styled-components'
import Popup from '../base/Popup'
import { useDispatch } from 'react-redux'
import {
  removeSplitSceneByIndex,
  addSplitSceneGroup,
  removeSplitSceneGroup,
} from 'renderer/redux/controlSlice'
import { getSplitGroups } from 'shared/dmxUtil'

interface Props {
  splitIndex: number
}

export default function GroupSelection({ splitIndex }: Props) {
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const splitGroups = useActiveLightScene(
    (scene) => scene.splits[splitIndex].groups
  )
  const splitGroupsString = splitGroups.join(', ')

  const isMain = splitIndex === 0

  let groupsString =
    splitGroups.length > 0
      ? `Groups: ${splitGroupsString}`
      : isMain
      ? `All Groups`
      : `No Groups`

  return (
    <Root>
      {splitIndex !== 0 && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault()
            dispatch(removeSplitSceneByIndex(splitIndex))
          }}
        >
          <RemoveIcon />
        </IconButton>
      )}
      <Groups>{groupsString}</Groups>
      <IconButton
        size="small"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(true)
        }}
      >
        <EditIcon />
      </IconButton>
      {isOpen && (
        <SelectGroupsPopup
          splitIndex={splitIndex}
          onClose={() => setIsOpen(false)}
        />
      )}
    </Root>
  )
}

interface Props2 {
  splitIndex: number
  onClose: () => void
}

function SelectGroupsPopup({ splitIndex, onClose }: Props2) {
  const dispatch = useDispatch()
  const activeGroups = useDmxSelector((dmx) => dmx.activeGroups)
  let activeScene = useActiveLightScene((scene) => scene)

  const splitGroups = getSplitGroups(activeScene, splitIndex, activeGroups)

  return (
    <Popup title="Select Groups" onClose={onClose}>
      {activeGroups.map((group) => {
        const isActive = splitGroups.includes(group)
        const payload = {
          index: splitIndex,
          group,
        }
        return (
          <AvailableGroup
            key={group}
            style={
              isActive ? {} : { opacity: 0.5, textDecoration: 'line-through' }
            }
            onClick={() =>
              isActive
                ? dispatch(removeSplitSceneGroup(payload))
                : dispatch(addSplitSceneGroup(payload))
            }
          >
            {group}
          </AvailableGroup>
        )
      })}
    </Popup>
  )
}

const Root = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const Groups = styled.div`
  margin-right: 0.5rem;
  font-size: 1rem;
`

const AvailableGroup = styled.div`
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
  margin-bottom: 1rem;
`
