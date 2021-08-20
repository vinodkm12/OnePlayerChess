
/*
	Helpers
*/
const BOARD_SIZE = 480
const DEPTH = 4
function filterOnBoard(coord : number[]) {
	let i : number = coord[0]
	let j : number  = coord[1]
	return ((0 <= i && i <= 7) && (0 <= j && j <= 7));
}

function isDef(x : any) {
	return !(x === undefined || x === null)
}

function includes(a : number[], listA) {
	for (let i = 0; i < listA.length; i++) {
		if (listA[i][0] === a[0] && listA[i][1] === a[1])
			return true;
	}
	return false;
}



/*
	CPU Class
*/
class CPU {
	constructor() {
	}
	getMove(board : GameBoard) {
		let arc =  this.mini(board, DEPTH, -1 * Infinity, Infinity)
		return arc[0]
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

	maxi(board : GameBoard, depth : number, alpha : number, beta : number) {
		var moves = []
		var score : number;
		var tiebreak : number = 0.0;
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (isDef(board.squares[i][j])) {
					if (board.squares[i][j].color === "White") {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						for (let k = 0; k < tempList.length; k++) {
							moves.push([i, j, tempList[k][0], tempList[k][1]])
						}
						if (depth === 0) {
							if (board.squares[i][j].name === "kingWhite") {
								tiebreak = tiebreak - (tempList.length)/12.0;
							}
							else {
								tiebreak = tiebreak + (tempList.length)/42.0;
							}
						}
					}
					else if (depth === 0) {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						if (board.squares[i][j].name === "kingBlack")
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
                    board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3])
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
						return [bestMove, maxScore]
                    }
					if (maxScore > alpha)
						alpha = maxScore;
				}
				board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3])
			}
		}		
		return [bestMove, maxScore]
	}

	mini (board : GameBoard, depth : number, alpha : number, beta : number) {
		let moves = []
		var score;
		var tiebreak = 0;
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) 
			{
				if (isDef(board.squares[i][j])) {
					if (board.squares[i][j].color === "Black") {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						for (let k = 0; k < tempList.length; k++) {
							moves.push([i, j, tempList[k][0], tempList[k][1]])
						}
						if (depth === 0) {
							if (board.squares[i][j].name === "kingBlack") {
								tiebreak = tiebreak + (tempList.length)/12.0;
							}
							else {
								tiebreak = tiebreak - (tempList.length)/42.0;
							}
						}
					}
					else if (depth === 0) {
						let tempList = board.squares[i][j].getMoves(board, i, j)
						if (board.squares[i][j].name === "kingWhite")
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

				score = board.points * 10.0 + tiebreak 
				if (score < minScore) {
					minScore = score;
					bestMove = moves[i]
				}

				if (minScore < beta)
					beta = minScore;
				if (minScore <= alpha) {
                    board.reverseMove(arr[0], arr[1],moves[i][0], moves[i][1], moves[i][2], moves[i][3])
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
						return [bestMove, minScore];
                    }
				}
				board.reverseMove(arr[0], arr[1],moves[i][0], moves[i][1], moves[i][2], moves[i][3])
			}
		}
		return [bestMove, minScore, tiebreak]
	}
}






/*
GameBoard class
*/

class GameBoard {
    points : number;
    squares : Piece[][];
    graveyard : any[];

	gameOver : boolean
	blackKingHasMoved : boolean;
	whiteKingHasMoved : boolean;
	blackRook0HasMoved : boolean;
	blackRook1HasMoved : boolean;
	whiteRook0HasMoved : boolean;
	whiteRook1HasMoved : boolean;
	justMovedTwo : number[]

	constructor () {
		this.gameOver = false
		this.blackKingHasMoved = false
		this.whiteKingHasMoved = false
		this.blackRook0HasMoved = false
		this.blackRook1HasMoved = false
		this.whiteRook0HasMoved = false
		this.whiteRook1HasMoved = false

		//If a pawn has just moved two squares up, this.justMovedTwo stores
		//		the location of the pawn that just moved up
		this.justMovedTwo = null
		this.squares = [[],[],[],[],[],[],[],[]]
		for (let i = 0; i <= 7; i++) {
			for (let j = 0; j <= 7; j++) {
				this.squares[i][j] = null
			}
		}
		this.points = 0
		this.graveyard = []		
	}

	//Gets a list of many relevant properties of the chessboard
	getProps() {
		let ans : any[] = [];
		ans.push(this.blackKingHasMoved);
		ans.push(this.whiteKingHasMoved);
		ans.push(this.blackRook0HasMoved);
		ans.push(this.blackRook1HasMoved);
		ans.push(this.whiteRook0HasMoved);
		ans.push(this.whiteRook1HasMoved);
		ans.push(this.gameOver)
		ans.push(this.points)
		ans.push(this.justMovedTwo)
		return ans;
	}

