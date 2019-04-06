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
        return this.resolution * this.cols
    },
    height() {
        return this.resolution * this.rows
    },
    cells() {
        return this.cols * this.rows
    },

};

//===========================================VIEW METHODS========================================================
const VIEW = {

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

    displayTime(time){
        document.getElementById(`time-display`).innerHTML = time;
    },

    tagsLeft(){
        document.getElementById(`bombs-display`).innerHTML = DATA.mineCell.length - DATA.tagged.length;
    },

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
    resetGame() {
        DATA.boardArr = [],
            DATA.emptyCell = [],
            DATA.mineCell = [],
            DATA.revealed = [],
            DATA.tagged = [],
            DATA.gameEnded = false,
            //get options
            this.populateBoardArr();
        VIEW.generateBoard();
        VIEW.changeEmoji(`normal`);
    },

    turn() {

        if (!DATA.gameEnded) {
            let id = event.target.id;
            let index = Number(id.slice(5));

            if (DATA.flagMode && DATA.revealed.indexOf(index) === -1) {
                this.placeFlag(index);
            } else {

                if (DATA.revealed.length === 0) {
                    this.startGame();
                }

                    if (this.checkMine(index)) {
                        this.endGame(`lose`);
                    } else {
                        this.findNeighbours(index);
                    }


            }
            if(this.winCheck()) this.endGame(`win`);

        }
    },

    startGame() {
        //disable options
        DATA.interval = setInterval(() => {
            DATA.timeLeft--;
            VIEW.displayTime(DATA.timeLeft);

            if(DATA.timeLeft === 0){
            MODIFIER.endGame(`lose`);
            }
        }, 1000);
    },

    endGame(status){
        if(status === `lose`){
            VIEW.displayAllMines(false);
            VIEW.changeEmoji(`lose`);
        }else{
            VIEW.displayAllMines(true);
            VIEW.changeEmoji(`win`);
        }
        clearInterval(DATA.interval);
        DATA.gameEnded = true;
    },

    revealCell(index) {

    },

    winCheck(){
         if(DATA.revealed.length === DATA.emptyCell.length) return true;
        if(DATA.tagged.length === DATA.mineCell.length){
            DATA.tagged.sort( (a,b) => a > b);
            for(let i = 0; i < DATA.tagged.length; i++){
                if(DATA.tagged[i] !== DATA.mineCell[i]) return false;
            }
            return true;
        }
        return false
    },

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

    actFlagMode() {
        DATA.flagMode = !DATA.flagMode;
        VIEW.flagMode();
    },

    findNeighbours(i) {
        let checked = [];

        function checkCell(index) {

            if (checked.indexOf(index) === -1) {
                checked.push(index)
            } else return; //if it has not been checked before, push it to the array, else return
            if (DATA.revealed.indexOf(index) !== -1 || DATA.mineCell.indexOf(index) !== -1) return; //if it was revealed previously or it is a mine return


            let neighbours = MODIFIER.adjacentCells(index);
            let mineCount = MODIFIER.mineCount(neighbours);
            DATA.revealed.push(index);
            VIEW.displayEmpty(mineCount, index);


            if (mineCount === 0) {

                for (let cell in neighbours) {
                    if (neighbours[cell]) checkCell(neighbours[cell]);
                }
            }


        }
        checkCell(i);
    },

    adjacentCells(index) {
        let topBound = 0;
        let bottomBound = DATA.boardArr.length - 1;
        let leftBound = Math.floor(index / DATA.rows) * DATA.rows;
        let rightBound = (Math.floor((index + DATA.rows) / DATA.rows) * DATA.rows) - 1;

        let neighbours = [index - DATA.rows - 1, index - DATA.rows, index - DATA.rows + 1, index - 1, index + 1, index + DATA.rows - 1, index + DATA.rows, index + DATA.rows + 1];
        return {
            grid1: neighbours[0] < topBound || neighbours[0] < leftBound - DATA.rows ? false : neighbours[0], //index - DATA.rows - 1 
            grid2: neighbours[1] < topBound ? false : neighbours[1], //index - DATA.rows
            grid3: neighbours[2] < topBound || neighbours[2] > rightBound - DATA.rows ? false : neighbours[2], //index - DATA.rows + 1 
            grid4: neighbours[3] < leftBound ? false : neighbours[3], //index - 1 
            grid6: neighbours[4] > rightBound ? false : neighbours[4], //index + 1 
            grid7: neighbours[5] > bottomBound || neighbours[5] < leftBound + DATA.rows ? false : neighbours[5], //index + DATA.rows - 1
            grid8: neighbours[6] > bottomBound ? false : neighbours[6], //index + DATA.rows
            grid9: neighbours[7] > bottomBound || neighbours[7] > rightBound + DATA.rows ? false : neighbours[7], //index + DATA.rows + 1
        }
    },

    mineCount(neighArr) {
        let count = 0;
        for (let cell in neighArr) {
            if (neighArr[cell]) {
                if (DATA.boardArr[neighArr[cell]]) count++;
            }
        }
        return count;
    },

    checkMine(index) {
        return DATA.boardArr[index] ? true : false;
    }

    //================PLAY GAME METHODS==================
    //===================================================


    //================VALIDATION METHODS==================
    //===================================================



    //================UTILITY METHODS==================
    //===================================================




    //================LISTENER METHODS==================
    //===================================================


}
MODIFIER.turn = MODIFIER.turn.bind(MODIFIER);
MODIFIER.resetGame = MODIFIER.resetGame.bind(MODIFIER);



//========================CLICK EVENTS============================================
document.getElementById(`board`).addEventListener(`click`, MODIFIER.turn, false);
document.getElementById(`reset-game`).addEventListener(`click`, MODIFIER.resetGame, false);
document.getElementById('flag-mode').addEventListener(`click`, MODIFIER.actFlagMode, false);


MODIFIER.populateBoardArr();
VIEW.generateBoard();