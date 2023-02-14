
/*
	Helpers
*/
const BOARD_SIZE = 480
const DEPTH = 4
var misses = 0
var hits = 0
function filterOnBoard(coord : number[]) {
	let i : number = coord[0]
	let j : number  = coord[1]
	return ((0 <= i && i <= 7) && (0 <= j && j <= 7));
}

function isDef(x : any) {
	return !(x === undefined || x === null)
}

//a is guaranteed to be a size 2 list
//listA is a list of size 2 lists
function includes(a : number[], listA) {
	for (let i = 0; i < listA.length; i++) {
		if (listA[i][0] === a[0] && listA[i][1] === a[1])
			return true;
	}
	return false;
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
		console.log("Hits : " + hits + " Misses: " + misses)
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
