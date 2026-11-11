/**
 * Shared layout of the finale's ground, used by the terrain, the horizon
 * line and the finale mascot so they all ride the same ground.
 */
/** Ground extent (world units) and where it sits in depth. */
const WIDTH = 220
const DEPTH = 72
const NEAR_Z = -8
/** Ground height when the finale starts vs when it has fully arrived.
 *  The camera looks straight ahead from z=10 with a 35deg FOV, so a point at
 *  height y and distance d appears at y / (d * tan(17.5deg)) of the screen's
 *  half-height. With the far edge ~90 units away: START_Y -34 hides the
 *  whole landscape (and mesas) below the screen; END_Y -11 puts the horizon
 *  ~70% of the way down, below the footer's headline, date and button. */
const START_Y = -34
const END_Y = -11

export const TERRAIN = { WIDTH, DEPTH, NEAR_Z, FAR_Z: NEAR_Z - DEPTH, START_Y, END_Y } as const
