import * as THREE from 'three'
import VisualizerBase, { UpdateResource } from './VisualizerBase'
import { random } from '../../../shared/util'
import { Vector3 } from 'three'
import { Strobe, colorFromHSV } from './animations'
import { Skew } from '../../../shared/oscillator'

export interface CubesConfig {
  type: 'Cubes'
}

export function initCubesConfig(): CubesConfig {
  return {
    type: 'Cubes',
  }
}

class RandomCube {
  private mesh: THREE.Mesh
  private axis: Vector3

  constructor(scene: THREE.Scene, x: number, y: number) {
    const size = random(1, 1.5)
    const geometry = new THREE.BoxGeometry(size, size, size)
    this.axis = new Vector3(x, y, 0).normalize()
    geometry.translate(x, y, 0)
    this.mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial())
    scene.add(this.mesh)
  }

  update(dt: number, { scene }: UpdateResource) {
    const bombacity = scene.bombacity
    this.mesh.rotateOnAxis(this.axis, (dt * Skew(bombacity, 0.6) + 0.5) / 200)
  }
}

export default class Cubes extends VisualizerBase {
  private cubes: RandomCube[]
  private light: THREE.PointLight
  private strobe: Strobe = new Strobe()

  constructor() {
    super()

    this.light = new THREE.PointLight()
    this.light.position.z = 5
    this.scene.add(this.light)

    const cols = 12
    const rows = 8
    this.cubes = []
    for (const col of Array(cols).keys()) {
      for (const row of Array(rows).keys()) {
        const x = col - cols / 2
        const y = row - rows / 2
        this.cubes.push(new RandomCube(this.scene, x, y))
      }
    }
  }

  update(dt: number, res: UpdateResource): void {
    this.cubes.forEach((cube) => cube.update(dt, res))
    this.light.position.x = res.params.x * 10 - 5
    this.light.position.y = res.params.y * 8 - 4
    this.light.intensity = this.strobe.update(dt, res.params.strobe)
    this.light.color = new THREE.Color(
      colorFromHSV(res.params.hue, res.params.saturation, res.params.brightness)
    )
  }
}