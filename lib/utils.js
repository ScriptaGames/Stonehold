export class Utils {
  static getLocalStoragePlayer() {
    return {
      id: localStorage.getItem("player_id"),
      name: localStorage.getItem("player_name"),
      seed: localStorage.getItem("player_seed"),
      rooms_cleared: localStorage.getItem("player_rooms_cleared"),
    };
  }
}
