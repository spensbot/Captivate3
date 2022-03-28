import { useOutputParam } from '../redux/realtimeStore'
import Cursor from '../base/Cursor'

interface Props {
  splitIndex: number
}

export default function XYCursor({ splitIndex }: Props) {
  const xOut = useOutputParam('x', splitIndex)
  const yOut = useOutputParam('y', splitIndex)

  return <Cursor x={xOut} y={yOut} color="#fff" withHorizontal withVertical />
}
