import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  private startTime: Date;
  private moveCount = 0;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
          // fen: this.board.fen(),
          // turn: "white",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
          // fen: this.board.fen(),
          // turn: "white",
        },
      })
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    // Validate it's the correct player's turn
    if (this.moveCount % 2 === 0 && socket !== this.player1) {
      return;
    }

    if (this.moveCount % 2 === 1 && socket !== this.player2) {
      return;
    }

    try {
      this.board.move(move);
      this.moveCount++; // Only increment after a successful move
    } catch (e) {
      console.log(e);
      return;
    }

    if (this.board.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
          },
        })
      );
      return;
    }

    // Notify the other player about the move
    const otherPlayer = socket === this.player1 ? this.player2 : this.player1;
    otherPlayer.send(
      JSON.stringify({
        type: MOVE,
        payload: move,
      })
    );
  }
}
