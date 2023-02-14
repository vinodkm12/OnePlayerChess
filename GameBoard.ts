
import {Piece} from "pieces.js"

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
	justMovedTwo : number[] | null

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

	//short name 
	shortstring() {
		let ans : string = ""
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				if (isDef(this.squares[row][col]))
					ans = ans + this.squares[row][col].shortname()
				else {
					ans = ans + "z"
				}
			}
		}
		return ans;
	}

	//Gets a list of many relevant properties of the chessboard
	//[blackKingHasMoved, whiteKingHasMoved, blackRook0HasMoved, blackRook1HasMoved, whiteRook0HasMoved, whiteRook1HasMoved, 
    //   gameOver, board points, justMoved(a pawn)TwoSquares]
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
	//Return value: [move properties list, stored properties (before move executed), square changed 1, square changed 2, ...]
	//Move properties list format: [isCapture, isPromotion, isCastle, isEnPessant]
	//Stored properties list format: [blackKingHasMoved, whiteKingHasMoved, blackRook0HasMoved, blackRook1HasMoved, 
	//     whiteRook0HasMoved, whiteRook1HasMoved, gameOver, board points, justMoved(a pawn)TwoSquares]
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
					if (isDef(this.squares[i][j]) && this.squares[i][j].shortname() === "l") {
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
					if (isDef(this.squares[i][j]) && this.squares[i][j].shortname() === "k") {
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

		let blackKingExists : boolean = false
		let whiteKingExists : boolean = false

		for (let i = 0; i <= 7; i++) {
			for (let j = 0; j <= 7; j++) {
				if (isDef(this.squares[i][j]) && this.squares[i][j].color === opColor) {
					mmoves = this.squares[i][j].getMoves(this, i, j)
					for (let cnt = 0; cnt < mmoves.length; cnt++) {
						if (!this.moveUnderCheck(opColor, i, j, mmoves[cnt][0], mmoves[cnt][1])) {
							flag = false;
							break;
						}
					}
				}
				if (isDef(this.squares[i][j]) && this.squares[i][j].name == 'kingBlack')
					blackKingExists = true
				if (isDef(this.squares[i][j]) && this.squares[i][j].name == 'kingWhite')
					whiteKingExists = true
			}
		}
		

		if ((!blackKingExists) && (!whiteKingExists)) {
			return "Draw"
		}
		else if (!blackKingExists){
			return "White"
		}
		else if (!whiteKingExists) {
			return "Black"
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
