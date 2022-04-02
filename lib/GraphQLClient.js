import {
  API_URL
} from "../variables";

import {request, gql} from 'graphql-request';

export class GraphQLClient {

  async getPlayers() {
    const query = gql`
      query {
        players {
          name
          seed
          rooms_cleared
        }
      }`;

    const data = await request(API_URL, query);

    return data.players;
  }
}
