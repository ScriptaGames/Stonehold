///////////////////////////////////////////////////////
//  Gameplay constants, tweak these for maximum fun  //
///////////////////////////////////////////////////////

/** Player base HP. */
export const PLAYER_BASE_HP = 1;

/** Base player speed. */
export const PLAYER_SPEED = 400;

/** How much speed boost dodge should give.  Added to base player speed during a dodge. */
export const DODGE_SPEED_BONUS = 1400;

/** How long, from dodge start, until the next dodge can start. */
export const DODGE_COOLDOWN = 1000;

/** How long dodge animation lasts. */
export const DODGE_DURATION = 800;

/** From dodge start, how long until the player can start WASD-based movement again. */
export const DODGE_GRACE_PERIOD = 300;

/** From attack start, how long until the player can start moving and dodging again. */
export const ATTACK_GRACE_PERIOD = 550;

/** How far from the player the weapon should hover. */
export const WEAPON_HOVER_DISTANCE = 30;

/** GraphQL API URL **/
export const API_URL = "http://66.228.50.201:3000/api/graphql";

/** Scale applied to all pixel art. */
export const PIXEL_SCALE = 3;

/** Damage from a pinky's attack. */
export const PINKY_ATTACK_DAMAGE = 1;

/** Damage from a captain's attack. */
export const CAPTAIN_ATTACK_DAMAGE = 1;
