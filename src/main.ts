const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const returnToMainMenu = async (e: PointerEvent) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  gameRulesElem.classList.add("fly-from-right");
  await sleep(1000);
  gameRulesElem.parentElement?.setAttribute("hidden", "");
  menuElem.parentElement?.removeAttribute("hidden");
  await sleep(1);
  menuElem.classList.remove("fly-off-left");
};

const performMenuAction = async (e: PointerEvent) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  const menuAction = e.target.id;

  if (menuAction === "selectDifficulty") {
    menuOverlayElem.removeAttribute("hidden");
    await sleep(1);
    menuOverlayElem.classList.add("overlay-transition");
    await sleep(700);
    difficultyOptionsElem.classList.add("options-reveal");
    return;
  }

  menuElem.classList.add("fly-off-left");
  await sleep(1000);
  menuElem.parentElement?.setAttribute("hidden", "");
  gameRulesElem.parentElement?.removeAttribute("hidden");
  await sleep(1);
  gameRulesElem.classList.remove("fly-from-right");
};

const openGameMenuOptions = async (e: PointerEvent) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  gameMenuOverlay.removeAttribute("hidden");
  await sleep(1);
  gameMenuOverlay.classList.add("overlay-transition");
  await sleep(700);
  gameMenuOptionsElem.classList.add("options-reveal");
};

const difficultyDecision = async (e: PointerEvent) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  const chosenDifficulty = e.target.id;
  difficultyOptionsElem.classList.remove("options-reveal");
  await sleep(500);
  menuOverlayElem.classList.remove("overlay-transition");
  menuElem.classList.add("fly-off-left");
  await sleep(700);
  menuOverlayElem.setAttribute("hidden", "");
  menuElem.parentElement?.setAttribute("hidden", "");
  if (chosenDifficulty === "easy") initializeGame("easy");
  else if (chosenDifficulty === "medium") initializeGame("medium");
  else initializeGame("hard");
};

const gameMenuOptions = async (e: PointerEvent) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  const target = e.target.id;
  if (target === "continue") {
    gameMenuOptionsElem.classList.remove("options-reveal");
    await sleep(700);
    gameMenuOverlay.classList.remove("overlay-transition");
    await sleep(500);
    gameMenuOverlay.setAttribute("hidden", "");
    return;
  }

  gameElem.classList.remove("fade-in");
  gameMenuOptionsElem.classList.remove("options-reveal");
  gameMenuOverlay.classList.remove("overlay-transition");
  await sleep(700);
  resetGame();
  gameMenuOverlay.setAttribute("hidden", "");
  gameElem.setAttribute("hidden", "");
  await sleep(1000);
  menuElem.parentElement?.removeAttribute("hidden");
  await sleep(1);
  menuElem.classList.remove("fly-off-left");
};

const menuElem = document.getElementById("menu") as HTMLElement;
const menuOverlayElem = menuElem.nextElementSibling as HTMLElement;
const difficultyOptionsElem = menuOverlayElem.firstElementChild as HTMLElement;
const gameRulesElem = document.getElementById("gameRules") as HTMLElement;
const gameElem = document.getElementById("game") as HTMLElement;
const openGameMenuBtn = gameElem.querySelector("#openGameMenu") as HTMLButtonElement;
const gameMenuOverlay = gameElem.querySelector("#gameMenuOverlay") as HTMLElement;
const gameMenuOptionsElem = gameMenuOverlay.firstElementChild as HTMLElement;
const boardElem = gameElem.querySelector("#board") as HTMLElement;
const markerElem = document.getElementById("marker") as HTMLElement;
const restartBtn = document.getElementById("restartGame") as HTMLButtonElement;
const winnerCard = document.getElementById("winnerCard") as HTMLElement;
const winnerText = document.getElementById("winnerText") as HTMLElement;
const playAgainBtn = document.getElementById("playAgain") as HTMLButtonElement;
const scorePlayerElem = document.getElementById("scorePlayer") as HTMLElement;
const scoreCpuElem = document.getElementById("scoreCpu") as HTMLElement;
const turnTimerElem = document.getElementById("turnTimer") as HTMLElement;
const timerCountElem = document.getElementById("timerCount") as HTMLElement;

