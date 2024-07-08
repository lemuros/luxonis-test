import { Game } from "./Game";

export class GameDao {
  private gamesByChallenger = new Map<string, Game>();
  private gamesByRival = new Map<string, Game>();

  public getGame(id: string) {
    const byChallenger = this.gamesByChallenger.get(id);
    if (byChallenger) {
      return byChallenger;
    }
    const byRival = this.gamesByRival.get(id);
    if (byRival) {
      return byRival;
    }
    throw new Error(`Cannot find game by player id ${id}`);
  }

  public insertGame(game: Game) {
    const challengerId = game.challenger.id;
    const rivalId = game.rival.id;

    if (this.gamesByChallenger.get(challengerId)) {
      throw new Error(
        `Cannot store new Game, challenger ${challengerId} already have Game instance stored`
      );
    }
    if (this.gamesByRival.get(rivalId)) {
      throw new Error(
        `Cannot store new Game, rival ${rivalId} already have Game instance stored`
      );
    }

    this.gamesByChallenger.set(challengerId, game);
    this.gamesByRival.set(rivalId, game);
  }

  public removeGame(id: string) {
    try {
      const game = this.getGame(id);
      this.gamesByChallenger.delete(game.challenger.id);
      this.gamesByRival.delete(game.rival.id);
    } catch (e) {
      console.error(e);
    }
  }
}
