import { API_URL } from "../variables";

import { request, gql } from "graphql-request";

export class GraphQLClient {
  async getPlayers() {
    const query = gql`
      query {
        players {
          id
          name
          seed
          rooms_cleared
        }
      }
    `;

    const data = await request(API_URL, query);

    return data.players;
  }

  async queryPlayerByIDAndName(id, name) {
    let player;
    const query = gql`
      query ($id: IDFilter, $name: StringFilter) {
        players(where: { id: $id, name: $name }) {
          id
          name
          seed
          rooms_cleared
        }
      }
    `;

    const variables = {
      id: {
        equals: id,
      },
      name: {
        equals: name,
      },
    };

    const data = await request(API_URL, query, variables);

    return data.players[0];
  }

  async createPlayer(player) {
    const mutation = gql`
      mutation ($player: PlayerCreateInput!) {
        createPlayer(data: $player) {
          id
          name
        }
      }
    `;

    const variables = {
      player,
    };

    const data = await request(API_URL, mutation, variables);

    return data.createPlayer;
  }

  async updatePlayer(id, rooms_cleared) {
    const mutation = gql`
      mutation ($id: ID!, $player: PlayerUpdateInput!) {
        updatePlayer(where: { id: $id }, data: $player) {
          id
          name
          rooms_cleared
        }
      }
    `;

    const variables = {
      id,
      player: {
        rooms_cleared,
      },
    };

    const data = await request(API_URL, mutation, variables);

    return data.updatePlayer;
  }
}