	//Sets a list of many relevant properties of the chessboard from another list
	//Usually called as a pair function with getProps()
	setProps(l : any[]) {
		this.blackKingHasMoved = l[0];
		this.whiteKingHasMoved = l[1];
		this.blackRook0HasMoved = l[2];
		this.blackRook1HasMoved = l[3];
		this.whiteRook0HasMoved = l[4];
		this.whiteRook1HasMoved = l[5];
		this.gameOver = l[6]
		this.points = l[7]
		this.justMovedTwo = l[8]
	}

	setup() {
	for (let i = 0; i <= 7; i++) {
		for (let j = 0; j <= 7; j++) {
			if (i == 1 && j == 7) {
				this.squares[i][j] = new Knight("knightWhite0", "White")
			}
			else if (i == 6 && j == 7) {
				this.squares[i][j] = new Knight("knightWhite1", "White")
			}
			else if (i == 1 && j == 0) {
				this.squares[i][j] = new Knight("knightBlack0", "Black")
			}
			else if (i == 6 && j == 0) {
				this.squares[i][j] = new Knight("knightBlack1", "Black")
			}
			else if (i == 4 && j == 0) {
				this.squares[i][j] = new King("kingBlack", "Black")	
			}
			else if (i == 4 && j == 7) {
				this.squares[i][j] = new King("kingWhite",  "White")		
			}	
			else if (i == 2 && j == 0) {
				this.squares[i][j] = new Bishop("bishopBlack0",  "Black")			
			}
			else if (i == 5 && j == 0) {
				this.squares[i][j] = new Bishop("bishopBlack1",  "Black")		
			}	
			else if (i == 2 && j == 7) {
				this.squares[i][j] = new Bishop("bishopWhite0", "White")		
			}
			else if (i == 5 && j == 7) {
				this.squares[i][j] = new Bishop("bishopWhite1", "White")			
			}			
			else if (i == 0 && j == 0) {
				this.squares[i][j] = new Rook("rookBlack0", "Black")		
			}
			else if (i == 7 && j == 0) {
				this.squares[i][j] = new Rook("rookBlack1", "Black")
			}	
			else if (i == 0 && j == 7) {
				this.squares[i][j] = new Rook("rookWhite0", "White")		
			}
			else if (i == 7 && j == 7) {
				this.squares[i][j] = new Rook("rookWhite1", "White")	
			}
			else if (i == 3 && j == 0) {
				this.squares[i][j] = new Queen("queenBlack", "Black")	
			}	
			else if (i == 3 && j == 7) {
				this.squares[i][j] = new Queen("queenWhite", "White")	
			}
			
			else if (j == 1) {
				this.squares[i][j] = new Pawn("pawnBlack" + i, "Black")	
			}
			else if (j == 6) {
				this.squares[i][j] = new Pawn("pawnWhite" + i, "White")
			}
			else {
				this.squares[i][j] = null
			}
		}
	}
	}

