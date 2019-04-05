//===========================================DATA OBJECT========================================================
const DATA = {
    boardArr: [],
    emptyCell: [],
    mineCell: [],
    revealed: [],
    cols: 10,
    rows: 10,
    mineRate: 1.5,
    resolution: 50,
    width(){return this.resolution * this.cols},
    height(){return this.resolution * this.rows},
    cells(){return this.cols * this.rows},

};

//===========================================VIEW METHODS========================================================
const VIEW = {

    generateBoard(){
        let grid = document.getElementById(`board`);
        grid.setAttribute(`style`, `width: ${DATA.width()}px; height: ${DATA.height()}px; grid-template-columns: repeat(${DATA.cols}, 1fr); grid-template-rows: repeat(${DATA.rows}, 1fr)`);
        let fragment = document.createDocumentFragment();
        for(let i = 0; i < DATA.boardArr.length; i++){
            let el = document.createElement('div');
        el.classList.add(`cell`);
        el.setAttribute(`id`, `cell-${i}`);
        fragment.appendChild(el);
        }
        grid.appendChild(fragment);
    },

    displayMine(id){
        let cell = document.getElementById(`cell-${id}`);
        cell.classList.add(`reveal-mine`);
        cell.innerHTML= `💣`;
    },

    displayEmpty(neighbours, id){
        let cell = document.getElementById(`cell-${id}`);
        cell.classList.add(`reveal-empty`);
        if(neighbours > 0){
            cell.innerHTML = neighbours;
        }else{
            cell.innerHTML = ` `;
        }
    },
    // addClass(class){},



};

//===========================================MODIFIER METHODS========================================================
const MODIFIER = {

    populateBoardArr(){
        for(let i = 0; i < DATA.cells() ; i++){
            let random = Math.random() * 2;
            if(random > DATA.mineRate){
                DATA.boardArr.push(1);
                DATA.mineCell.push(i);
            }else{
                DATA.boardArr.push(0);
                DATA.emptyCell.push(i);
            }
        }
    },

    turn(){
        let id = event.target.id;
        let index = Number(id.slice(5));

        if(this.checkMine(index)){
            for(let i = 0; i < DATA.mineCell.length; i++){
                VIEW.displayMine(DATA.mineCell[i]);
            }

        }else{
            this.findNeighbours(index);
        }
    },

    findNeighbours(i){
        let checked = [];

        function checkCell(index){
            let topBound = 0;
            let bottomBound = DATA.boardArr.length - 1;
            let leftBound = Math.floor(index/DATA.rows) * DATA.rows ;
            let rightBound = (Math.ceil(index/DATA.rows) * DATA.rows ) - 1;
            if(index < topBound || index > bottomBound || index < leftBound || index > rightBound) return; //if the index number is outside of the boundaries of the grid row or column
            if(checked.indexOf(index) === -1 ) { checked.push(index) } else return; //if it has not been checked before, push it to the array, else return
            if(DATA.revealed.indexOf(index) !== -1 || DATA.mineCell.indexOf(index) !== -1) return; //if it was revealed previously or it is a mine return


            let neighbours = [index - 1, index + 1, index - DATA.rows, index - DATA.rows - 1, index - DATA.rows + 1, index + DATA.rows, index + DATA.rows - 1, index + DATA.rows + 1];
            let mineCount = MODIFIER.mineCount(neighbours);
            DATA.revealed.push(index);
            VIEW.displayEmpty(mineCount, index);

            

            for (let i = 0; i < neighbours.length; i++){
                checkCell(neighbours[i]);
            }
        }

        checkCell(i);
    },

    checkCell(index){
        
    },

    mineCount(neighArr){
        let count = 0;
        for(let i = 0; i < neighArr.length; i++){
            if(DATA.boardArr[neighArr[i]]) count++
        }
        return count;
    },

    checkMine(index){
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
// MODIFIER.startGame = MODIFIER.startGame.bind(MODIFIER);



//========================CLICK EVENTS============================================
document.getElementById(`board`).addEventListener(`click`, MODIFIER.turn, false);
// document.getElementById(`start-game`).addEventListener(`click`, MODIFIER.startGame, false);
// document.getElementById(`reset-game`).addEventListener(`click`, MODIFIER.resetGame, false);
// MODIFIER.winkUpListener(document.querySelectorAll(`.card-front`));


MODIFIER.populateBoardArr();
VIEW.generateBoard();