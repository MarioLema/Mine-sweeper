//===========================================DATA OBJECT========================================================
const DATA = {
    boardArr: [],
    emptyCell: [],
    mineCell: [],
    revealed: [],
    tagged: [],
    gameEnded: false,
    flagMode: false,
    cols: 10,
    rows: 10,
    mineRate: 1.7,
    resolution: 50,
    timeSet: 100,
    timeLeft: 100,
    interval: null,

    width() {
        return this.resolution * this.cols;
    },
    height() {
        return this.resolution * this.rows;
    },
    cells() {
        return this.cols * this.rows;
    },
};

//===========================================VIEW METHODS========================================================
const VIEW = {

    //SELECTS THE GRID ELEMENT WITH VARIABLE COLS AND ROWS AND ATTACHES A DOCUMENT FRAGMENT WITH CELLS MAPPED FROM A ONE-DIMENSIONAL ARRAY
    generateBoard() {
        let grid = document.getElementById(`board`);
        grid.setAttribute(`style`, `width: ${DATA.width()}px; height: ${DATA.height()}px; grid-template-columns: repeat(${DATA.cols}, 1fr); grid-template-rows: repeat(${DATA.rows}, 1fr)`);
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < DATA.boardArr.length; i++) {
            let el = document.createElement('div');
            el.classList.add(`cell`);
            el.setAttribute(`id`, `cell-${i}`);

            fragment.appendChild(el);
        }
        grid.innerHTML = ``;
        grid.appendChild(fragment);

        this.displayTime(DATA.timeSet);
        this.tagsLeft();
    },

    //DISPLAYS AN EMPTY CELL AND THE NUMBER OF BOMBS AROUND IT IF THERE ARE ANY
    displayEmpty(neighbours, id) {
        let cell = document.getElementById(`cell-${id}`);
        cell.classList.add(`reveal-empty`);
        if (neighbours > 0) {
            let color = neighbours === 1 ? `#0000ff` : neighbours === 2 ? `#008100` : neighbours === 3 ? `#ff1300` : neighbours === 4 ? `#000083` : `#810500`
            cell.setAttribute(`style`, `color: ${color}`);
            cell.innerHTML = neighbours;
        } else {
            cell.innerHTML = ` `;
        }
    },

    //DISPLAYS ALL MINES ON ENDGAME
    displayAllMines(win) {
        for (let i = 0; i < DATA.mineCell.length; i++) {
            let cell = document.getElementById(`cell-${DATA.mineCell[i]}`);
            cell.innerHTML = `💣`;
            if (!win) {
                cell.classList.add(`reveal-mine`);
            } else {
                cell.classList.add(`reveal-mine-green`);
            }
        }
    },

    displayTime(time) {
        document.getElementById(`time-display`).innerHTML = time;
    },

    //DOM DISPLAY OF HOW MANY BOMBS HAVE NOT BEEN TAGGED
    tagsLeft() {
        document.getElementById(`bombs-display`).innerHTML = DATA.mineCell.length - DATA.tagged.length;
    },

    changeEmoji(state) {
        let emoji = document.querySelector(`.smiley`);
        let smiley = state === `win` ? `😎` : state === `lose` ? `😵` : `🙂`;
        emoji.innerHTML = smiley;
    },

    addFlag(id, bool) {
        let cell = document.getElementById(`cell-${id}`);
        bool ? cell.innerHTML = `🚩` : cell.innerHTML = ` `;
    },

    flagMode() {
        let button = document.getElementById('flag-mode');
        DATA.flagMode ? button.classList.add(`pushed`) : button.classList.remove(`pushed`);
    }
};