	/* 
		Function to update display of chessboard stored in canvas context
		If sqList is null, update all of the squares in the chessboard
		Otherwise, update all of the locations in sqList
	*/
	update(sqList : number[][], context) {
		if (sqList === null) {
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					if ((i + j) % 2 == 0)
						context.fillStyle = "#9A7B4F"
					else
						context.fillStyle = "#481F01"
					context.fillRect(i * (BOARD_SIZE/8), j * (BOARD_SIZE/8), (BOARD_SIZE/8), (BOARD_SIZE/8))

					if (isDef(this.squares[i][j])) {
						this.squares[i][j].draw(context)
						let temp2 = this.squares[i][j]
						temp2.image.onload = function() {context.drawImage(temp2.image, i*(BOARD_SIZE/8), j*(BOARD_SIZE/8),(BOARD_SIZE/8),(BOARD_SIZE/8))}
					}
				}
			}
		}
		else {
			for (let cnt = 0; cnt < sqList.length; cnt++) {
				let i = sqList[cnt][0];
				let j = sqList[cnt][1];
				if ((i + j) % 2 == 0)
					context.fillStyle = "#9A7B4F"
				else
					context.fillStyle = "#481F01"
				context.fillRect(i * (BOARD_SIZE/8), j * (BOARD_SIZE/8), (BOARD_SIZE/8), (BOARD_SIZE/8))
				if (isDef(this.squares[i][j])) {
					this.squares[i][j].draw(context)
					let temp2 = this.squares[i][j]
					temp2.image.onload = function() {context.drawImage(temp2.image, i*(BOARD_SIZE/8), j*(BOARD_SIZE/8),(BOARD_SIZE/8),(BOARD_SIZE/8))}
				}

			}
		}
        document.getElementById("winner_bar").innerHTML = "" + this.points
	}


	//Order: isCapture, isPromotion, isCastle, isEnPessant
	move(initX : number, initY : number, newX : number, newY : number, suppress : boolean): any[][] {
		var ans = []
		var isCapture: boolean = false
		var isPromotion: boolean = false
		var isCastle : boolean = false
		var isEnPessant : boolean = false
		var storeProps : boolean[] = this.getProps()
		
		if (!this.gameOver || this.gameOver) {
			//Change properties
			if (this.squares[initX][initY].name === "kingBlack")
				this.blackKingHasMoved = true;
			else if (this.squares[initX][initY].name === "kingWhite")
				this.whiteKingHasMoved = true;
			else if (this.squares[initX][initY].name === "rookBlack0")
				this.blackRook0HasMoved = true;
			else if (this.squares[initX][initY].name === "rookBlack1")
				this.blackRook1HasMoved = true;
			else if (this.squares[initX][initY].name === "rookWhite0")
				this.whiteRook0HasMoved = true;
			else if (this.squares[initX][initY].name === "rookWhite1")
				this.whiteRook1HasMoved = true;
			
			//If it is a pawn
			if (this.squares[initX][initY].name.substring(0,4) === "pawn" && Math.abs(newY-initY) > 1.5) {
				this.justMovedTwo = [newX, newY]
			}
			else
				this.justMovedTwo = null

			//If it's a capture, increment point value
			if (isDef(this.squares[newX][newY])) {
				if (this.squares[newX][newY].color === "White")
					this.points = this.points -  this.squares[newX][newY].pointValue
				else
					this.points = this.points + this.squares[newX][newY].pointValue
				
				if (this.squares[newX][newY].name === "kingWhite" || this.squares[newX][newY].name === "kingBlack")
					this.gameOver = true
				
				this.graveyard.push([newX, newY, this.squares[newX][newY]])
				isCapture = true
			}
			
			
			//White promotion
			if (this.squares[initX][initY].name.substring(0, 5) === "pawnW" && newY === 0) {
				let name : string = this.squares[initX][initY].name
				this.squares[initX][initY] = null;
				this.squares[newX][newY] = new Queen("PROM" + name, "White")
				this.points += 8
				ans.push([newX, newY])
				ans.push([initX, initY])
				isPromotion = true
			}
			//Black promotion
			else if (this.squares[initX][initY].name.substring(0, 5) === "pawnB" && newY === 7) {
				let name : string = this.squares[initX][initY].name
				this.squares[initX][initY] = null;
				this.squares[newX][newY] = new Queen("PROM" + name, "Black")
				this.points -= 8
				ans.push([newX, newY])
				ans.push([initX, initY])
				isPromotion = true
			}
			
			//White en pessant
			else if (this.squares[initX][initY].name.substring(0,5) === "pawnW" &&
						!isDef(this.squares[newX][newY]) && initX != newX) {
				isEnPessant = true;
				this.graveyard.push([newX, newY+1, this.squares[newX][newY+1]])
				this.squares[newX][newY] = this.squares[initX][initY]
				this.squares[initX][initY] = null
				this.squares[newX][newY+1] = null
				ans.push([initX, initY])
				ans.push([newX, newY])
				ans.push([newX, newY+1])
				this.points++;
			}
			//Black en pessant
			else if (this.squares[initX][initY].name.substring(0,5) === "pawnB" &&
						!isDef(this.squares[newX][newY]) && initX != newX) {
				isEnPessant = true;
				this.graveyard.push([newX, newY-1, this.squares[newX][newY-1]])
				this.squares[newX][newY] = this.squares[initX][initY]
				this.squares[initX][initY] = null
				this.squares[newX][newY-1] = null
				ans.push([initX, initY])
				ans.push([newX, newY])
				ans.push([newX, newY-1])
				this.points--;
			}
			//Black king side castle
			else if (this.squares[initX][initY].name === "kingBlack" && newX === 6 && initX === 4){
				isCastle = true;
				ans.push([4, 0]);
				ans.push([5,0]);
				ans.push([6,0]);
				ans.push([7,0]);
				this.points = this.points - 0.5;
				this.squares[6][0] = this.squares[4][0];
				this.squares[5][0] = this.squares[7][0];
				this.squares[4][0] = null;
				this.squares[7][0] = null;
			}
			//Black Queen side castle 
			else if (this.squares[initX][initY].name === "kingBlack" && newX === 2 && initX === 4){
				isCastle = true;
				this.points = this.points - 0.5;
				ans.push([4, 0]);
				ans.push([3,0]);
				ans.push([2,0]);
				ans.push([1,0]);
				ans.push([0,0]);
				this.squares[2][0] = this.squares[4][0];
				this.squares[3][0] = this.squares[0][0];
				this.squares[0][0] = null;
				this.squares[1][0] = null;
				this.squares[4][0] = null;
			}
			//White king side castle 
			else if (this.squares[initX][initY].name === "kingWhite" && newX === 6 && initX === 4){
				isCastle = true;
				ans.push([4,7]);
				ans.push([5,7]);
				ans.push([6,7]);
				ans.push([7,7]);
				this.points = this.points + 0.5;
				this.squares[6][7] = this.squares[4][7];
				this.squares[5][7] = this.squares[7][7];
				this.squares[4][7] = null;
				this.squares[7][7] = null;
			}
			//White queen side castle
			else if (this.squares[initX][initY].name === "kingWhite" && newX === 2 && initX === 4) {
				isCastle = true;
				this.points = this.points + 0.5;
				ans.push([4, 7]);
				ans.push([3,7]);
				ans.push([2,7]);
				ans.push([1,7]);
				ans.push([0,7]);
				this.squares[2][7] = this.squares[4][7];
				this.squares[3][7] = this.squares[0][7];
				this.squares[0][7] = null;
				this.squares[1][7] = null;
				this.squares[4][7] = null;
			}
			else  { 
				this.squares[newX][newY] = this.squares[initX][initY]
				this.squares[initX][initY] = null
				ans.push([newX, newY])
				ans.push([initX, initY])

			}
		}
		ans.unshift(storeProps)
		ans.unshift([isCapture, isPromotion, isCastle, isEnPessant])
		return ans
	}

	reverseMove(conditions : boolean[], props : any[], initX : number, initY : number, newX : number, newY : number) {
		var piece : Piece = null
		var xVal : number = null
		var yVal : number = null
		var storePiece = this.squares[newX][newY]

		if (!this.gameOver || this.gameOver) {
			if (conditions[0]) {
				let stackElem = this.graveyard.pop()
				xVal = stackElem[0]
				yVal = stackElem[1]
				piece = stackElem[2]
				this.squares[initX][initY] = this.squares[newX][newY];
				this.squares[newX][newY] = piece
			}
			if (conditions[1]) {
				this.squares[initX][initY] = new Pawn(storePiece.name.substring(4), storePiece.color)
				if (!conditions[0])
					this.squares[newX][newY] = null
				
			}
			if (conditions[2]) {
				if (newY == 0 && newX == 2) {
					this.squares[4][0] = this.squares[2][0]
					this.squares[0][0] = this.squares[3][0]
					this.squares[1][0] = null
					this.squares[2][0] = null
					this.squares[3][0] = null
				}
				else if (newY == 0 && newX == 6) {
					this.squares[4][0] = this.squares[6][0]
					this.squares[7][0] = this.squares[5][0]
					this.squares[5][0] = null
					this.squares[6][0] = null
				}
				else if (newY == 7 && newX == 2) {
					this.squares[4][7] = this.squares[2][7]
					this.squares[0][7] = this.squares[3][7]
					this.squares[1][7] = null
					this.squares[2][7] = null
					this.squares[3][7] = null
				}
				else if (newY == 7 && newX == 6) {
					this.squares[4][7] = this.squares[6][7]
					this.squares[7][7] = this.squares[5][7]
					this.squares[5][7] = null
					this.squares[6][7] = null
				}
			}
			if (conditions[3]) {
				let stackElem = this.graveyard.pop()
				xVal = stackElem[0]
				yVal = stackElem[1]
				piece = stackElem[2]

				this.squares[initX][initY] = this.squares[newX][newY]
				this.squares[newX][newY] = null
				this.squares[xVal][yVal] = piece
			}
			if (!conditions[0] && !conditions[1] && !conditions[2] && !conditions[3]) {
				this.squares[initX][initY] = this.squares[newX][newY]
				this.squares[newX][newY] = null
			}
		}
		this.setProps(props)
	}

	//Returns a list of all the squares of the color variable that are checking the opposite color king
	//Note that the first coordinate in this list is always the king square of the opposite color
	
	lookForChecks(color : string) {
		let ans = []
		var kingSquare : number[] = []
		if (color === "White") {
			//Find the king
			for (let j = 0; j <= 7; j++) {
				for (let i = 0; i <= 7; i++) {
					if (isDef(this.squares[i][j]) && this.squares[i][j].name === "kingBlack") {
						kingSquare = [i, j]
						i = 8; 
						j = 8;
					}
				}
			}
			ans.push(kingSquare)

			//Go through all squares looking for white pieces and checks on them
			for (let i = 0; i <= 7; i++) {
				for (let j = 0; j <= 7; j++) {
					if (isDef(this.squares[i][j]) && this.squares[i][j].color === "White") {
						if (includes(kingSquare, this.squares[i][j].getMoves(this, i, j))) {
							ans.push([i, j]);
							i = 9; 
							j = 9;
						}
					}
				}
			}
		}
		else if (color === "Black") {
			//Find the king
			for (let j = 0; j <= 7; j++) {
				for (let i = 7; i >= 0; i--) {
					if (isDef(this.squares[i][j]) && this.squares[i][j].name === "kingWhite") {
						kingSquare = [i, j]
						i = -1; 
						j = 8;
					}
				}
			}
			ans.push(kingSquare)

			//Go through all squares looking for black pieces and checks on them
			for (let i = 0; i <= 7; i++) {
				for (let j = 0; j <= 7; j++) {
					if (isDef(this.squares[i][j]) && this.squares[i][j].color === "Black") {
						if (includes(kingSquare, this.squares[i][j].getMoves(this, i, j))) {
							ans.push([i, j]);
							j = 9;
							i = 9;
						}
					}
				}
			}
		}
		return ans
	}

	//check if the king of color is under check
	moveUnderCheck(color:string, initX:number, initY:number, newX:number,
    newY : number) {
		var ans = true
		let arr = this.move(initX, initY, newX, newY, true)

		var opcolor;
		if (color === "White")
			opcolor = "Black"
		else
			opcolor = "White"

		if (this.lookForChecks(opcolor).length == 1)
			ans = false
		else
			ans = true
		
		this.reverseMove(arr[0], arr[1], initX, initY, newX, newY)
		return ans
	}

	//Check to see if myColor has won
	checkEndingConditions(myColor : string) {
		var opColor = "White"
		if (myColor === "White")
			opColor = "Black"

		var flag : boolean = true;
		var mmoves;
		for (let i = 0; i <= 7; i++) {
			for (let j = 0; j <= 7; j++) {
				if (isDef(this.squares[i][j]) && this.squares[i][j].color === opColor) {
					mmoves = this.squares[i][j].getMoves(this, i, j)
					for (let cnt = 0; cnt < mmoves.length; cnt++) {
						if (!this.moveUnderCheck(opColor, i, j, mmoves[cnt][0], mmoves[cnt][1])) {
							flag = false;
							i = 8;
							j = 8;
							break;
						}
					}
				}
			}
		}
		
		if (flag) {
			if ( this.lookForChecks(myColor).length > 1) {
				return myColor
			}
			else {
				return "Draw"
			}
		}
		else {
			return null;
		}

	}
}





