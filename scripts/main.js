const Gameboard = (() => {
    let grid = []
    const getGrid = () => grid

    const createGrid = () => {
        grid = []
        for (let i = 0; i < 9; i++) {
            grid.push(null)
        }
        updateDisplay()
    }

    const updateDisplay = () => {
        let gameContainer = document.querySelector('#gameContainer')
        // Delete board
        while (gameContainer.firstChild) {
            gameContainer.removeChild(gameContainer.firstChild)
        }
        let squareIndex = 0
        // Rebuild board
        grid.forEach(square => {
            let newSquare = document.createElement('div')
            newSquare.setAttribute('id', 'square'+squareIndex)
            newSquare.setAttribute('class', 'square')
            newSquare.classList.add('hover')
            const value = grid[squareIndex]
            
            newSquare.innerHTML = (value == null) ? '' : `<h4 id='${value}'>${value}</h4>`
            newSquare.addEventListener('click', squareClicked)
            gameContainer.appendChild(newSquare)
            squareIndex += 1
        });
    }
    // Method to check if a player has won
    // Could have just declared each winning permutation, but method used below...
    // ...enables win checking on grid sizes >3 (if functionality is added in the future)
    const checkForWin = () => {
        let start = 0
        let rowLength = Math.sqrt(grid.length)
        let winIndexes = []

        // Check if all items in an array are equal to each other
        const checkArr = (arr) => {
            return(arr.every((item,i,arr) =>
                (item==arr[0]) && (item != null)))
        }

        // Check Horizontal Lines
        while (start < grid.length) {
            result = checkArr(grid.slice(start,start+rowLength))
            if (result) {
                winIndexes = [start, start+1, start+2]
                return winIndexes
            }
            start += rowLength
        }
        // Check Vertical Lines
        for (let i = 0; i < rowLength; i++) {
            let vert = []
            let val = i
            winIndexes = []
            while (vert.length < rowLength) {
                winIndexes.push(val)
                vert.push(grid[val])
                val += rowLength
            }
            result = checkArr(vert)
            if (result) {
                return winIndexes
            }
        }
        // Check Diagonal Lines
        let diag = []
        let i = 0
        winIndexes = []
        // Check Diagonal Down
        while (diag.length < rowLength) {
            winIndexes.push(i)
            diag.push(grid[i])
            i += rowLength+1
        }
        result = checkArr(diag)
        if (result) {
            return winIndexes
        }
        // Check Diagonal Up
        diag = []
        i = 0
        winIndexes = []
        while (diag.length < rowLength) {
            i += rowLength - 1
            winIndexes.push(i)
            diag.push(grid[i])
        }
        result = checkArr(diag)
        if (result) {
            return winIndexes
        }

        // Check for Cat's Game
        if (checkForCats() == true) {
            return 'cats'
        }
        // Check for Empty Squares
        for (square in grid) {
            if (grid[square] == null) {
                return null
            }
        }
        
    }
    // Checks for Cat's Game, i.e. No winner possible due to lack of options for winning moves
    const checkForCats = () => {
        player1Char = 'x'
        player2Char = 'o'
        let start = 0
        let rowLength = Math.sqrt(grid.length)
        let totalEmpty = 0

        // Check if an array has at most one player character (and nulls); If so, returns count of nulls (empty squares)
        const emptiesOnSinglePlayerRows = (arr) => {
            if ((arr.indexOf(null) == -1) || ((arr.indexOf(player1Char)>-1 && arr.indexOf(player2Char)>-1))) {
                return null
            } else {
                return countEmptySquares(arr)
            }
        }
        const countEmptySquares = (arr) => {
            let emptySquares = 0
            for (item in arr) {;
                if (arr[item] == null) {
                    emptySquares++
                }
            }
            return emptySquares
        }
        
        totalEmpty = countEmptySquares(grid)

        // Check Horizontal Lines
        while (start < grid.length) {
            result = emptiesOnSinglePlayerRows(grid.slice(start,start+rowLength))
            if (result) {
                if (result <= Math.ceil(totalEmpty/2)) {
                    return false
                }
            }
            start += rowLength
        }
        // Check Vertical Lines
        for (let i = 0; i < rowLength; i++) {
            let vert = []
            let val = i
            while (vert.length < rowLength) {
                vert.push(grid[val])
                val += rowLength
            }
            result = emptiesOnSinglePlayerRows(vert)
            if (result) {
                if (result <= Math.ceil(totalEmpty/2)) {
                    return false
                }
            }
        }
        // Check Diagonal Lines
        let diag = []
        let i = 0
        // Check Diagonal Down
        while (diag.length < rowLength) {
            diag.push(grid[i])
            i += rowLength+1
        }
        result = emptiesOnSinglePlayerRows(diag)
        if (result) {
            if (result <= Math.ceil(totalEmpty/2)) {
                return false
            }
        }
        // Check Diagonal Up
        diag = []
        i = 0
        while (diag.length < rowLength) {
            i += rowLength - 1
            diag.push(grid[i])
        }
        result = emptiesOnSinglePlayerRows(diag)
        if (result) {
            if (result <= Math.ceil(totalEmpty/2)) {
                return false
            }
        }
        return true
    }
    // Process Gameboard clicks
    const squareClicked = (e) => {
        const id = e.target.id
        if (id == 'x' || id == 'o') {
            return
        }
        let squareID = id.slice(6)
        let markResult = false
        if (isFirstPlayersTurn) {
            if (grid[squareID] == null) {
                grid[squareID] = 'x'
                markResult = true
            }
        } else {
            if (grid[squareID] == null) {
                grid[squareID] = 'o'
                markResult = true
            }
        }
        const winState = checkForWin()

        // If there is a winner or Cat's Game...
        if (winState != null) {
            nameFieldP1.disabled = false
            nameFieldP2.disabled = false
            updateDisplay()

            if (winState == 'cats') {
                gameComplete(winState)
            } else {
                const winner = isFirstPlayersTurn? firstPName:secondPName
                gameComplete(winner)
            }
            
            let squares = document.querySelectorAll('.square')
            squares.forEach(square => {
                square.removeEventListener('click',squareClicked)
                square.classList.remove('hover')
            })

            
            for (index in winState) {
                let classes = document.querySelector(`#square${winState[index]}`).classList
                if (isFirstPlayersTurn) {
                    classes.add('winRed')
                } else {
                    classes.add('winBlue')
                }
                document.querySelector(`#square${winState[index]} h4`).style.color = 'white';
            }
            
        } else {
            if (markResult == true) {
                isFirstPlayersTurn = !isFirstPlayersTurn
                let h3s = document.getElementsByTagName('h3')
                if (isFirstPlayersTurn) {
                    h3s[0].setAttribute('class', 'redTurn')
                    h3s[1].removeAttribute('class')
                } else {
                    h3s[1].setAttribute('class', 'blueTurn')
                    h3s[0].removeAttribute('class')
                }
            }
            updateDisplay()
        }
        
    }
    return {createGrid, getGrid, updateDisplay}
})

