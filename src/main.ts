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

const gameMenuOptions = async (e: PointerEvent) => {
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
  if (chosenDifficulty === "easy") startGame("easy");
  else if (chosenDifficulty === "medium") startGame("medium");
  else startGame("hard");
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

menuElem.addEventListener("click", performMenuAction);
gameRulesElem.addEventListener("click", returnToMainMenu);
openGameMenuBtn.addEventListener("click", gameMenuOptions);
difficultyOptionsElem.addEventListener("click", difficultyDecision);

async function startGame(chosenDifficulty: string) {
  gameElem.removeAttribute("hidden");
  await sleep(1);
  gameElem.classList.add("fade-in");
  renderBoard();
}

function renderBoard() {
  boardElem.innerHTML = "";
  for (let i = 0; i < 42; i++) {
    const slot = document.createElement("div");
    slot.className = "relative flex items-center justify-center h-full w-full";
    const col = i % 7;
    const row = Math.floor(i / 7);
    slot.dataset.col = col.toString();
    slot.dataset.row = row.toString();

    boardElem.appendChild(slot);
  }
}

startGame("hard");
