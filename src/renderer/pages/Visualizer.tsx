import { useRef, useEffect } from 'react'
import FPS from '../visualizer/FPS'
import VisualizerManager from '../visualizer/threejs/VisualizerManager'
import styled from 'styled-components'
import StatusBar from '../menu/StatusBar'
import { realtimeStore, useRealtimeSelector } from '../redux/realtimeStore'
import { store, getCleanReduxState } from '../redux/store'
import SplitPane from '../base/SplitPane'
import SceneSelection from '../scenes/SceneSelection'
import OpenVisualizerButton from 'renderer/visualizer/OpenVisualizerButton'
import VisualizerSceneEditor from 'renderer/visualizer/VisualizerSceneEditor'
import Effects from 'renderer/visualizer/Effects'

const visualizer = new VisualizerManager()
let lastUpdateTime: number | null = null
let dt: number = 0

function animateVisualizer() {
  const now = Date.now()
  if (lastUpdateTime !== null) {
    dt = now - lastUpdateTime
  }
  lastUpdateTime = now
  visualizer.update(dt, {
    rt: realtimeStore.getState(),
    state: getCleanReduxState(store.getState()),
  })
  requestAnimationFrame(animateVisualizer)
}

animateVisualizer()

export default function Visualizer() {
  const ref = useRef(null)
  useRealtimeSelector((state) => state)

  function resize() {
    const element = ref.current
    if (element !== null) {
      visualizer.resize(element.clientWidth, element.clientHeight)
    }
  }

  useEffect(() => {
    const element = ref.current
    if (element !== null) {
      element.appendChild(visualizer.getElement())
    }
    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [ref.current?.clientWidth ?? 0, ref.current?.clientHeight ?? 0])

  const splitPaneStyle: React.CSSProperties = {
    flex: '1 1 0',
    overflow: 'auto',
  }

  return (
    <Root>
      <StatusBar />
      <SplitPane
        style={splitPaneStyle}
        type="vertical"
        initialSplit={0.3}
        rem={0.5}
        min={0.2}
        max={0.5}
      >
        <Pane>
          <SceneSelection sceneType="visual" />
        </Pane>
        <VisualizerPane>
          <Window ref={ref}>
            <FPS dt={dt} />
            <OpenVisualizerButton />
          </Window>
          <SplitPane
            style={{ flex: '0.8 0 0' }}
            type="vertical"
            initialSplit={0.4}
            rem={0.5}
            min={0.2}
            max={0.5}
          >
            <Pane style={{ borderRight: `1px solid #777` }}>
              <VisualizerSceneEditor />
            </Pane>
            <Pane>
              <Effects />
            </Pane>
          </SplitPane>
        </VisualizerPane>
      </SplitPane>
    </Root>
  )
}

const Root = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
`

const Window = styled.div`
  position: relative;
  background-color: #000;
  flex: 1 0 0;
  height: 60vh;
  overflow: auto;
`

const Pane = styled.div`
  height: 100%;
`

const VisualizerPane = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`