// Initialization of the 'Start Game' dialog window
const startGameDialog = document.createElement('div')
startGameDialog.setAttribute('id','startGameDialog')
const startGameButton = document.createElement('div')
startGameDialog.appendChild(startGameButton)
startGameButton.setAttribute('id','startGameButton')
startGameButton.innerHTML = 'Click to Start Game'
startGameButton.addEventListener('click', () => {
    gameContainer.removeChild(startGameDialog)
    const gb = Gameboard()
    gb.createGrid()
    g = Game()
    g.start()
})

// Initialization of the 'Winner'/'Cat's Game' dialog window
const gameComplete = (winner) => {
    console.log('here00');
    const gameCompleteDialog = document.createElement('div')
    gameCompleteDialog.setAttribute('id','gameCompleteDialog')
    gameContainer.appendChild(gameCompleteDialog)
    const gameFinishedButton = document.createElement('div')
    gameCompleteDialog.appendChild(gameFinishedButton)
    gameFinishedButton.setAttribute('id','gameFinishedButton')
    if (winner == 'cats') {
        gameFinishedButton.innerHTML = '<div><img src="https://media.giphy.com/media/cuPm4p4pClZVC/giphy.gif" alt="Cat"></div><div><b>CAT\'S GAME</div><div>Click to Start New Game</div>'
    } else {
        let src = isFirstPlayersTurn? 'https://media.giphy.com/media/TztOD2c0znrtm/giphy.gif':'https://media.giphy.com/media/WP1PJnXWQN692/giphy.gif'
        gameFinishedButton.innerHTML = `<div><img src="${src}"></div><div><b>${winner} wins!</div><div>Click to Start New Game</div>`
    }
    toggleNameFields()
    gameFinishedButton.addEventListener('click', () => {
        gameContainer.removeChild(gameCompleteDialog)
        g = Game()
        g.start()
        const gb = Gameboard()
        gb.createGrid()
    })
    
}

const resetButton = document.querySelector('#resetButton')
let nameFieldP1;
let nameFieldP2;
let firstPName;
let secondPName;
let isFirstPlayersTurn = true
let g;

const Game = () => {
    const start = () => {
        isFirstPlayersTurn = true
        nameFieldP1 = document.querySelector('#player1Name')
        nameFieldP2 = document.querySelector('#player2Name')
        firstPName = nameFieldP1.value
        secondPName = nameFieldP2.value
        nameFieldP1.disabled = true
        nameFieldP2.disabled = true
        toggleNameFields()
        let h3s = document.getElementsByTagName('h3')
        h3s[0].setAttribute('class', 'redTurn')
        h3s[1].removeAttribute('class')
    }
    return { start }
}

// Method to disable/enable Player name text fields
const toggleNameFields = () => {
    let nameFieldDivs = document.querySelectorAll('#playerNames div')

    if (nameFieldP1.disabled == true) {
        nameFieldDivs.forEach((node) => {
            console.log('here');
            node.innerHTML = `<h3>${node.firstElementChild.value}</h3>`
        })
    } else if (nameFieldP1.innerHTML.indexOf('<input type="text" value=') == -1) {
        let i = 1
        nameFieldDivs.forEach((node) => {
            if (node.textContent == '') {
                node.textContent = `Player ${i}`
            }
            node.innerHTML = `<input type="text" value="${node.textContent}" id="player${i}Name" maxlength="8">`
            i++
        })
    }   
}

// Web app initialization method
const initialize = () => {
    const gb = Gameboard()
    gb.createGrid()
    gameContainer.appendChild(startGameDialog)
    resetButton.addEventListener('click', () => {
        nameFieldP1.disabled = false
        nameFieldP2.disabled = false

        toggleNameFields()

        const gb = Gameboard()
        gb.createGrid()
        gameContainer.appendChild(startGameDialog)
    })
}

initialize()