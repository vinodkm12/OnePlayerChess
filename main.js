var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
    Helpers
*/
var BOARD_SIZE = 480;
var DEPTH = 5;
var misses = 0;
var hits = 0;
function filterOnBoard(coord) {
    var i = coord[0];
    var j = coord[1];
    return ((0 <= i && i <= 7) && (0 <= j && j <= 7));
}
function isDef(x) {
    return !(x === undefined || x === null);
}
function includes(a, listA) {
    for (var i = 0; i < listA.length; i++) {
        if (listA[i][0] === a[0] && listA[i][1] === a[1])
            return true;
    }
    return false;
}
/*
    CPU Class
*/
var CPU = /** @class */ (function () {
    function CPU() {
        this.maxiCache = {};
        this.miniCache = {};
    }
    CPU.prototype.getMove = function (board) {
        var myDepth = DEPTH;
        var numPieces = 0;
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (isDef(board.squares[i][j])) {
                    numPieces++;
                }
            }
        }
        if (numPieces < 12) {
            myDepth = DEPTH + 3;
        }
        if (numPieces < 6) {
            myDepth = DEPTH + 6;
        }
        if (this.maxiCache.length > 300000)
            this.maxiCache = {};
        if (this.miniCache.length > 300000)
            this.miniCache = {};
        var arc = this.mini(board, myDepth, -1 * Infinity, Infinity);
        return arc[0];
    };
    CPU.prototype.evalBoard = function (board) {
        var ans = board.points * 10.0;
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (isDef(board.squares[i][j])) {
                    if (board.squares[i][j].color === "Black") {
                        if (board.squares[i][j].name === "kingBlack")
                            ans += (board.squares[i][j].getMoves(board, i, j).length) / 6.0;
                        else
                            ans -= (board.squares[i][j].getMoves(board, i, j).length) / 21.0;
                    }
                    else {
                        if (board.squares[i][j].name === "kingWhite")
                            ans -= (board.squares[i][j].getMoves(board, i, j).length) / 6.0;
                        else
                            ans += (board.squares[i][j].getMoves(board, i, j).length) / 21.0;
                    }
                }
            }
        }
        return ans;
    };
    CPU.prototype.maxi = function (board, depth, alpha, beta) {
        var moves = [];
        var score;
        var tiebreak = 0.0;
        var key = board.shortstring();
        var temp = this.maxiCache[key];
        if (isDef(temp)) {
            var cacheDepth = temp[0];
            if (cacheDepth >= depth) {
                hits++;
                return temp[1];
            }
        }
        misses++;
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (isDef(board.squares[i][j])) {
                    if (board.squares[i][j].color[0] === "W") {
                        var tempList = board.squares[i][j].getMoves(board, i, j);
                        for (var k = 0; k < tempList.length; k++) {
                            moves.push([i, j, tempList[k][0], tempList[k][1]]);
                        }
                        if (depth === 0) {
                            if (board.squares[i][j].shortname() === "k") {
                                tiebreak = tiebreak - (tempList.length) / 12.0;
                            }
                            else {
                                tiebreak = tiebreak + (tempList.length) / 42.0;
                            }
                        }
                    }
                    else if (depth === 0) {
                        var tempList = board.squares[i][j].getMoves(board, i, j);
                        if (board.squares[i][j].shortname() === "l")
                            tiebreak = tiebreak + (tempList.length) / 12.0;
                        else
                            tiebreak = tiebreak - (tempList.length) / 42.0;
                    }
                }
            }
        }
        var maxScore = -1 * Infinity;
        var bestMove = null;
        if (depth === 0) {
            for (var i = 0; i < moves.length; i++) {
                var arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true);
                score = board.points * 10.0 + tiebreak;
                if (score > maxScore) {
                    maxScore = score;
                    bestMove = moves[i];
                }
                if (maxScore >= beta) {
                    board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
                    this.maxiCache[key] = [depth, [bestMove, maxScore]];
                    return [bestMove, maxScore];
                }
                if (maxScore > alpha)
                    alpha = maxScore;
                board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
            }
        }
        else {
            for (var i = 0; i < moves.length; i++) {
                var arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true);
                var pair;
                if (!board.gameOver)
                    pair = this.mini(board, depth - 1, alpha, beta);
                else
                    pair = [null, board.points * 10.0];
                if (pair !== null) {
                    score = pair[1];
                    if (score > maxScore) {
                        maxScore = score;
                        bestMove = moves[i];
                    }
                    if (maxScore >= beta) {
                        board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
                        this.maxiCache[key] = [depth, [bestMove, maxScore]];
                        return [bestMove, maxScore];
                    }
                    if (maxScore > alpha)
                        alpha = maxScore;
                }
                board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
            }
        }
        this.maxiCache[key] = [depth, [bestMove, maxScore]];
        return [bestMove, maxScore];
    };
    CPU.prototype.mini = function (board, depth, alpha, beta) {
        var moves = [];
        var score;
        var tiebreak = 0;
        var key = board.shortstring();
        var temp = this.miniCache[key];
        if (isDef(temp)) {
            if (temp[0] >= depth) {
                return temp[1];
            }
        }
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (isDef(board.squares[i][j])) {
                    if (board.squares[i][j].color[0] === "B") {
                        var tempList = board.squares[i][j].getMoves(board, i, j);
                        for (var k = 0; k < tempList.length; k++) {
                            moves.push([i, j, tempList[k][0], tempList[k][1]]);
                        }
                        if (depth === 0) {
                            if (board.squares[i][j].shortname() === "l") {
                                tiebreak = tiebreak + (tempList.length) / 12.0;
                            }
                            else {
                                tiebreak = tiebreak - (tempList.length) / 42.0;
                            }
                        }
                    }
                    else if (depth === 0) {
                        var tempList = board.squares[i][j].getMoves(board, i, j);
                        if (board.squares[i][j].shortname() === "k")
                            tiebreak = tiebreak - (tempList.length) / 12.0;
                        else
                            tiebreak = tiebreak + (tempList.length) / 42.0;
                    }
                }
            }
        }
        var minScore = Infinity;
        var bestMove = null;
        if (depth === 0) {
            for (var i = 0; i < moves.length; i++) {
                var arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true);
                score = board.points * 10.0 + tiebreak;
                if (score < minScore) {
                    minScore = score;
                    bestMove = moves[i];
                }
                if (minScore < beta)
                    beta = minScore;
                if (minScore <= alpha) {
                    board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
                    this.miniCache[key] = [depth, [bestMove, minScore]];
                    return [bestMove, minScore];
                }
                board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
            }
        }
        else {
            for (var i = 0; i < moves.length; i++) {
                var arr = board.move(moves[i][0], moves[i][1], moves[i][2], moves[i][3], true);
                var pair;
                if (!board.gameOver) {
                    pair = this.maxi(board, depth - 1, alpha, beta);
                }
                else {
                    pair = [null, board.points * 10.0];
                }
                if (pair !== null) {
                    score = pair[1];
                    if (score < minScore) {
                        minScore = score;
                        bestMove = moves[i];
                    }
                    if (minScore < beta)
                        beta = minScore;
                    if (minScore <= alpha) {
                        board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
                        this.miniCache[key] = [depth, [bestMove, minScore]];
                        return [bestMove, minScore];
                    }
                }
                board.reverseMove(arr[0], arr[1], moves[i][0], moves[i][1], moves[i][2], moves[i][3]);
            }
        }
        this.miniCache[key] = [depth, [bestMove, minScore]];
        return [bestMove, minScore, tiebreak];
    };
    return CPU;
}());
/*
GameBoard class
*/
var GameBoard = /** @class */ (function () {
    function GameBoard() {
        this.gameOver = false;
        this.blackKingHasMoved = false;
        this.whiteKingHasMoved = false;
        this.blackRook0HasMoved = false;
        this.blackRook1HasMoved = false;
        this.whiteRook0HasMoved = false;
        this.whiteRook1HasMoved = false;
        //If a pawn has just moved two squares up, this.justMovedTwo stores
        //		the location of the pawn that just moved up
        this.justMovedTwo = null;
        this.squares = [[], [], [], [], [], [], [], []];
        for (var i = 0; i <= 7; i++) {
            for (var j = 0; j <= 7; j++) {
                this.squares[i][j] = null;
            }
        }
        this.points = 0;
        this.graveyard = [];
    }
    //short name 
    GameBoard.prototype.shortstring = function () {
        var ans = "";
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                if (isDef(this.squares[row][col]))
                    ans = ans + this.squares[row][col].shortname();
                else {
                    ans = ans + "z";
                }
            }
        }
        return ans;
    };
    //Gets a list of many relevant properties of the chessboard
    GameBoard.prototype.getProps = function () {
        var ans = [];
        ans.push(this.blackKingHasMoved);
        ans.push(this.whiteKingHasMoved);
        ans.push(this.blackRook0HasMoved);
        ans.push(this.blackRook1HasMoved);
        ans.push(this.whiteRook0HasMoved);
        ans.push(this.whiteRook1HasMoved);
        ans.push(this.gameOver);
        ans.push(this.points);
        ans.push(this.justMovedTwo);
        return ans;
    };
    //Sets a list of many relevant properties of the chessboard from another list
    //Usually called as a pair function with getProps()
    GameBoard.prototype.setProps = function (l) {
        this.blackKingHasMoved = l[0];
        this.whiteKingHasMoved = l[1];
        this.blackRook0HasMoved = l[2];
        this.blackRook1HasMoved = l[3];
        this.whiteRook0HasMoved = l[4];
        this.whiteRook1HasMoved = l[5];
        this.gameOver = l[6];
        this.points = l[7];
        this.justMovedTwo = l[8];
    };
    GameBoard.prototype.setup = function () {
        for (var i = 0; i <= 7; i++) {
            for (var j = 0; j <= 7; j++) {
                if (i == 1 && j == 7) {
                    this.squares[i][j] = new Knight("knightWhite0", "White");
                }
                else if (i == 6 && j == 7) {
                    this.squares[i][j] = new Knight("knightWhite1", "White");
                }
                else if (i == 1 && j == 0) {
                    this.squares[i][j] = new Knight("knightBlack0", "Black");
                }
                else if (i == 6 && j == 0) {
                    this.squares[i][j] = new Knight("knightBlack1", "Black");
                }
                else if (i == 4 && j == 0) {
                    this.squares[i][j] = new King("kingBlack", "Black");
                }
                else if (i == 4 && j == 7) {
                    this.squares[i][j] = new King("kingWhite", "White");
                }
                else if (i == 2 && j == 0) {
                    this.squares[i][j] = new Bishop("bishopBlack0", "Black");
                }
                else if (i == 5 && j == 0) {
                    this.squares[i][j] = new Bishop("bishopBlack1", "Black");
                }
                else if (i == 2 && j == 7) {
                    this.squares[i][j] = new Bishop("bishopWhite0", "White");
                }
                else if (i == 5 && j == 7) {
                    this.squares[i][j] = new Bishop("bishopWhite1", "White");
                }
                else if (i == 0 && j == 0) {
                    this.squares[i][j] = new Rook("rookBlack0", "Black");
                }
                else if (i == 7 && j == 0) {
                    this.squares[i][j] = new Rook("rookBlack1", "Black");
                }
                else if (i == 0 && j == 7) {
                    this.squares[i][j] = new Rook("rookWhite0", "White");
                }
                else if (i == 7 && j == 7) {
                    this.squares[i][j] = new Rook("rookWhite1", "White");
                }
                else if (i == 3 && j == 0) {
                    this.squares[i][j] = new Queen("queenBlack", "Black");
                }
                else if (i == 3 && j == 7) {
                    this.squares[i][j] = new Queen("queenWhite", "White");
                }
                else if (j == 1) {
                    this.squares[i][j] = new Pawn("pawnBlack" + i, "Black");
                }
                else if (j == 6) {
                    this.squares[i][j] = new Pawn("pawnWhite" + i, "White");
                }
                else {
                    this.squares[i][j] = null;
                }
            }
        }
    };
    /*
        Function to update display of chessboard stored in canvas context
        If sqList is null, update all of the squares in the chessboard
        Otherwise, update all of the locations in sqList
    */
    GameBoard.prototype.update = function (sqList, context) {
        if (sqList === null) {
            var _loop_1 = function (i) {
                var _loop_3 = function (j) {
                    if ((i + j) % 2 == 0)
                        context.fillStyle = "#9A7B4F";
                    else
                        context.fillStyle = "#481F01";
                    context.fillRect(i * (BOARD_SIZE / 8), j * (BOARD_SIZE / 8), (BOARD_SIZE / 8), (BOARD_SIZE / 8));
                    if (isDef(this_1.squares[i][j])) {
                        this_1.squares[i][j].draw(context);
                        var temp2_1 = this_1.squares[i][j];
                        temp2_1.image.onload = function () { context.drawImage(temp2_1.image, i * (BOARD_SIZE / 8), j * (BOARD_SIZE / 8), (BOARD_SIZE / 8), (BOARD_SIZE / 8)); };
                    }
                };
                for (var j = 0; j < 8; j++) {
                    _loop_3(j);
                }
            };
            var this_1 = this;
            for (var i = 0; i < 8; i++) {
                _loop_1(i);
            }
        }
        else {
            var _loop_2 = function (cnt) {
                var i = sqList[cnt][0];
                var j = sqList[cnt][1];
                if ((i + j) % 2 == 0)
                    context.fillStyle = "#9A7B4F";
                else
                    context.fillStyle = "#481F01";
                context.fillRect(i * (BOARD_SIZE / 8), j * (BOARD_SIZE / 8), (BOARD_SIZE / 8), (BOARD_SIZE / 8));
                if (isDef(this_2.squares[i][j])) {
                    this_2.squares[i][j].draw(context);
                    var temp2_2 = this_2.squares[i][j];
                    temp2_2.image.onload = function () { context.drawImage(temp2_2.image, i * (BOARD_SIZE / 8), j * (BOARD_SIZE / 8), (BOARD_SIZE / 8), (BOARD_SIZE / 8)); };
                }
            };
            var this_2 = this;
            for (var cnt = 0; cnt < sqList.length; cnt++) {
                _loop_2(cnt);
            }
        }
        document.getElementById("winner_bar").innerHTML = "" + this.points;
    };
    //Order: isCapture, isPromotion, isCastle, isEnPessant
    GameBoard.prototype.move = function (initX, initY, newX, newY, suppress) {
        var ans = [];
        var isCapture = false;
        var isPromotion = false;
        var isCastle = false;
        var isEnPessant = false;
        var storeProps = this.getProps();
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
            if (this.squares[initX][initY].name.substring(0, 4) === "pawn" && Math.abs(newY - initY) > 1.5) {
                this.justMovedTwo = [newX, newY];
            }
            else
                this.justMovedTwo = null;
            //If it's a capture, increment point value
            if (isDef(this.squares[newX][newY])) {
                if (this.squares[newX][newY].color === "White")
                    this.points = this.points - this.squares[newX][newY].pointValue;
                else
                    this.points = this.points + this.squares[newX][newY].pointValue;
                if (this.squares[newX][newY].name === "kingWhite" || this.squares[newX][newY].name === "kingBlack")
                    this.gameOver = true;
                this.graveyard.push([newX, newY, this.squares[newX][newY]]);
                isCapture = true;
            }
            //White promotion
            if (this.squares[initX][initY].name.substring(0, 5) === "pawnW" && newY === 0) {
                var name_1 = this.squares[initX][initY].name;
                this.squares[initX][initY] = null;
                this.squares[newX][newY] = new Queen("PROM" + name_1, "White");
                this.points += 8;
                ans.push([newX, newY]);
                ans.push([initX, initY]);
                isPromotion = true;
            }
            //Black promotion
            else if (this.squares[initX][initY].name.substring(0, 5) === "pawnB" && newY === 7) {
                var name_2 = this.squares[initX][initY].name;
                this.squares[initX][initY] = null;
                this.squares[newX][newY] = new Queen("PROM" + name_2, "Black");
                this.points -= 8;
                ans.push([newX, newY]);
                ans.push([initX, initY]);
                isPromotion = true;
            }
            //White en pessant
            else if (this.squares[initX][initY].name.substring(0, 5) === "pawnW" &&
                !isDef(this.squares[newX][newY]) && initX != newX) {
                isEnPessant = true;
                this.graveyard.push([newX, newY + 1, this.squares[newX][newY + 1]]);
                this.squares[newX][newY] = this.squares[initX][initY];
                this.squares[initX][initY] = null;
                this.squares[newX][newY + 1] = null;
                ans.push([initX, initY]);
                ans.push([newX, newY]);
                ans.push([newX, newY + 1]);
                this.points++;
            }
            //Black en pessant
            else if (this.squares[initX][initY].name.substring(0, 5) === "pawnB" &&
                !isDef(this.squares[newX][newY]) && initX != newX) {
                isEnPessant = true;
                this.graveyard.push([newX, newY - 1, this.squares[newX][newY - 1]]);
                this.squares[newX][newY] = this.squares[initX][initY];
                this.squares[initX][initY] = null;
                this.squares[newX][newY - 1] = null;
                ans.push([initX, initY]);
                ans.push([newX, newY]);
                ans.push([newX, newY - 1]);
                this.points--;
            }
            //Black king side castle
            else if (this.squares[initX][initY].name === "kingBlack" && newX === 6 && initX === 4) {
                isCastle = true;
                ans.push([4, 0]);
                ans.push([5, 0]);
                ans.push([6, 0]);
                ans.push([7, 0]);
                this.points = this.points - 0.5;
                this.squares[6][0] = this.squares[4][0];
                this.squares[5][0] = this.squares[7][0];
                this.squares[4][0] = null;
                this.squares[7][0] = null;
            }
            //Black Queen side castle 
            else if (this.squares[initX][initY].name === "kingBlack" && newX === 2 && initX === 4) {
                isCastle = true;
                this.points = this.points - 0.5;
                ans.push([4, 0]);
                ans.push([3, 0]);
                ans.push([2, 0]);
                ans.push([1, 0]);
                ans.push([0, 0]);
                this.squares[2][0] = this.squares[4][0];
                this.squares[3][0] = this.squares[0][0];
                this.squares[0][0] = null;
                this.squares[1][0] = null;
                this.squares[4][0] = null;
            }
            //White king side castle 
            else if (this.squares[initX][initY].name === "kingWhite" && newX === 6 && initX === 4) {
                isCastle = true;
                ans.push([4, 7]);
                ans.push([5, 7]);
                ans.push([6, 7]);
                ans.push([7, 7]);
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
                ans.push([3, 7]);
                ans.push([2, 7]);
                ans.push([1, 7]);
                ans.push([0, 7]);
                this.squares[2][7] = this.squares[4][7];
                this.squares[3][7] = this.squares[0][7];
                this.squares[0][7] = null;
                this.squares[1][7] = null;
                this.squares[4][7] = null;
            }
            else {
                this.squares[newX][newY] = this.squares[initX][initY];
                this.squares[initX][initY] = null;
                ans.push([newX, newY]);
                ans.push([initX, initY]);
            }
        }
        ans.unshift(storeProps);
        ans.unshift([isCapture, isPromotion, isCastle, isEnPessant]);
        return ans;
    };
    GameBoard.prototype.reverseMove = function (conditions, props, initX, initY, newX, newY) {
        var piece = null;
        var xVal = null;
        var yVal = null;
        var storePiece = this.squares[newX][newY];
        if (!this.gameOver || this.gameOver) {
            if (conditions[0]) {
                var stackElem = this.graveyard.pop();
                xVal = stackElem[0];
                yVal = stackElem[1];
                piece = stackElem[2];
                this.squares[initX][initY] = this.squares[newX][newY];
                this.squares[newX][newY] = piece;
            }
            if (conditions[1]) {
                this.squares[initX][initY] = new Pawn(storePiece.name.substring(4), storePiece.color);
                if (!conditions[0])
                    this.squares[newX][newY] = null;
            }
            if (conditions[2]) {
                if (newY == 0 && newX == 2) {
                    this.squares[4][0] = this.squares[2][0];
                    this.squares[0][0] = this.squares[3][0];
                    this.squares[1][0] = null;
                    this.squares[2][0] = null;
                    this.squares[3][0] = null;
                }
                else if (newY == 0 && newX == 6) {
                    this.squares[4][0] = this.squares[6][0];
                    this.squares[7][0] = this.squares[5][0];
                    this.squares[5][0] = null;
                    this.squares[6][0] = null;
                }
                else if (newY == 7 && newX == 2) {
                    this.squares[4][7] = this.squares[2][7];
                    this.squares[0][7] = this.squares[3][7];
                    this.squares[1][7] = null;
                    this.squares[2][7] = null;
                    this.squares[3][7] = null;
                }
                else if (newY == 7 && newX == 6) {
                    this.squares[4][7] = this.squares[6][7];
                    this.squares[7][7] = this.squares[5][7];
                    this.squares[5][7] = null;
                    this.squares[6][7] = null;
                }
            }
            if (conditions[3]) {
                var stackElem = this.graveyard.pop();
                xVal = stackElem[0];
                yVal = stackElem[1];
                piece = stackElem[2];
                this.squares[initX][initY] = this.squares[newX][newY];
                this.squares[newX][newY] = null;
                this.squares[xVal][yVal] = piece;
            }
            if (!conditions[0] && !conditions[1] && !conditions[2] && !conditions[3]) {
                this.squares[initX][initY] = this.squares[newX][newY];
                this.squares[newX][newY] = null;
            }
        }
        this.setProps(props);
    };
    //Returns a list of all the squares of the color variable that are checking the opposite color king
    //Note that the first coordinate in this list is always the king square of the opposite color
    GameBoard.prototype.lookForChecks = function (color) {
        var ans = [];
        var kingSquare = [];
        if (color === "White") {
            //Find the king
            for (var j = 0; j <= 7; j++) {
                for (var i = 0; i <= 7; i++) {
                    if (isDef(this.squares[i][j]) && this.squares[i][j].shortname() === "l") {
                        kingSquare = [i, j];
                        i = 8;
                        j = 8;
                    }
                }
            }
            ans.push(kingSquare);
            //Go through all squares looking for white pieces and checks on them
            for (var i = 0; i <= 7; i++) {
                for (var j = 0; j <= 7; j++) {
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
            for (var j = 0; j <= 7; j++) {
                for (var i = 7; i >= 0; i--) {
                    if (isDef(this.squares[i][j]) && this.squares[i][j].shortname() === "k") {
                        kingSquare = [i, j];
                        i = -1;
                        j = 8;
                    }
                }
            }
            ans.push(kingSquare);
            //Go through all squares looking for black pieces and checks on them
            for (var i = 0; i <= 7; i++) {
                for (var j = 0; j <= 7; j++) {
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
        return ans;
    };
    //check if the king of color is under check
    GameBoard.prototype.moveUnderCheck = function (color, initX, initY, newX, newY) {
        var ans = true;
        var arr = this.move(initX, initY, newX, newY, true);
        var opcolor;
        if (color === "White")
            opcolor = "Black";
        else
            opcolor = "White";
        if (this.lookForChecks(opcolor).length == 1)
            ans = false;
        else
            ans = true;
        this.reverseMove(arr[0], arr[1], initX, initY, newX, newY);
        return ans;
    };
    //Check to see if myColor has won
    GameBoard.prototype.checkEndingConditions = function (myColor) {
        var opColor = "White";
        if (myColor === "White")
            opColor = "Black";
        var flag = true;
        var mmoves;
        for (var i = 0; i <= 7; i++) {
            for (var j = 0; j <= 7; j++) {
                if (isDef(this.squares[i][j]) && this.squares[i][j].color === opColor) {
                    mmoves = this.squares[i][j].getMoves(this, i, j);
                    for (var cnt = 0; cnt < mmoves.length; cnt++) {
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
            if (this.lookForChecks(myColor).length > 1) {
                return myColor;
            }
            else {
                return "Draw";
            }
        }
        else {
            return null;
        }
    };
    return GameBoard;
}());
/*
    All Pieces
*/
var Piece = /** @class */ (function () {
    function Piece(name, color) {
        this.name = name;
        this.color = color;
        this.image = new Image();
        this.hasMoved = false;
        this.pointValue = 0;
    }
    return Piece;
}());
var Pawn = /** @class */ (function (_super) {
    __extends(Pawn, _super);
    function Pawn(name, color) {
        var _this = _super.call(this, name, color) || this;
        _this.pointValue = 1;
        return _this;
    }
    Pawn.prototype.draw = function () {
        //this.image = new Image();
        if (this.color[0] === "B") {
            this.image.src = "pawnBlack.png";
        }
        else {
            this.image.src = "pawnWhite.png";
        }
    };
    Pawn.prototype.getMoves = function (board, xPos, yPos) {
        var ans = [];
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
                    ans.push([xPos - 1, yPos + 1]);
                //Take en pessant to the right
                if (board.justMovedTwo[0] === xPos + 1 && board.justMovedTwo[1] === yPos)
                    ans.push([xPos + 1, yPos + 1]);
            }
        }
        else if (this.color === "White") {
            //Push one square up
            if (!isDef(board.squares[xPos][yPos - 1])) {
                ans.push([xPos, yPos - 1]);
                if (!isDef(board.squares[xPos][yPos - 2]) && yPos === 6)
                    ans.push([xPos, yPos - 2]);
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
                    ans.push([xPos - 1, yPos - 1]);
                //Take en pessant to the right
                if (board.justMovedTwo[0] === xPos + 1 && board.justMovedTwo[1] === yPos)
                    ans.push([xPos + 1, yPos - 1]);
            }
        }
        return ans;
    };
    Pawn.prototype.shortname = function () {
        if (this.color[0] == "W") {
            return 'a';
        }
        else {
            return 'b';
        }
    };
    return Pawn;
}(Piece));
var Knight = /** @class */ (function (_super) {
    __extends(Knight, _super);
    function Knight(name, color) {
        var _this = _super.call(this, name, color) || this;
        _this.pointValue = 3;
        return _this;
    }
    Knight.prototype.getMoves = function (board, xPos, yPos) {
        var ans = [];
        var increments = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
        for (var index = 0; index < increments.length; index++) {
            var newX = xPos + increments[index][0];
            var newY = yPos + increments[index][1];
            if (filterOnBoard([newX, newY]))
                if (!isDef(board.squares[newX][newY]) || board.squares[newX][newY].color[0] !== this.color[0])
                    ans.push([newX, newY]);
        }
        return ans;
    };
    Knight.prototype.draw = function (context) {
        if (this.color === "Black") {
            this.image.src = "knightBlack.png";
        }
        else {
            this.image.src = "knightWhite.png";
        }
    };
    Knight.prototype.shortname = function () {
        if (this.color[0] == "W") {
            return 'c';
        }
        else {
            return 'd';
        }
    };
    return Knight;
}(Piece));
var Bishop = /** @class */ (function (_super) {
    __extends(Bishop, _super);
    function Bishop(name, color) {
        var _this = _super.call(this, name, color) || this;
        _this.pointValue = 3;
        return _this;
    }
    Bishop.prototype.getMoves = function (board, xPos, yPos) {
        var ans = [];
        //Quadrant 1 diagonal
        for (var i = 1; (i + xPos) <= 7 && (i + yPos) <= 7; i++) {
            var newX = i + xPos;
            var newY = i + yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Quadrant 2 diagonal
        for (var i = 1; (xPos - i) >= 0 && (i + yPos) <= 7; i++) {
            var newX = xPos - i;
            var newY = i + yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Quadrant 3 diagonal
        for (var i = 1; (i + xPos) <= 7 && (yPos - i) >= 0; i++) {
            var newX = i + xPos;
            var newY = yPos - i;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Quadrant 4 diagonal
        for (var i = 1; (xPos - i) >= 0 && (yPos - i) >= 0; i++) {
            var newX = xPos - i;
            var newY = yPos - i;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color !== this.color) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        return ans;
    };
    Bishop.prototype.draw = function (context) {
        if (this.color === "Black") {
            this.image.src = "bishopBlack.png";
        }
        else {
            this.image.src = "bishopWhite.png";
        }
    };
    Bishop.prototype.shortname = function () {
        if (this.color[0] == "W") {
            return 'e';
        }
        else {
            return 'f';
        }
    };
    return Bishop;
}(Piece));
var Rook = /** @class */ (function (_super) {
    __extends(Rook, _super);
    function Rook(name, color) {
        var _this = _super.call(this, name, color) || this;
        _this.pointValue = 5;
        return _this;
    }
    Rook.prototype.getMoves = function (board, xPos, yPos) {
        var ans = [];
        //Right
        for (var i = 1; (i + xPos) <= 7; i++) {
            var newX = i + xPos;
            var newY = yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Up
        for (var i = 1; (i + yPos) <= 7; i++) {
            var newX = xPos;
            var newY = i + yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Left
        for (var i = 1; (xPos - i) >= 0; i++) {
            var newX = xPos - i;
            var newY = yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Down
        for (var i = 1; (yPos - i) >= 0; i++) {
            var newX = xPos;
            var newY = yPos - i;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        return ans;
    };
    Rook.prototype.draw = function (context) {
        if (this.color[0] === "B") {
            this.image.src = "rookBlack.png";
        }
        else {
            this.image.src = "rookWhite.png";
        }
    };
    Rook.prototype.shortname = function () {
        if (this.color[0] == "W") {
            return 'g';
        }
        else {
            return 'h';
        }
    };
    return Rook;
}(Piece));
var Queen = /** @class */ (function (_super) {
    __extends(Queen, _super);
    function Queen(name, color) {
        var _this = _super.call(this, name, color) || this;
        _this.pointValue = 9;
        return _this;
    }
    Queen.prototype.getMoves = function (board, xPos, yPos) {
        var ans = [];
        //Right
        for (var i = 1; (i + xPos) <= 7; i++) {
            var newX = i + xPos;
            var newY = yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color !== this.color) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Up
        for (var i = 1; (i + yPos) <= 7; i++) {
            var newX = xPos;
            var newY = i + yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color !== this.color) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Left
        for (var i = 1; (xPos - i) >= 0; i++) {
            var newX = xPos - i;
            var newY = yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color !== this.color) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Down
        for (var i = 1; (yPos - i) >= 0; i++) {
            var newX = xPos;
            var newY = yPos - i;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color !== this.color) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Quadrant 1 diagonal
        for (var i = 1; (i + xPos) <= 7 && (i + yPos) <= 7; i++) {
            var newX = i + xPos;
            var newY = i + yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color !== this.color) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Quadrant 2 diagonal
        for (var i = 1; (xPos - i) >= 0 && (i + yPos) <= 7; i++) {
            var newX = xPos - i;
            var newY = i + yPos;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Quadrant 3 diagonal
        for (var i = 1; (i + xPos) <= 7 && (yPos - i) >= 0; i++) {
            var newX = i + xPos;
            var newY = yPos - i;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        //Quadrant 4 diagonal
        for (var i = 1; (xPos - i) >= 0 && (yPos - i) >= 0; i++) {
            var newX = xPos - i;
            var newY = yPos - i;
            if (!isDef(board.squares[newX][newY]))
                ans.push([newX, newY]);
            else if (board.squares[newX][newY].color[0] !== this.color[0]) {
                ans.push([newX, newY]);
                break;
            }
            else
                break;
        }
        ans = ans.filter(filterOnBoard);
        return ans;
    };
    Queen.prototype.draw = function (context) {
        if (this.color[0] === "B") {
            this.image.src = "queenBlack.png";
        }
        else {
            this.image.src = "queenWhite.png";
        }
    };
    Queen.prototype.shortname = function () {
        if (this.color[0] == "W") {
            return 'i';
        }
        else {
            return 'j';
        }
    };
    return Queen;
}(Piece));
var King = /** @class */ (function (_super) {
    __extends(King, _super);
    function King(name, color) {
        var _this = _super.call(this, name, color) || this;
        _this.pointValue = 2000;
        return _this;
    }
    King.prototype.getMoves = function (board, xPos, yPos) {
        var ans = [];
        var increments = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
        for (var index = 0; index < increments.length; index++) {
            var newX = xPos + increments[index][0];
            var newY = yPos + increments[index][1];
            if (filterOnBoard([newX, newY]))
                if (!isDef(board.squares[newX][newY]) || board.squares[newX][newY].color[0] !== this.color[0])
                    ans.push([newX, newY]);
        }
        if (this.color[0] === "B" && !board.blackKingHasMoved) {
            //Castle Queen Side
            if (!isDef(board.squares[1][0]) && !isDef(board.squares[2][0]) && !isDef(board.squares[3][0]) && !board.blackRook0HasMoved)
                ans.push([2, 0]);
            //Castle King Side
            if (!isDef(board.squares[5][0]) && !isDef(board.squares[6][0]) && !board.blackRook1HasMoved)
                ans.push([6, 0]);
        }
        else if (this.color[0] === "W" && !board.whiteKingHasMoved) {
            //Castle Queen Side
            if (!isDef(board.squares[1][7]) && !isDef(board.squares[2][7]) && !isDef(board.squares[3][7]) && !board.whiteRook0HasMoved)
                ans.push([2, 7]);
            //Castle King Side
            if (!isDef(board.squares[5][7]) && !isDef(board.squares[6][7]) && !board.whiteRook1HasMoved)
                ans.push([6, 7]);
        }
        return ans;
    };
    King.prototype.draw = function (context) {
        if (this.color === "Black") {
            this.image.src = "kingBlack.png";
        }
        else {
            this.image.src = "kingWhite.png";
        }
    };
    King.prototype.shortname = function () {
        if (this.color == "White") {
            return 'k';
        }
        else {
            return 'l';
        }
    };
    return King;
}(Piece));
/*
    Gameplay
*/
var canvas;
var context;
canvas = document.getElementById("canvas");
context = canvas.getContext('2d');
var board = new GameBoard();
for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
        if ((i + j) % 2 == 0)
            context.fillStyle = "#9A7B4F";
        else
            context.fillStyle = "#481F01";
        context.fillRect(i * (BOARD_SIZE / 8), j * (BOARD_SIZE / 8), (BOARD_SIZE / 8), (BOARD_SIZE / 8));
    }
}
board.setup();
board.update(null, context);
var highlightedMoves = [];
var squaresAreHighlighted = false;
var storeSquare = [];
var rect = canvas.getBoundingClientRect();
var gameOver = false;
var movesList;
var whiteProps = null;
var whiteMove = null;
var blackProps = null;
var blackMove = null;
var cpu = new CPU();
var undoButton = document.getElementById("undo_button");
undoButton.addEventListener('click', function (event) {
    if (whiteProps !== null && blackProps !== null) {
        board.reverseMove(blackProps[0], blackProps[1], blackMove[0], blackMove[1], blackMove[2], blackMove[3]);
        board.reverseMove(whiteProps[0], whiteProps[1], whiteMove[0], whiteMove[1], whiteMove[2], whiteMove[3]);
        board.update(null, context);
    }
});
var drawButton = document.getElementById("draw_button");
drawButton.addEventListener('click', function (event) {
    document.getElementById("winner_bar").innerHTML = "Draw!";
    var border = document.querySelector("canvas");
    border.style["border-color"] = "Red";
    gameOver = true;
});
canvas.addEventListener('click', function (event) {
    if (gameOver)
        return;
    //Get the location of this click
    var xClick = Math.floor((event.clientX - rect.left) / (BOARD_SIZE / 8));
    var yClick = Math.floor((event.clientY - rect.top) / (BOARD_SIZE / 8));
    console.log("Hits : " + hits + " Misses: " + misses);
    //If we clicked on a blank square trying to move it or we picked a square of the wrong color
    if (!squaresAreHighlighted) {
        if (!isDef(board.squares[xClick][yClick]) || (board.squares[xClick][yClick].color === "Black"))
            return;
    }
    //If we want to move a piece and it is valid
    if (!squaresAreHighlighted) {
        storeSquare = [xClick, yClick];
        highlightedMoves = board.squares[xClick][yClick].getMoves(board, xClick, yClick);
        //Filter the highlighted moves to look for checks
        highlightedMoves = highlightedMoves.filter(function (move) { return !board.moveUnderCheck("White", xClick, yClick, move[0], move[1]); });
        for (var i = 0; i < highlightedMoves.length; i++) {
            var xCircle = highlightedMoves[i][0];
            var yCircle = highlightedMoves[i][1];
            context.fillStyle = "blue";
            context.fillRect(xCircle * (BOARD_SIZE / 8), yCircle * (BOARD_SIZE / 8), (BOARD_SIZE / 40), (BOARD_SIZE / 40));
        }
        squaresAreHighlighted = true;
    }
    //We select a square not in the highlighted list
    else if (squaresAreHighlighted && !includes([xClick, yClick], highlightedMoves)) {
        //Clear the previous highlightedMoves list
        for (var i = 0; i < highlightedMoves.length; i++) {
            var xCircle = highlightedMoves[i][0];
            var yCircle = highlightedMoves[i][1];
            if ((xCircle + yCircle) % 2 == 0)
                context.fillStyle = "#9A7B4F";
            else
                context.fillStyle = "#481F01";
            context.fillRect(xCircle * (BOARD_SIZE / 8), yCircle * (BOARD_SIZE / 8), (BOARD_SIZE / 40), (BOARD_SIZE / 40));
        }
        squaresAreHighlighted = false;
    }
    //Move the piece
    else if (squaresAreHighlighted) {
        whiteProps = board.move(storeSquare[0], storeSquare[1], xClick, yClick, false);
        whiteMove = [storeSquare[0], storeSquare[1], xClick, yClick];
        //Remove the piece's image from its previous square
        board.update(whiteProps.slice(2), context);
        //Clear highlighted squares
        for (var i = 0; i < highlightedMoves.length; i++) {
            var xCircle = highlightedMoves[i][0];
            var yCircle = highlightedMoves[i][1];
            if ((xCircle + yCircle) % 2 == 0)
                context.fillStyle = "#9A7B4F";
            else
                context.fillStyle = "#481F01";
            context.fillRect(xCircle * (BOARD_SIZE / 8), yCircle * (BOARD_SIZE / 8), (BOARD_SIZE / 40), (BOARD_SIZE / 40));
        }
        squaresAreHighlighted = false;
        //Look for checkmates
        var ak_1 = board.checkEndingConditions("White");
        if (ak_1 === "Draw") {
            document.getElementById("winner_bar").innerHTML = "Draw!";
            var border = document.querySelector("canvas");
            border.style["border-color"] = "Red";
            gameOver = true;
        }
        else if (ak_1 === "White") {
            document.getElementById("winner_bar").innerHTML = "White wins!";
            var border = document.querySelector("canvas");
            border.style["border-color"] = "Green";
            gameOver = true;
        }
        setTimeout(function () {
            var blacksMove = cpu.getMove(board);
            blackMove = blacksMove;
            blackProps = board.move(blacksMove[0], blacksMove[1], blacksMove[2], blacksMove[3], false);
            board.update(blackProps.slice(2), context);
            //Look for checkmates
            ak_1 = board.checkEndingConditions("Black");
            if (ak_1 === "Draw") {
                document.getElementById("winner_bar").innerHTML = "Draw!";
                var border = document.querySelector("canvas");
                border.style["border-color"] = "Red";
                gameOver = true;
            }
            else if (ak_1 === "Black") {
                document.getElementById("winner_bar").innerHTML = "Black wins!";
                var border = document.querySelector("canvas");
                border.style["border-color"] = "Red";
                gameOver = true;
            }
        }, 150);
    }
});