/*
	All Pieces
*/
abstract class Piece {
    name : string;
    color : string;
    image : HTMLImageElement;
	hasMoved : boolean;
    pointValue : number;

	constructor(name, color) {
		this.name = name;
		this.color = color;
		this.image = new Image(); 
		this.hasMoved = false;
		this.pointValue = 0;
	}
    abstract draw(context : any) : void;
    abstract getMoves(board : GameBoard, xPos : number, yPos : number) : any[];
}

class Pawn extends Piece {
	constructor(name : string, color : string) {
		super(name, color);
		this.pointValue = 1;
	}
	draw() {
		//this.image = new Image();
		if (this.color === "Black") {
			this.image.src = "pawnBlack.png";
		}
		else {
			this.image.src = "pawnWhite.png";
		}
	}
	getMoves (board : GameBoard, xPos : number, yPos : number) {
		let ans = [];
		if (this.color === "Black") {
			
			//Push one square down
			if (!isDef(board.squares[xPos][yPos + 1])) {
				ans.push([xPos, yPos + 1]);
				if (!isDef(board.squares[xPos][yPos + 2]) && yPos == 1)
					ans.push([xPos, yPos + 2]);
			}
			//Take to the left
			if (xPos > 0) {
				//Take regular
				if (isDef(board.squares[xPos - 1][yPos + 1]) && board.squares[xPos - 1][yPos + 1].color === "White") {
					ans.push([xPos - 1, yPos + 1]);
				}
			}

			if (xPos < 7) {
				//Take to the right
				if (isDef(board.squares[xPos + 1][yPos + 1]) && board.squares[xPos + 1][yPos + 1].color === "White") {
					ans.push([xPos + 1, yPos + 1]);
				}
			}
			
			if (isDef(board.justMovedTwo)) {

				//Take en pessant to the left
				if (board.justMovedTwo[0] === xPos - 1 && board.justMovedTwo[1] === yPos)
					ans.push([xPos - 1, yPos + 1])
				//Take en pessant to the right
				if (board.justMovedTwo[0] === xPos + 1 && board.justMovedTwo[1] === yPos)
					ans.push([xPos + 1, yPos + 1])
			}
			
		}
		else if (this.color === "White") {
			//Push one square up
			if (!isDef(board.squares[xPos][yPos - 1])) {
				ans.push([xPos, yPos - 1]);
				if (!isDef(board.squares[xPos][yPos - 2]) && yPos === 6)
					ans.push([xPos, yPos - 2])
			}
			//Take to the left
			if (xPos > 0) {
				if (isDef(board.squares[xPos - 1][yPos - 1]) && board.squares[xPos - 1][yPos - 1].color === "Black") {
					ans.push([xPos - 1, yPos - 1]);
				}
			}

			if (xPos < 7) {
				//Take to the right
				if (isDef(board.squares[xPos + 1][yPos - 1]) && board.squares[xPos + 1][yPos - 1].color === "Black") {
					ans.push([xPos + 1, yPos - 1]);
				}
			}
			
			if (isDef(board.justMovedTwo)) {
				//Take en pessant to the left
				if (board.justMovedTwo[0] === xPos - 1 && board.justMovedTwo[1] === yPos)
					ans.push([xPos - 1, yPos - 1])
				//Take en pessant to the right
				if (board.justMovedTwo[0] === xPos + 1 && board.justMovedTwo[1] === yPos)
					ans.push([xPos + 1, yPos - 1])
			}
			
		}
		return ans
	}
}