const ROWS = 6;
const COLS = 7;
let boardState: number[][] = [];
let currentPlayer = 1;
let isGameActive = false;
let isAnimating = false;
let currentDifficulty = "easy";
let lastHoveredCol = -1;
const PLAYER = 1;
const CPU = 2;
const MAX_DEPTH = 5;
let scorePlayer = 0;
let scoreCpu = 0;
let timerInterval: number | undefined;
let timeLeft = 0;

menuElem.addEventListener("click", performMenuAction);
gameRulesElem.addEventListener("click", returnToMainMenu);
openGameMenuBtn.addEventListener("click", openGameMenuOptions);
difficultyOptionsElem.addEventListener("click", difficultyDecision);
gameMenuOptionsElem.addEventListener("click", gameMenuOptions);
restartBtn.addEventListener("click", () => resetGame(false));
playAgainBtn.addEventListener("click", () => resetGame(false));
boardElem.addEventListener("click", (e) => {
  const targetSlot = (e.target as Element).closest("[data-col]") as HTMLElement;

  if (targetSlot) {
    const col = parseInt(targetSlot.dataset.col!);
    handleColumnClick(col);
  }
});

boardElem.addEventListener("mousemove", (e) => {
  const targetSlot = (e.target as Element).closest("[data-col]") as HTMLElement;

  if (targetSlot) {
    const col = parseInt(targetSlot.dataset.col!);

    if (lastHoveredCol !== col) {
      handleHover(col);
      lastHoveredCol = col;
    }
  }
});

boardElem.addEventListener("mouseleave", () => {
  markerElem.classList.add("hidden");
  lastHoveredCol = -1;
});

async function initializeGame(chosenDifficulty: string) {
  currentDifficulty = chosenDifficulty;
  isGameActive = true;
  isAnimating = false;
  currentPlayer = 1;
  boardState = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));
  renderBoard();
  gameElem.removeAttribute("hidden");
  await sleep(3);
  gameElem.classList.add("fade-in");
}

function renderBoard() {
  boardElem.innerHTML = "";

  for (let i = 0; i < 42; i++) {
    const slot = document.createElement("div");
    slot.className = "relative flex items-center justify-center h-full w-full pointer-events-auto cursor-pointer";

    const col = i % 7;
    const row = Math.floor(i / 7);

    slot.dataset.col = col.toString();
    slot.dataset.row = row.toString();

    boardElem.appendChild(slot);
  }
}

function handleHover(colIndex: number) {
  if (!isGameActive || currentPlayer !== 1) return;
  markerElem.style.transform = `translateX(${colIndex * 100}%)`;
}

function handleColumnClick(colIndex: number) {
  if (!isGameActive || isAnimating || currentPlayer !== 1) return;

  const validRow = getFirstOpenRow(colIndex);

  if (validRow !== -1) dropPiece(validRow, colIndex, 1);
}

function getFirstOpenRow(colIndex: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (boardState[r][colIndex] === 0) {
      return r;
    }
  }
  return -1;
}

async function dropPiece(row: number, col: number, player: number) {
  if (player === 1) {
    stopTimer();
    turnTimerElem.classList.add("hidden");
  }

  isAnimating = true;
  boardState[row][col] = player;

  const piece = document.createElement("div");
  piece.className = `w-[80%] h-[80%] rounded-full shadow-md z-0 ${player === 1 ? "bg-pink-500" : "bg-yellow-400"}`;
  piece.classList.add("animate-drop");

  const index = row * COLS + col;
  const targetSlot = boardElem.children[index] as HTMLElement;
  targetSlot.appendChild(piece);

  await sleep(0.5);
  isAnimating = false;

  if (checkWin(row, col, player)) endGame(player);
  else if (checkDraw()) endGame(0);
  else switchTurn();
}

function switchTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;

  if (currentPlayer === 1) {
    markerElem.classList.remove("hidden");
    markerElem.style.display = "flex";

    startTimer();
  } else {
    stopTimer();
    turnTimerElem.classList.add("hidden");

    markerElem.classList.add("hidden");
    setTimeout(() => playCpuTurn(), 600);
  }
}

async function playCpuTurn() {
  if (!isGameActive) return;

  await sleep(0.6);

  let chosenColumn: number;

  switch (currentDifficulty) {
    case "easy":
      chosenColumn = getRandomMove();
      break;
    case "medium":
      const isSmart = Math.random() > 0.5;
      chosenColumn = isSmart ? getBestMove() : getRandomMove();
      break;
    case "hard":
      chosenColumn = getBestMove();
      break;
    default:
      chosenColumn = getRandomMove();
  }

  if (chosenColumn !== -1) {
    const row = getFirstOpenRow(chosenColumn);
    dropPiece(row, chosenColumn, CPU);
  }
}

function getBestMove(): number {
  let bestScore = -Infinity;
  let move = -1;

  const tempBoard = boardState.map((row) => [...row]);

  const validMoves = getValidLocations(tempBoard);

  if (validMoves.length === COLS && tempBoard[5][3] === 0) {
    return 3;
  }

  for (const col of validMoves) {
    const row = getOpenRow(tempBoard, col);

    tempBoard[row][col] = CPU;

    const score = minimax(tempBoard, MAX_DEPTH, -Infinity, Infinity, false);

    tempBoard[row][col] = 0;

    if (score > bestScore) {
      bestScore = score;
      move = col;
    }
  }

  return move !== -1 ? move : getRandomMove();
}

function minimax(board: number[][], depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  const validMoves = getValidLocations(board);
  const isTerminal = isTerminalNode(board);

  if (depth === 0 || isTerminal) {
    if (isTerminal) {
      if (checkWinningMove(board, CPU)) return 1000000;
      if (checkWinningMove(board, PLAYER)) return -1000000;
      return 0;
    } else {
      return scorePosition(board, CPU);
    }
  }

  if (isMaximizing) {
    let value = -Infinity;
    for (const col of validMoves) {
      const row = getOpenRow(board, col);
      board[row][col] = CPU;
      value = Math.max(value, minimax(board, depth - 1, alpha, beta, false));
      board[row][col] = 0;
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (const col of validMoves) {
      const row = getOpenRow(board, col);
      board[row][col] = PLAYER;
      value = Math.min(value, minimax(board, depth - 1, alpha, beta, true));
      board[row][col] = 0;
      beta = Math.min(beta, value);
      if (beta <= alpha) break;
    }
    return value;
  }
}

function getValidLocations(board: number[][]) {
  const valid = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) valid.push(c);
  }
  return valid;
}

function getOpenRow(board: number[][], col: number) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function isTerminalNode(board: number[][]) {
  return checkWinningMove(board, PLAYER) || checkWinningMove(board, CPU) || getValidLocations(board).length === 0;
}

function checkWinningMove(board: number[][], piece: number) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === piece && board[r][c + 1] === piece && board[r][c + 2] === piece && board[r][c + 3] === piece) return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === piece && board[r + 1][c] === piece && board[r + 2][c] === piece && board[r + 3][c] === piece) return true;
    }
  }

  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === piece && board[r - 1][c + 1] === piece && board[r - 2][c + 2] === piece && board[r - 3][c + 3] === piece) return true;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === piece && board[r + 1][c + 1] === piece && board[r + 2][c + 2] === piece && board[r + 3][c + 3] === piece) return true;
    }
  }
  return false;
}

