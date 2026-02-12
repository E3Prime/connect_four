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
    difficultyOptionsElem.classList.add("difficulty-options-reveal");
    return;
  }

  menuElem.classList.add("fly-off-left");
  await sleep(1000);
  menuElem.parentElement?.setAttribute("hidden", "");
  gameRulesElem.parentElement?.removeAttribute("hidden");
  await sleep(1);
  gameRulesElem.classList.remove("fly-from-right");
};

const difficultyDecision = async (e: PointerEvent) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  const chosenDifficulty = e.target.id;
  difficultyOptionsElem.classList.remove("difficulty-options-reveal");
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
const boardElem = gameElem.querySelector("#board") as HTMLElement;

menuElem.addEventListener("click", performMenuAction);
gameRulesElem.addEventListener("click", returnToMainMenu);
difficultyOptionsElem.addEventListener("click", difficultyDecision);

async function startGame(chosenDifficulty: string) {
  gameElem.removeAttribute("hidden");
  await sleep(1);
  gameElem.classList.add("fade-in");
  renderBoard();
}

function renderBoard() {
  boardElem.innerHTML = "";
}

startGame("hard");
