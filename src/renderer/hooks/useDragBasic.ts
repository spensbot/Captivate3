import { useEffect, useRef } from 'react'

type Ref = React.MutableRefObject<any>
type MouseEventHandler = React.MouseEventHandler<HTMLDivElement>

export default function useDragBasic(
  onChange: (e: React.MouseEvent) => void
): [Ref, MouseEventHandler] {
  const dragContainer = useRef()

  const onMouseMove: MouseEventHandler = (e: React.MouseEvent) => {
    update(e)
  }

  const onMouseUp: MouseEventHandler = (_e: React.MouseEvent) => {
    stopListening()
  }

  const onMouseLeave: MouseEventHandler = (_e: React.MouseEvent) => {
    stopListening()
  }

  const startListening = () => {
    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', onMouseUp)
    document.body.addEventListener('mouseleave', onMouseLeave)
  }

  const stopListening = () => {
    document.body.removeEventListener('mousemove', onMouseMove)
    document.body.removeEventListener('mouseup', onMouseUp)
    document.body.removeEventListener('mouseleave', onMouseLeave)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    update(e)
    startListening()
  }

  const update = (e: React.MouseEvent) => {
    onChange(e)
  }

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  return [dragContainer, onMouseDown]
}
