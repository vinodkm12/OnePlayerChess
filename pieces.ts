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
	abstract shortname() : string; 
}

class Pawn extends Piece {
	constructor(name : string, color : string) {
		super(name, color);
		this.pointValue = 1;
	}
	draw() {
		//this.image = new Image();
		if (this.color[0] === "B") {
			this.image.src = "pawnBlack.png";
		}
		else {
			this.image.src = "pawnWhite.png";
		}
	}
	getMoves (board : GameBoard, xPos : number, yPos : number) {
		let ans = [];
		if (this.color[0] === "B") {
			
			//Push one square down
			if (!isDef(board.squares[xPos][yPos + 1])) {
				ans.push([xPos, yPos + 1]);
				if (!isDef(board.squares[xPos][yPos + 2]) && yPos == 1)
					ans.push([xPos, yPos + 2]);
			}
			//Take to the left
			if (xPos > 0) {
				//Take regular
				if (isDef(board.squares[xPos - 1][yPos + 1]) && board.squares[xPos - 1][yPos + 1].color[0] === "W") {
					ans.push([xPos - 1, yPos + 1]);
				}
			}

			if (xPos < 7) {
				//Take to the right
				if (isDef(board.squares[xPos + 1][yPos + 1]) && board.squares[xPos + 1][yPos + 1].color[0] === "W") {
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
				if (isDef(board.squares[xPos - 1][yPos - 1]) && board.squares[xPos - 1][yPos - 1].color[0] === "B") {
					ans.push([xPos - 1, yPos - 1]);
				}
			}

			if (xPos < 7) {
				//Take to the right
				if (isDef(board.squares[xPos + 1][yPos - 1]) && board.squares[xPos + 1][yPos - 1].color[0] === "B") {
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

	shortname() {
		if (this.color[0] == "W") {
			return 'a';
		}
		else {
			return 'b';
		}
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
			if (!isDef(board.squares[newX][newY]) || board.squares[newX][newY].color[0] !== this.color[0])
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
	shortname() {
		if (this.color[0] == "W") {
			return 'c';
		}
		else {
			return 'd';
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
	shortname () {
		if (this.color[0] == "W") {
			return 'e';
		}
		else {
			return 'f';
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
				ans.push([newX, newY])
				break;
			}
			else 
				break;
		}
		return ans
	}


	draw(context) {
		if (this.color[0] === "B") {
			this.image.src = "rookBlack.png"
		}
		else {
			this.image.src = "rookWhite.png"
		}
	}

	shortname() {
		if (this.color[0] == "W") {
			return 'g';
		}
		else {
			return 'h';
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
			else if (board.squares[newX][newY].color[0] !== this.color[0]){
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
		if (this.color[0] === "B") {
			this.image.src = "queenBlack.png"
		}
		else {
			this.image.src = "queenWhite.png"
		}
	}

	shortname() {
		if (this.color[0] == "W") {
			return 'i';
		}
		else {
			return 'j';
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
			if (!isDef(board.squares[newX][newY]) || board.squares[newX][newY].color[0] !== this.color[0])
				ans.push([newX , newY])
		}	
		if (this.color[0] === "B" && !board.blackKingHasMoved) {
			//Castle Queen Side
			if (!isDef(board.squares[1][0]) && !isDef(board.squares[2][0]) && !isDef(board.squares[3][0]) && !board.blackRook0HasMoved)
				ans.push([2,0])
			//Castle King Side
			if (!isDef(board.squares[5][0]) && !isDef(board.squares[6][0]) && !board.blackRook1HasMoved)
				ans.push([6,0])			

		}
		else if (this.color[0] === "W" && !board.whiteKingHasMoved){
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

	shortname() {
		if (this.color == "White") {
			return 'k';
		}
		else {
			return 'l';
		}
	}
}