function scorePosition(board: number[][], piece: number) {
  let score = 0;
  const oppPiece = piece === CPU ? PLAYER : CPU;

  const centerArray = [];
  for (let r = 0; r < ROWS; r++) centerArray.push(board[r][3]);
  const centerCount = centerArray.filter((p) => p === piece).length;
  score += centerCount * 3;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(window, piece, oppPiece);
    }
  }

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(window, piece, oppPiece);
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(window, piece, oppPiece);
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r + 3][c], board[r + 2][c + 1], board[r + 1][c + 2], board[r][c + 3]];
      score += evaluateWindow(window, piece, oppPiece);
    }
  }

  return score;
}

function evaluateWindow(window: number[], piece: number, oppPiece: number) {
  let score = 0;
  const pieceCount = window.filter((p) => p === piece).length;
  const emptyCount = window.filter((p) => p === 0).length;
  const oppCount = window.filter((p) => p === oppPiece).length;

  if (pieceCount === 4) {
    score += 100;
  } else if (pieceCount === 3 && emptyCount === 1) {
    score += 5;
  } else if (pieceCount === 2 && emptyCount === 2) {
    score += 2;
  }

  if (oppCount === 3 && emptyCount === 1) {
    score -= 4;
  }

  return score;
}

function getRandomMove() {
  const validCols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (boardState[0][c] === 0) {
      validCols.push(c);
    }
  }

  if (validCols.length === 0) return -1;
  return validCols[Math.floor(Math.random() * validCols.length)];
}

function checkWin(row: number, col: number, player: number): boolean {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let [dr, dc] of directions) {
    let count = 1;

    for (let i = 1; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || boardState[r][c] !== player) break;
      count++;
    }

    for (let i = 1; i < 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || boardState[r][c] !== player) break;
      count++;
    }

    if (count >= 4) return true;
  }
  return false;
}

function checkDraw() {
  return boardState[0].every((cell) => cell !== 0);
}

function endGame(winner: number) {
  stopTimer();
  turnTimerElem.classList.add("hidden");
  isGameActive = false;

  if (winner === 1) {
    scorePlayer++;
    scorePlayerElem.innerText = scorePlayer.toString();
    winnerText.innerText = "YOU";
  } else if (winner === 2) {
    scoreCpu++;
    scoreCpuElem.innerText = scoreCpu.toString();
    winnerText.innerText = "CPU";
  } else {
    winnerText.innerText = "NO ONE";
  }

  winnerCard.classList.remove("hidden");
  winnerCard.classList.add("flex");
  markerElem.classList.add("hidden");
}

function resetGame(fullyResetScores: boolean = false) {
  stopTimer();
  turnTimerElem.classList.add("hidden");
  isGameActive = true;
  isAnimating = false;
  currentPlayer = 1;

  boardState = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));

  renderBoard();

  winnerCard.classList.add("hidden");
  winnerCard.classList.remove("flex");
  markerElem.classList.remove("hidden");
  markerElem.style.display = "flex";

  if (fullyResetScores) {
    scorePlayer = 0;
    scoreCpu = 0;
    scorePlayerElem.innerText = "0";
    scoreCpuElem.innerText = "0";
  }
}

function startTimer() {
  stopTimer();

  switch (currentDifficulty) {
    case "easy":
      timeLeft = 20;
      break;
    case "medium":
      timeLeft = 10;
      break;
    case "hard":
      timeLeft = 7;
      break;
    default:
      timeLeft = 20;
  }

  timerCountElem.innerText = timeLeft.toString();
  turnTimerElem.classList.remove("hidden");
  turnTimerElem.classList.remove("translate-y-full");

  timerInterval = setInterval(() => {
    --timeLeft;
    timerCountElem.innerText = timeLeft.toString();
    if (timeLeft <= 0) {
      stopTimer();
      handleTimeOut();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = undefined;
  }
}

function handleTimeOut() {
  const randomCol = getRandomMove();
  if (randomCol !== -1) {
    const row = getFirstOpenRow(randomCol);
    dropPiece(row, randomCol, PLAYER);
  }
}
