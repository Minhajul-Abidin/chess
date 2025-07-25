"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white",
                // fen: this.board.fen(),
                // turn: "white",
            },
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black",
                // fen: this.board.fen(),
                // turn: "white",
            },
        }));
    }
    makeMove(socket, move) {
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
        }
        catch (e) {
            console.log(e);
            return;
        }
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white",
                },
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white",
                },
            }));
            return;
        }
        // Notify both players about the move
        // if (this.board.moves.length % 2 === 0) {
        //   this.player2.emit(
        //     JSON.stringify({
        //       type: MOVE,
        //       payload: move,
        //     })
        //   );
        // } else {
        //   this.player1.emit(
        //     JSON.stringify({
        //       type: MOVE,
        //       payload: move,
        //     })
        //   );
        // }
        // Notify the other player about the move
        const otherPlayer = socket === this.player1 ? this.player2 : this.player1;
        otherPlayer.send(JSON.stringify({
            type: messages_1.MOVE,
            payload: move,
        }));
    }
}
exports.Game = Game;
