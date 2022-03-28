import { useActiveLightScene, useControlSelector } from 'renderer/redux/store'
import styled from 'styled-components'
import { indexArray } from 'shared/util'
import { paramsList } from '../../shared/params'
import ModulationSlider, { AddModulationButton } from './ModulationSlider'

export default function ModulationMatrix({ index }: { index: number }) {
  const numSplits = useActiveLightScene((scene) => scene.splits.length)
  const activeSceneId = useControlSelector((control) => control.light.active)
  return (
    <div>
      {indexArray(numSplits).map((splitIndex) => (
        <SplitSceneModulationMatrix
          key={splitIndex + activeSceneId}
          modIndex={index}
          splitIndex={splitIndex}
        />
      ))}
      <AddModulationButton modIndex={index} />
    </div>
  )
}

function SplitSceneModulationMatrix({
  modIndex,
  splitIndex,
}: {
  modIndex: number
  splitIndex: number
}) {
  return (
    <SplitRoot>
      {paramsList.map((paramKey) => {
        return (
          <ModulationSlider
            splitIndex={splitIndex}
            key={paramKey + 'mod' + splitIndex + modIndex.toString()}
            modIndex={modIndex}
            param={paramKey}
          />
        )
      })}
    </SplitRoot>
  )
}

const SplitRoot = styled.div``