//===========================================MODIFIER METHODS========================================================
const MODIFIER = {

    //================PLAY GAME METHODS==================
    //===================================================


    //HANDLES PLAYER CLICK
    turn() {

        if (!DATA.gameEnded) { //stops accepting clicks after game ending
            let id = event.target.id;
            let index = Number(id.slice(5));

            if (DATA.flagMode && DATA.revealed.indexOf(index) === -1) { //if flagmode is active
                this.placeFlag(index);
            } else { //regular click, reveal cell

                if (DATA.revealed.length === 0) { //if it is the first click, start counter
                    this.startGame();
                }

                if (this.checkMine(index)) {
                    this.endGame(`lose`);
                } else {
                    this.findNeighbours(index);
                }
            }
            if (this.winCheck()) this.endGame(`win`); //checks after all clicks for a win

        }
    },

    //STARTS GAME INTERVAL ON FIRST REVEALED CELL
    startGame() {
        DATA.interval = setInterval(() => {
            DATA.timeLeft--;
            VIEW.displayTime(DATA.timeLeft);

            if (DATA.timeLeft === 0) {
                MODIFIER.endGame(`lose`);
            }
        }, 1000);
    },

    //RESETS DATA AND CREATES NEW ARRAY AND BOARD
    resetGame() {
        DATA.boardArr = [];
        DATA.emptyCell = [];
        DATA.mineCell = [];
        DATA.revealed = [];
        DATA.tagged = [];
        DATA.gameEnded = false;
        clearInterval(DATA.interval);
        DATA.timeLeft = DATA.timeSet;
        this.populateBoardArr();
        VIEW.generateBoard();
        VIEW.changeEmoji(`normal`);
    },

    //HANDLES THE DIFFERENT ENDS OF THE GAME
    endGame(status) {
        if (status === `lose`) {
            VIEW.displayAllMines(false);
            VIEW.changeEmoji(`lose`);
        } else {
            VIEW.displayAllMines(true);
            VIEW.changeEmoji(`win`);
        }
        clearInterval(DATA.interval);
        DATA.gameEnded = true;
    },

    //ADDS OR REMOVES A TAG FROM A NOT YET REVEALED CELL
    placeFlag(index) {
        if (DATA.tagged.indexOf(index) === -1) {
            DATA.tagged.push(index);
            VIEW.addFlag(index, true);
            VIEW.tagsLeft();
        } else {
            locIndex = DATA.tagged.indexOf(index);
            DATA.tagged.splice(locIndex, 1);
            VIEW.addFlag(index, false);
            VIEW.tagsLeft();
        }
    },


    //REVEALS EMPTY CELL AND ADJACENT ONES UNTIL THEY NEIGHBOUR A MINE 
    findNeighbours(i) {
        let checked = [];

        //recursive function for each cell being checked
        function checkCell(index) {

            if (checked.indexOf(index) === -1) {
                checked.push(index)
            } else return; //if it has not been checked before, push it to the array, else return
            if (DATA.revealed.indexOf(index) !== -1 || DATA.mineCell.indexOf(index) !== -1) return; //if it was revealed previously or it is a mine return


            let neighbours = MODIFIER.adjacentCells(index); //gets an object of valid cell indexes around
            let mineCount = MODIFIER.mineCount(neighbours); //counts the mines around the cell
            DATA.revealed.push(index);
            VIEW.displayEmpty(mineCount, index);


            if (mineCount === 0) { //if there is no mines around call itself again with each cell index in the neighbours object

                for (let cell in neighbours) {
                    if (neighbours[cell] || neighbours[cell] === 0) checkCell(neighbours[cell]);
                }
            }


        };
        checkCell(i);
    },

    //CREATES AN OBJECT WITH INDEXES OF VALID ADJACENT CELLS. iF CELLS ARE OUTSIDE OF THE SCOPE OF THE GRID, PROPERTY IS FALSE
    adjacentCells(index) {
        let topBound = 0;
        let bottomBound = DATA.boardArr.length - 1;
        let leftBound = Math.floor(index / DATA.rows) * DATA.rows;
        let rightBound = (Math.floor((index + DATA.rows) / DATA.rows) * DATA.rows) - 1;
        let neighbours = [index - DATA.rows - 1, index - DATA.rows, index - DATA.rows + 1, index - 1, index + 1, index + DATA.rows - 1, index + DATA.rows, index + DATA.rows + 1];
        return {
            grid1: neighbours[0] < topBound || neighbours[0] < leftBound - DATA.rows ? false : neighbours[0],
            grid2: neighbours[1] < topBound ? false : neighbours[1],
            grid3: neighbours[2] < topBound || neighbours[2] > rightBound - DATA.rows ? false : neighbours[2],
            grid4: neighbours[3] < leftBound ? false : neighbours[3],
            grid6: neighbours[4] > rightBound ? false : neighbours[4],
            grid7: neighbours[5] > bottomBound || neighbours[5] < leftBound + DATA.rows ? false : neighbours[5],
            grid8: neighbours[6] > bottomBound ? false : neighbours[6],
            grid9: neighbours[7] > bottomBound || neighbours[7] > rightBound + DATA.rows ? false : neighbours[7],
        }
    },

    //COUNTS THE MINES AROUND A GIVEN CELL
    mineCount(neighArr) {
        let count = 0;
        for (let cell in neighArr) {
            if (neighArr[cell]) {
                if (DATA.boardArr[neighArr[cell]]) count++;
            }
        }
        return count;
    },

    //================VALIDATION METHODS==================
    //===================================================

    //CHECKS IF THE INDEX PASSED IS A MINE IN THE MAIN ARRAY
    checkMine(index) {
        return DATA.boardArr[index] ? true : false;
    },

    //COMPARES PLAYER ARRAYS WITH MINES AND `EMPTIES` ARRAYS
    winCheck() {
        if (DATA.revealed.length === DATA.emptyCell.length) return true;
        if (DATA.tagged.length === DATA.mineCell.length) {
            DATA.tagged.sort((a, b) => a > b);
            for (let i = 0; i < DATA.tagged.length; i++) {
                if (DATA.tagged[i] !== DATA.mineCell[i]) return false;
            }
            return true;
        }
        return false
    },


    //================UTILITY METHODS==================
    //===================================================

    //GENERATES A ONE-DIMENSIONAL ARRAY OF 0 AND 1 BASED ON A RATE OF APPEARANCE
    populateBoardArr() {
        for (let i = 0; i < DATA.cells(); i++) {
            let random = Math.random() * 2;
            if (random > DATA.mineRate) {
                DATA.boardArr.push(1);
                DATA.mineCell.push(i);
            } else {
                DATA.boardArr.push(0);
                DATA.emptyCell.push(i);
            }
        }
    },

    actFlagMode() {
        DATA.flagMode = !DATA.flagMode;
        VIEW.flagMode();
    },

    changeRows() {
        value = event.target.value;
        if (value => 2 && value <= 500) {
            DATA.rows = value;
        }
    },

    changeCols() {
        value = event.target.value;
        if (value => 2 && value <= 500) {
            DATA.cols = value;
        }
    },

    changeTime() {
        value = event.target.value;
        if (value => 10 && value <= 500) {
            DATA.timeSet = value;
        }
    },

    changeDifficulty() {
        mode = event.target.id;
        switch (mode) {
            case `easy`:
                DATA.mineRate = 1.9;
                break;
            case `normal`:
                DATA.mineRate = 1.5;
                break;
            case `hard`:
                DATA.mineRate = 1.3;
                break;
            default:
                return;
        }
    },
}
MODIFIER.turn = MODIFIER.turn.bind(MODIFIER);
MODIFIER.resetGame = MODIFIER.resetGame.bind(MODIFIER);



//========================CLICK EVENTS============================================
document.getElementById(`board`).addEventListener(`click`, MODIFIER.turn, false);
document.getElementById(`reset-game`).addEventListener(`click`, MODIFIER.resetGame, false);
document.getElementById(`commit-game`).addEventListener(`click`, MODIFIER.resetGame, false);
document.getElementById(`flag-mode`).addEventListener(`click`, MODIFIER.actFlagMode, false);
document.getElementById(`rows`).addEventListener(`change`, MODIFIER.changeRows, false);
document.getElementById(`cols`).addEventListener(`change`, MODIFIER.changeCols, false);
document.getElementById(`time`).addEventListener(`change`, MODIFIER.changeTime, false);
document.querySelector(`.difficulty-options`).addEventListener(`click`, MODIFIER.changeDifficulty, false);

//========================ON DOCUMENT LOAD============================================
MODIFIER.populateBoardArr();
VIEW.generateBoard();