///////////////////////////////////////////////////////
//  Gameplay constants, tweak these for maximum fun  //
///////////////////////////////////////////////////////

/** Depth of the first room, increase this to debug higher levels */
export const STARTING_ROOM_DEPTH = 1;

/** Player base HP. */
export const PLAYER_BASE_HP = 50;

/** Player base damage. */
export const PLAYER_BASE_DAMAGE = 1;

/** Base player speed. */
export const PLAYER_SPEED = 400;

/** How long to freeze the final frame of ultimate attack animation */
export const PLAYER_AFTER_ULTIMATE_DELAY = 500;

/** How much to move when attacking */
export const ATTACK_LUNGE_SPEED = 600;

/** How much speed boost dodge should give.  Added to base player speed during a dodge. */
export const DODGE_SPEED_BONUS = 1500;

/** How long, from dodge start, until the next dodge can start. */
export const DODGE_COOLDOWN = 1000;

/** How long dodge animation lasts. */
export const DODGE_DURATION = 800;

/** From dodge start, how long until the player can start WASD-based movement again. */
export const DODGE_GRACE_PERIOD = 300;

/** From attack start, how long until the player can start moving and dodging again. */
export const ATTACK_GRACE_PERIOD = 350;

/** From attack combo start, how long until the player can start moving and dodging again. */
export const ATTACK_COMBO_GRACE_PERIOD = 300;

/** From first attack start, how much time to accept input for second part of combo attack. */
export const COMBO_ATTACK_INPUT_PERIOD = 350;

/** From attack start, how long until the player can start moving and dodging again. */
export const ULTIMATE_ATTACK_GRACE_PERIOD = 1000;

/** Radius the ultimate attack will damage */
export const ULTIMATE_ATTACK_EXTENDED_RADIUS = 5;

/** Percent of ultimate charge refilled per enemey kill */
export const ULTIMATE_CHARGE_PER_ENEMY = 0.25;

/** Damage from the ultimate attack */
export const ULTIMATE_ATTACK_DAMAGE = 50;

/** How far from the player the weapon should hover. */
export const WEAPON_HOVER_DISTANCE = 34;

/** GraphQL API URL **/
export const API_URL = "http://66.228.50.201:3000/api/graphql";

/** Scale applied to all pixel art. */
export const PIXEL_SCALE = 3;

/** Damage from a pinky's attack. */
export const PINKY_ATTACK_DAMAGE = 1;

/** Pinky starting HP. */
export const PINKY_BASE_HP = 5;

/** Pinky's speed */
export const PINKY_SPEED = 100;

/** Pinky's attack range */
export const PINKY_ATTACK_RANGE = 110;

/** Pinky's aggro range */
export const PINKY_AGGRO_RANGE = 375;

/** When an enemy is aggro'd, pinkies within this range of the aggro'd enemy will also aggro. */
export const PINKY_AGGRO_FRIEND_RANGE = 400;

/** Pinky's idle time after attacking */
export const PINKY_IDLE_AFTER_ATTACK = 1000;

/** percent chance that a pinky will drop an item */
export const PINKY_DROP_CHANCE = 20;

/** Damage from a captain's attack. */
export const CAPTAIN_ATTACK_DAMAGE = 1;

/** Captain starting HP. */
export const CAPTAIN_BASE_HP = 7;

/** percent chance that a captain will drop an item */
export const CAPTAIN_DROP_CHANCE = 35;

/** Captain's speed */
export const CAPTAIN_SPEED = 100;

/** Captain's aggro range */
export const CAPTAIN_AGGRO_RANGE = 375;

/** When an enemy is aggro'd, captains within this range of the aggro'd enemy will also aggro. */
export const CAPTAIN_AGGRO_FRIEND_RANGE = 400;

/** Captain's attack range */
export const CAPTAIN_ATTACK_RANGE = 350;

/** Captain's projectile speed */
export const CAPTAIN_PROJECTILE_SPEED = 400;

/** Captain's idle time after attacking */
export const CAPTAIN_IDLE_AFTER_ATTACK = 1600;

/** enemy damage scaler multiplier */
export const ENEMY_DAMAGE_SCALER = 0.2;

/** After taking damage, actors go invulnerable for this long. */
export const ACTOR_DAMAGE_INVUL_PERIOD = 100;

/** Amount to increase bonus damage per room */
export const BONUS_DAMAGE_BASE = 1;

/** Amount to increase bonus damage per room */
export const BONUS_DAMAGE_INCREASE = 0.0;

/** buff health amount */
export const BUFF_HEALTH_AMOUNT = 10;

/** buff speed multiplier */
export const BUFF_SPEED_MULTIPLIER = 2;

/** buff speed duration */
export const BUFF_SPEED_DURATION = 10000;

export const BUFF_ATTACK_SWINGS = 10;

export const BUFF_ATTACK_MULTIPLIER = 3;
