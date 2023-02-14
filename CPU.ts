/*
	CPU Class
*/
import {GameBoard} from "GameBoard.js"
class CPU {
	maxiCache : any;
	miniCache : any;

	constructor() {
		this.maxiCache = {};
		this.miniCache = {};
	}

	//CPU is guaranteed to be black
	//Return the mini of the current board with alpha and beta uninitialized
	getMove(board : GameBoard) {
		var myDepth = DEPTH;
		var numPieces = 0;
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (isDef(board.squares[i][j])) {
					numPieces++;
				}
			}
		}
		if (numPieces < 12) {
			myDepth = DEPTH + 3
		}
		if (numPieces < 6) {
			myDepth = DEPTH + 6
		}
		if (this.maxiCache.length > 300000)
			this.maxiCache = {}
		if (this.miniCache.length > 300000)
			this.miniCache = {}
		let arc =  this.mini(board, myDepth, -1 * Infinity, Infinity);
		return arc[0];
	}

	evalBoard(board : GameBoard) {
		var ans = board.points * 10.0
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (isDef(board.squares[i][j])) {
					if (board.squares[i][j].color === "Black") {
						if (board.squares[i][j].name === "kingBlack")
							ans += (board.squares[i][j].getMoves(board, i, j).length)/6.0
						else
							ans -= (board.squares[i][j].getMoves(board, i, j).length)/21.0
					}
					else {
						if (board.squares[i][j].name === "kingWhite")
							ans -= (board.squares[i][j].getMoves(board, i, j).length)/6.0
						else
							ans += (board.squares[i][j].getMoves(board, i, j).length)/21.0
					}
				}
				
			}
		}
		return ans
	}

	//Return format: [best move, maximum achievable score, optional : tiebreak value]
	maxi(board : GameBoard, depth : number, alpha : number, beta : number) {
		var moves = []
		var score : number;
		var tiebreak : number = 0.0;
		var key = board.shortstring();
		let temp = this.maxiCache[key]
		if (isDef(temp)) {
			let cacheDepth = temp[0];
			if (cacheDepth >= depth) {
				hits++;
				return temp[1];
				
			}
		}
		misses++;
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (isDef(board.squares[i][j])) {
					if (board.squares[i][j].color[0] === "W") {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						for (let k = 0; k < tempList.length; k++) {
							moves.push([i, j, tempList[k][0], tempList[k][1]])
						}
						if (depth === 0) {
							if (board.squares[i][j].shortname() === "k") {
								tiebreak = tiebreak - (tempList.length)/12.0;
							}
							else {
								tiebreak = tiebreak + (tempList.length)/42.0;
							}
						}
					}
					else if (depth === 0) {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						if (board.squares[i][j].shortname() === "l")
							tiebreak = tiebreak + (tempList.length)/12.0;
						else
							tiebreak = tiebreak - (tempList.length)/42.0;
					}
				}
			}
		}

		var maxScore : number = -1*Infinity
		var bestMove = null
		if (depth === 0) {
			for (let i = 0; i < moves.length; i++) {
				let arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true)
				score = board.points * 10.0 + tiebreak
				if (score > maxScore) {
					maxScore = score;
					bestMove = moves[i]
				}
				if (maxScore >= beta) {
                    board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
					this.maxiCache[key] = [depth, [bestMove, maxScore]];
					return [bestMove, maxScore];
                }
				if (maxScore > alpha)
					alpha = maxScore;
				board.reverseMove(arr[0], arr[1],moves[i][0], moves[i][1], moves[i][2], moves[i][3])
			}
		}
		else {
			for (let i = 0; i < moves.length; i++) {
				let arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true)
				var pair;
				if (!board.gameOver)
					pair = this.mini(board, depth-1, alpha, beta)
				else
					pair = [null, board.points * 10.0]
				if (pair !== null) {
					score = pair[1]
					if (score > maxScore) {
						maxScore = score;
						bestMove = moves[i]
					}
					if (maxScore >= beta) {
                        board.reverseMove(arr[0], arr[1],moves[i][0], moves[i][1], moves[i][2], moves[i][3])
						this.maxiCache[key] = [depth, [bestMove, maxScore]];
						return [bestMove, maxScore]
                    }
					if (maxScore > alpha)
						alpha = maxScore;
				}
				board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3])
			}
		}
		this.maxiCache[key] = [depth, [bestMove, maxScore]];		
		return [bestMove, maxScore]
	}

	//Return format: [best move, minimum achievable score, optional : tiebreak value]
	mini (board : GameBoard, depth : number, alpha : number, beta : number) {
		let moves = []
		var score;
		var tiebreak = 0;
		var key = board.shortstring();
		let temp = this.miniCache[key]
		if (isDef(temp)) {
			if (temp[0] >= depth) {
				return temp[1];
			}
		}
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) 
			{
				if (isDef(board.squares[i][j])) {
					if (board.squares[i][j].color[0] === "B") {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						for (let k = 0; k < tempList.length; k++) {
							moves.push([i, j, tempList[k][0], tempList[k][1]])
						}
						if (depth === 0) {
							if (board.squares[i][j].shortname() === "l") {
								tiebreak = tiebreak + (tempList.length)/12.0;
							}
							else {
								tiebreak = tiebreak - (tempList.length)/42.0;
							}
						}
					}
					else if (depth === 0) {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						if (board.squares[i][j].shortname() === "k")
							tiebreak = tiebreak - (tempList.length)/12.0;
						else
							tiebreak = tiebreak + (tempList.length)/42.0;
					}
				}
			}
		}

		var minScore = Infinity
		var bestMove = null
		if (depth === 0) {
			for (let i = 0; i < moves.length; i++) {
				let arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true)
				if (!arr[0][0]) //is not a capture
					score = board.points * 10.0 + tiebreak
				else {
					pair = this.maxi(board, 0, alpha, beta)
					score = pair[1]
				}
				if (score < minScore) {
					minScore = score;
					bestMove = moves[i]
				}
				if (minScore < beta)
					beta = minScore;
				if (minScore <= alpha) {
                    board.reverseMove(arr[0], arr[1],moves[i][0], moves[i][1], moves[i][2], moves[i][3])
					this.miniCache[key] = [depth, [bestMove, minScore]];
					return [bestMove, minScore];
                }
				board.reverseMove(arr[0], arr[1],moves[i][0], moves[i][1], moves[i][2], moves[i][3])
			}
		}
		else {
			for (let i = 0; i < moves.length; i++) {
				let arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true)
				var pair;
				if (!board.gameOver) {
					pair = this.maxi(board, depth-1, alpha, beta)
				}
				else {
					pair = [null, board.points * 10.0]
				}
				if (pair !== null) {
					score = pair[1]
					if (score < minScore) {
						minScore = score;
						bestMove = moves[i]
					}
					if (minScore < beta)
						beta = minScore;
					if (minScore <= alpha) {
                        board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3])
						this.miniCache[key] = [depth, [bestMove, minScore]];
						return [bestMove, minScore];
                    }
				}
				board.reverseMove(arr[0], arr[1],moves[i][0], moves[i][1], moves[i][2], moves[i][3])
			}
		}
		this.miniCache[key] = [depth, [bestMove, minScore]];
		return [bestMove, minScore, tiebreak]
	}
}
