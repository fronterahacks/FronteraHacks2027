import { FrontierSun } from './FrontierSun'
import { FrontierTerrain } from './FrontierTerrain'

/**
 * The footer's 3D finale: a neon frontier at sunset where the mascot
 * reassembles to say goodbye. Everything here is driven by how far the
 * footer's finale stage has scrolled in (finaleProgress).
 */
export function FrontierFinale() {
  return (
    <group>
      <FrontierSun />
      <FrontierTerrain />
    </group>
  )
}
