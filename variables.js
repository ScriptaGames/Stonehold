///////////////////////////////////////////////////////
//  Gameplay constants, tweak these for maximum fun  //
///////////////////////////////////////////////////////

/** Base player speed. */
export const PLAYER_SPEED = 400;
/** How much speed boost dodge should give.  Added to base player speed during a dodge. */
export const DODGE_SPEED_BONUS = 1400;
/** How long, from dodge start, until the next dodge can start. */
export const DODGE_COOLDOWN = 1000;
/** How long dodge animation lasts. */
export const DODGE_DURATION = 800;
/** From dodge start, how long until the player can start WASD-based movement again. */
export const DODGE_FREEZE_DURATION = 300;
/** How far from the player the weapon should hover. */
export const WEAPON_HOVER_DISTANCE = 50;
/** GraphQL API URL **/
export const API_URL = 'http://66.228.50.201:3000/api/graphql'
