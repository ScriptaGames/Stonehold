///////////////////////////////////////////////////////
//  Gameplay constants, tweak these for maximum fun  //
///////////////////////////////////////////////////////

/** Player base HP. */
export const PLAYER_BASE_HP = 50;

/** Player base damage. */
export const PLAYER_BASE_DAMAGE = 1;

/** Base player speed. */
export const PLAYER_SPEED = 400;

/** How long to freeze the final frame of ultimate attack animation */
export const PLAYER_AFTER_ULTIMATE_DELAY = 500;

/** How much speed boost dodge should give.  Added to base player speed during a dodge. */
export const DODGE_SPEED_BONUS = 1500;

/** How long, from dodge start, until the next dodge can start. */
export const DODGE_COOLDOWN = 1000;

/** How long dodge animation lasts. */
export const DODGE_DURATION = 800;

/** From dodge start, how long until the player can start WASD-based movement again. */
export const DODGE_GRACE_PERIOD = 300;

/** From attack start, how long until the player can start moving and dodging again. */
export const ATTACK_GRACE_PERIOD = 550;

/** From attack start, how long until the player can start moving and dodging again. */
export const ULTIMATE_ATTACK_GRACE_PERIOD = 1000;

/** Radius the ultimate attack will damage */
export const ULTIMATE_ATTACK_RADIUS = 100;

/** Percent of ultimate charge refilled per enemey kill */
export const ULTIMATE_CHARGE_PER_ENEMY = 0.25;

/** How far from the player the weapon should hover. */
export const WEAPON_HOVER_DISTANCE = 34;

/** GraphQL API URL **/
export const API_URL = "http://66.228.50.201:3000/api/graphql";

/** Scale applied to all pixel art. */
export const PIXEL_SCALE = 3;

/** Damage from a pinky's attack. */
export const PINKY_ATTACK_DAMAGE = 1;

/** Pinky starting HP. */
export const PINKY_BASE_HP = 7;

/** Damage from a captain's attack. */
export const CAPTAIN_ATTACK_DAMAGE = 1;

/** Captain starting HP. */
export const CAPTAIN_BASE_HP = 7;

/** Pinky's speed */
export const PINKY_SPEED = 100;

/** Pinky's attack range */
export const PINKY_ATTACK_RANGE = 100;

/** Pinky's idle time after attacking */
export const PINKY_IDLE_AFTER_ATTACK = 1000;

/** Captain's speed */
export const CAPTAIN_SPEED = 100;

/** Captain's attack range */
export const CAPTAIN_ATTACK_RANGE = 350;

/** Captain's projectile speed */
export const CAPTAIN_PROJECTILE_SPEED = 400;

/** Captain's idle time after attacking */
export const CAPTAIN_IDLE_AFTER_ATTACK = 1600;

/** After taking damage, actors go invulnerable for this long. */
export const ACTOR_DAMAGE_INVUL_PERIOD = 50;