class Knight extends Piece {
	constructor(name : string, color : string) {
		super(name, color)
		this.pointValue = 3
	}
	getMoves (board : GameBoard, xPos : number, yPos : number) {
		let ans = []
		let increments = [[1,2], [2,1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
		for (let index = 0; index < increments.length; index++) {
			let newX = xPos + increments[index][0]
			let newY = yPos + increments[index][1]
			if (filterOnBoard([newX, newY]))
			if (!isDef(board.squares[newX][newY]) || board.squares[newX][newY].color !== this.color)
				ans.push([newX , newY])
		}
		return ans
	}
	draw(context) {
		if (this.color === "Black") {
			this.image.src = "knightBlack.png"
		}
		else {
			this.image.src = "knightWhite.png"
		}
	}
}
class Bishop extends Piece {
	constructor(name : string, color : string) {
		super(name,  color)
		this.pointValue = 3
	}
	getMoves (board : GameBoard, xPos : number, yPos : number) {
		let ans = []
		//Quadrant 1 diagonal
		for (let i = 1; (i + xPos) <= 7 && (i + yPos) <= 7; i++) { 
			let newX = i + xPos
			let newY = i + yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Quadrant 2 diagonal
		for (let i = 1; (xPos - i) >= 0 && (i + yPos) <= 7; i++) { 
			let newX = xPos - i
			let newY = i + yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Quadrant 3 diagonal
		for (let i = 1; (i + xPos) <= 7 && (yPos - i) >= 0; i++) { 
			let newX = i + xPos
			let newY = yPos - i
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Quadrant 4 diagonal
		for (let i = 1; (xPos - i) >= 0 && (yPos - i) >= 0; i++) { 
			let newX = xPos - i
			let newY = yPos - i
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}
		return ans
	}
	draw(context) {
		if (this.color === "Black") {
			this.image.src = "bishopBlack.png"
		}
		else {
			this.image.src = "bishopWhite.png"
		}
	}
}
class Rook extends Piece {
	constructor(name : string, color : string) {
		super(name, color)
		this.pointValue = 5
	}
	getMoves (board : GameBoard, xPos : number, yPos : number) {
		let ans = []
		//Right
		for (let i = 1; (i + xPos) <= 7; i++) { 
			let newX = i + xPos
			let newY = yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Up
		for (let i = 1; (i + yPos) <= 7; i++) { 
			let newX = xPos
			let newY = i + yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Left
		for (let i = 1; (xPos - i) >= 0; i++) { 
			let newX = xPos - i
			let newY = yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Down
		for (let i = 1; (yPos - i) >= 0; i++) { 
			let newX = xPos
			let newY = yPos - i
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}
		return ans
	}


	draw(context) {
		if (this.color === "Black") {
			this.image.src = "rookBlack.png"
		}
		else {
			this.image.src = "rookWhite.png"
		}
	}
}

class Queen extends Piece {
	constructor(name : string, color : string) {
		super(name,  color)
		this.pointValue = 9
	}
	getMoves (board : GameBoard, xPos : number, yPos : number) {
		let ans = []
		//Right
		for (let i = 1; (i + xPos) <= 7; i++) { 
			let newX = i + xPos
			let newY = yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Up
		for (let i = 1; (i + yPos) <= 7; i++) { 
			let newX = xPos
			let newY = i + yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Left
		for (let i = 1; (xPos - i) >= 0; i++) { 
			let newX = xPos - i
			let newY = yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Down
		for (let i = 1; (yPos - i) >= 0; i++) { 
			let newX = xPos
			let newY = yPos - i
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Quadrant 1 diagonal
		for (let i = 1; (i + xPos) <= 7 && (i + yPos) <= 7; i++) { 
			let newX = i + xPos
			let newY = i + yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Quadrant 2 diagonal
		for (let i = 1; (xPos - i) >= 0 && (i + yPos) <= 7; i++) { 
			let newX = xPos - i
			let newY = i + yPos
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Quadrant 3 diagonal
		for (let i = 1; (i + xPos) <= 7 && (yPos - i) >= 0; i++) { 
			let newX = i + xPos
			let newY = yPos - i
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		//Quadrant 4 diagonal
		for (let i = 1; (xPos - i) >= 0 && (yPos - i) >= 0; i++) { 
			let newX = xPos - i
			let newY = yPos - i
			if (!isDef(board.squares[newX][newY]))
				ans.push([newX, newY])
			else if (board.squares[newX][newY].color !== this.color){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}

		ans = ans.filter(filterOnBoard)
		return ans
	}
	draw(context) {
		if (this.color === "Black") {
			this.image.src = "queenBlack.png"
		}
		else {
			this.image.src = "queenWhite.png"
		}
	}
}
class King extends Piece {
	constructor(name : string, color : string) {
		super(name, color)
		this.pointValue = 2000
	}
	getMoves (board : GameBoard, xPos : number, yPos : number) {
		let ans = []
		let increments = [[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0]]
		for (let index = 0; index < increments.length; index++) {
			let newX = xPos + increments[index][0]
			let newY = yPos + increments[index][1]
			if (filterOnBoard([newX, newY]))
			if (!isDef(board.squares[newX][newY]) || board.squares[newX][newY].color !== this.color)
				ans.push([newX , newY])
		}	
		if (this.color === "Black" && !board.blackKingHasMoved) {
			//Castle Queen Side
			if (!isDef(board.squares[1][0]) && !isDef(board.squares[2][0]) && !isDef(board.squares[3][0]) && !board.blackRook0HasMoved)
				ans.push([2,0])
			//Castle King Side
			if (!isDef(board.squares[5][0]) && !isDef(board.squares[6][0]) && !board.blackRook1HasMoved)
				ans.push([6,0])			

		}
		else if (this.color === "White" && !board.whiteKingHasMoved){
			//Castle Queen Side
			if (!isDef(board.squares[1][7]) && !isDef(board.squares[2][7]) && !isDef(board.squares[3][7]) && !board.whiteRook0HasMoved)
				ans.push([2,7])
			//Castle King Side
			if (!isDef(board.squares[5][7]) && !isDef(board.squares[6][7]) && !board.whiteRook1HasMoved)	
				ans.push([6,7])
		}
		return ans
	}

	draw(context) {
		if (this.color === "Black") {
			this.image.src = "kingBlack.png"
		}
		else {
			this.image.src = "kingWhite.png"
		}
	}
}



/*
	Gameplay
*/


let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

canvas = document.getElementById("canvas") as HTMLCanvasElement;
context = canvas.getContext('2d')
const board = new GameBoard()
for (let i = 0; i < 8; i++) {
	for (let j = 0; j < 8; j++) {
		if ((i + j) % 2 == 0)
			context.fillStyle = "#9A7B4F"
		else
			context.fillStyle = "#481F01"
		context.fillRect(i * (BOARD_SIZE/8), j * (BOARD_SIZE/8), (BOARD_SIZE/8), (BOARD_SIZE/8))
	}
}

board.setup()
board.update(null, context)

var highlightedMoves = []
var squaresAreHighlighted = false
var storeSquare = []
const rect = canvas.getBoundingClientRect()
var gameOver : boolean = false
var movesList
var whiteProps = null
var whiteMove = null
var blackProps = null
var blackMove = null
let cpu = new CPU()

let undoButton = document.getElementById("undo_button")
undoButton.addEventListener('click', 
	(event) => {
		
		
		if (whiteProps !== null && blackProps !== null) {
			board.reverseMove(blackProps[0], blackProps[1], blackMove[0], blackMove[1], blackMove[2], blackMove[3])
			board.reverseMove(whiteProps[0], whiteProps[1], whiteMove[0], whiteMove[1], whiteMove[2], whiteMove[3])
			board.update(null, context);
		}
		
	}
)

let drawButton = document.getElementById("draw_button")
drawButton.addEventListener('click', 
	(event) => {
		document.getElementById("winner_bar").innerHTML = "Draw!"
		let border = document.querySelector("canvas")
		border.style["border-color"] = "Red"
		gameOver = true;		
	}

)

canvas.addEventListener('click', 
	(event) => {

		if (gameOver)
			return
		//Get the location of this click
		const xClick = Math.floor((event.clientX - rect.left)/(BOARD_SIZE/8))
		const yClick = Math.floor((event.clientY - rect.top)/(BOARD_SIZE/8))

		//If we clicked on a blank square trying to move it or we picked a square of the wrong color
		if (!squaresAreHighlighted) {
			if (  !isDef(board.squares[xClick][yClick])  || (board.squares[xClick][yClick].color === "Black") )   
				return;
		}
		
		//If we want to move a piece and it is valid
		if (!squaresAreHighlighted ) {
			storeSquare = [xClick, yClick]
			highlightedMoves = board.squares[xClick][yClick].getMoves(board, xClick, yClick)
			
			//Filter the highlighted moves to look for checks
			highlightedMoves = highlightedMoves.filter(function (move) {return !board.moveUnderCheck("White", xClick, yClick, move[0], move[1])} );
			
			for (let i = 0; i < highlightedMoves.length; i++) {
				let xCircle = highlightedMoves[i][0]
				let yCircle = highlightedMoves[i][1]
				context.fillStyle = "blue"
				context.fillRect(xCircle*(BOARD_SIZE/8), yCircle*(BOARD_SIZE/8), (BOARD_SIZE/40), (BOARD_SIZE/40))
			}
			squaresAreHighlighted = true
		}

		//We select a square not in the highlighted list
		else if (squaresAreHighlighted &&  !includes([xClick, yClick], highlightedMoves)) {
			//Clear the previous highlightedMoves list
			for (let i = 0; i < highlightedMoves.length; i++) {
				let xCircle = highlightedMoves[i][0]
				let yCircle = highlightedMoves[i][1]
				if ((xCircle + yCircle) % 2 == 0)
					context.fillStyle = "#9A7B4F"
				else
					context.fillStyle = "#481F01"
				context.fillRect(xCircle * (BOARD_SIZE/8), yCircle * (BOARD_SIZE/8), (BOARD_SIZE/40), (BOARD_SIZE/40))
			}
			squaresAreHighlighted = false;
		}

		//Move the piece
		else if (squaresAreHighlighted) {
			whiteProps = board.move(storeSquare[0], storeSquare[1], xClick, yClick, false)
			
			whiteMove = [storeSquare[0], storeSquare[1], xClick, yClick]
			//Remove the piece's image from its previous square
			board.update(whiteProps.slice(2), context);

			//Clear highlighted squares
			for (let i = 0; i < highlightedMoves.length; i++) {
				let xCircle = highlightedMoves[i][0]
				let yCircle = highlightedMoves[i][1]
				if ((xCircle + yCircle) % 2 == 0)
					context.fillStyle = "#9A7B4F"
				else
					context.fillStyle = "#481F01"
				context.fillRect(xCircle * (BOARD_SIZE/8), yCircle * (BOARD_SIZE/8), (BOARD_SIZE/40), (BOARD_SIZE/40))
			}
			squaresAreHighlighted = false;

			//Look for checkmates
			let ak = board.checkEndingConditions("White")
			if (ak === "Draw") {
				document.getElementById("winner_bar").innerHTML = "Draw!"
				let border = document.querySelector("canvas")
				border.style["border-color"] = "Red"
				gameOver = true;
			}
			else if (ak === "White") {
				document.getElementById("winner_bar").innerHTML = "White wins!"
				let border = document.querySelector("canvas")
				border.style["border-color"] = "Green"
				gameOver = true;
			}



			setTimeout(function(){
				let blacksMove = cpu.getMove(board)
				blackMove = blacksMove
				blackProps = board.move(blacksMove[0], blacksMove[1], blacksMove[2], blacksMove[3], false)
				board.update(blackProps.slice(2), context)
				//Look for checkmates
				ak = board.checkEndingConditions("Black")
				if (ak === "Draw") {
					document.getElementById("winner_bar").innerHTML = "Draw!"
					let border = document.querySelector("canvas")
					border.style["border-color"] = "Red"
					gameOver = true;
				}
				else if (ak === "Black") {
					document.getElementById("winner_bar").innerHTML = "Black wins!"
					let border = document.querySelector("canvas")
					border.style["border-color"] = "Red"
					gameOver = true;
				}
			}, 150);




			
		}
	}
)