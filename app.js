//===========================================DATA OBJECT========================================================
const DATA = {
    boardArr: [],
    emptyCell: [],
    mineCell: [],
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
        neighbours > 0 ? cell.innerHTML = `` : cell.innerHTML = neighbours;
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
        let index = id.slice(5);

        if(this.checkMine(index)){
            for(let i = 0; i < DATA.mineCell.length; i++){
                VIEW.displayMine(DATA.mineCell[i]);
            }

        }else{
            this.findNeighbours(index);
        }
    },

    findNeighbours(){
        
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
console.log(DATA.boardArr);

//=============================================================================================================
//=============================================================================================================

// const board = document.getElementById(`board`);
// const cols = 10;
// const rows = 10;


// //needs to call a document fragment as opposed to add each time
// function createBoard(rows,cols){
//     board.innerHTML = ``;
//     for(let i = 0; i < rows; i++){
//         const row = document.createElement(`div`);
//         row.classList.add(`row`);
//         for(let j = 0; j < cols; j++){
//             const col = document.createElement(`div`);
//             col.classList.add('col','hidden');
//             col.setAttribute(`data-col`, j);
//             col.setAttribute(`data-row`, i);
//             if(Math.random() < 0.1){
//                 col.classList.add('mine');
//             }
//             row.appendChild(col);
//         }
//         board.appendChild(row);
//     }
// }



// function restart(){
//     //all event listeners will go...
//     createBoard(10,10);
// }

// function gameOver(isWin){
//     let message = null;
//     if(isWin){
//         message = `YOU WON!`;
//     }else{
//         message = `YOU LOST!`;
//     }
//         alert(message);
//         restart();
// }

// createBoard(cols, rows);

// function reveal(oi, oj){
//     const seen = {};

//     function helper(i,j){
//         if( i >= rows || j >= cols || i < 0 || j < 0) return;

//         const key = `${i} ${j}`;
//         if(seen[key]) return;

//         const cell = document.querySelector(`.data.hidden[data-row=${i}][data-col=${j}]`);
//     }

//     helper(oi,oj);
// }

// let cells = document.querySelectorAll(`.hidden`);
// cells.forEach( x => x.addEventListener(`click`, function(){
//     let target = event.target;
//     row = target.data('row');
//     col = target.data(`col`);
//     if(target.classList.contains(`mine`)){
//         gameOver(false);
//         restart();
//     }else{
//         reveal(row,col);
//     }
// }))

// //============================================================================================================================================================
// //============================================================================================================================================================
// const $board = $('#board');
// const ROWS = 10;
// const COLS = 10;

// function createBoard(rows, cols) {
//   $board.empty();
//   for (let i = 0; i < rows; i++) {
//     const $row = $('<div>').addClass('row');
//     for (let j = 0; j < cols; j++) {
//       const $col = $('<div>')
//         .addClass('col hidden')
//         .attr('data-row', i)
//         .attr('data-col', j);
//       if (Math.random() < 0.1) {
//         $col.addClass('mine');
//       }
//       $row.append($col);
//     }
//     $board.append($row);
//   }
// }

// function restart() {
//   createBoard(ROWS, COLS);
// }

// function gameOver(isWin) {
//   let message = null;
//   let icon = null;
//   if (isWin) {
//     message = 'YOU WON!';
//     icon = 'fa fa-flag';
//   } else {
//     message = 'YOU LOST!';
//     icon = 'fa fa-bomb';
//   }
//   $('.col.mine').append(
//     $('<i>').addClass(icon)
//   );
//   $('.col:not(.mine)')
//     .html(function() {
//       const $cell = $(this);
//       const count = getMineCount(
//         $cell.data('row'),
//         $cell.data('col'),
//       );
//       return count === 0 ? '' : count;
//     })
//   $('.col.hidden').removeClass('hidden');
//   setTimeout(function() {
//     alert(message);
//     restart();
//   }, 1000);
// }

// function reveal(oi, oj) {
//   const seen = {};

//   function helper(i, j) {
//     if (i >= ROWS || j >= COLS || i < 0 || j < 0) return;
//     const key = `${i} ${j}`
//     if (seen[key]) return;
//     const $cell =
//       $(`.col.hidden[data-row=${i}][data-col=${j}]`);
//     const mineCount = getMineCount(i, j);
//     if (
//       !$cell.hasClass('hidden') ||
//       $cell.hasClass('mine')
//     ) {
//       return;
//     }

//     $cell.removeClass('hidden');

//     if (mineCount) {
//       $cell.text(mineCount);
//       return;
//     }
    
//     for (let di = -1; di <= 1; di++) {
//       for (let dj = -1; dj <= 1; dj++) {
//         helper(i + di, j + dj);
//       }      
//     }
//   }

//   helper(oi, oj);
// }

// function getMineCount(i, j) {
//   let count = 0;
//   for (let di = -1; di <= 1; di++) {
//     for (let dj = -1; dj <= 1; dj++) {
//       const ni = i + di;
//       const nj = j + dj;
//       if (ni >= ROWS || nj >= COLS || nj < 0 || ni < 0) continue;
//       const $cell =
//         $(`.col.hidden[data-row=${ni}][data-col=${nj}]`);
//       if ($cell.hasClass('mine')) count++;
//     }      
//   }
//   return count;
// }

// $board.on('click', '.col.hidden', function() {
//   const $cell = $(this);
//   const row = $cell.data('row');
//   const col = $cell.data('col');
  
//   if ($cell.hasClass('mine')) {
//     gameOver(false);
//   } else {
//     reveal(row, col);
//     const isGameOver = $('.col.hidden').length === $('.col.mine').length
//     if (isGameOver) gameOver(true);
//   }
// })

// restart();