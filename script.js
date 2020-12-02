const PICK_AND_CHOOSE = Symbol();
const PLAYING = Symbol();
const WIN = Symbol();
const LOSS = Symbol();

const states = {
  [PICK_AND_CHOOSE]: 0,
  [PLAYING]: 1,
};

let currentState = states[PICK_AND_CHOOSE];

const numberOfTiles = 25;

const $bingoGrid = document.querySelector(".bingo-grid");
const $bingoOptions = document.querySelector(".bingo-options");
const $switch = document.querySelector(".toggle-switch");
const $resetButton = document.querySelector(".reset-button");

let bingoTiles = [];

const optionGroups = [
  {
    categoryName: "Korona",
    options: [
      "Hjemmekontor",
      "Covid-19",
      "Korona",
      "Munnbind",
      "Karantene",
      "Isolasjon",
      "“Kan du se skjermen min?”",
      "*Barn som kommer inn i møte*",
      "Vattpinne",
      "*Tekniske problemer*",
      "Skribbl.io",
      "“Kameraet mitt virker ikke”",
      "“Hører dere meg?”",
      "Corona-tiltak",
      "Restriksjoner",
      "Dugnad",
      "Nedstengning"
    ]
  },
  {
    categoryName: "Administrativt",
    options: [
      "Ex-Tieto",
      "Ex-Evry",
      "TietoEvry",
      "Big Boss Kimmo",
      "Synergier",
      "Workplace",
      "Weekly Newsletter",
      "All-hands",
      "Code of Conduct",
      "“Salary-revison??”",
      "The question section in all-hands",
      "Reply-all",
      "OurVoice"
    ]
  },
  {
    categoryName: "Verktøy",
    options: [
      "Figma",
      "Microsoft Teams",
      "DevOps",
      "Azure",
      "Kubernetes",
      "Docker",
      "React",
      "Three.js",
      "Webpack",
      "C#",
      "Angular",
      "AWS",
      "UNIX",
      "Adobe XD",
      "API",
      "Devdev",
      "Outsystems",
      "GitHub",
      "Agile"
    ]
  },
  {
    categoryName: "Aktuelt",
    options: [
      "Black Friday",
      "Movember",
      "Stop the count!",
      "Xbox-X",
      "PS5",
      "Vaksine",
      "Fredagsbingo",
      "Trump",
      "Biden"
    ]
  }
];
let $activeTile = null;

function createBingoTiles() {
  return Array(numberOfTiles).fill(undefined).map((_, index) => createBingoTile(index));
}

function createBingoTile(index) {
  const isMiddleTile = index === 12;

  const $bingoTile = document.createElement("button");
  $bingoTile.classList.add("bingo-tile");
  $bingoTile.addEventListener("click", clickBingoTile);
  $bingoTile.type = "button";
  $bingoTile.dataset.option = "";
  $bingoTile.dataset.freeTile = isMiddleTile;

  const $tileText = document.createElement("span");
  $tileText.classList.add("bingo-tile-text");

  $bingoTile.appendChild($tileText);

  return $bingoTile;
}

function clickBingoTile(event) {
  const $bingoTile = event.currentTarget;
  if (!$bingoTile || $bingoTile === $activeTile) {
    return;
  }

  const isFreeTile = $bingoTile.dataset.freeTile === "true";
  if (isFreeTile) {
    return;
  }

  const isPickingAndChoosing = currentState === states[PICK_AND_CHOOSE];
  const isPlaying = currentState === states[PLAYING];

  if (isPickingAndChoosing) {
    emptyBingoOptions();
    addBingoOptions();

    $bingoTile.appendChild($bingoOptions);

    $activeTile = $bingoTile;
  } else if (isPlaying) {
    console.log($bingoTile.dataset.crossedOff);
    $bingoTile.dataset.crossedOff = !$bingoTile.dataset.crossedOff || $bingoTile.dataset.crossedOff === "false";
  }
}

function getAvailableOptions() {
  return optionGroups.map(optionGroup => ({
    ...optionGroup,
    options: optionGroup.options.filter(
      option =>
        !bingoTiles.some($bingoTile => $bingoTile.dataset.option === option)
    ),
  }));
}

function addBingoOptions() {
  const defaultOption = document.createElement('option');
  defaultOption.textContent = "––– Velg alternativ ✨"
  defaultOption.value = "default";
  defaultOption.selected = true;

  $bingoOptions.appendChild(defaultOption);

  for (const $bingoOptionGroup of createBingoOptionGroups()) {
    $bingoOptions.appendChild($bingoOptionGroup);
  }
}

function createBingoOptionGroups() {
  const options = getAvailableOptions();
  const optGroups = [];

  for (const optionGroup of options) {
    const $optGroup = createBingoOptionGroup(optionGroup.categoryName);

    for (const option of optionGroup.options) {
      const $option = createBingoOption(option);

      $optGroup.appendChild($option);
    }

    optGroups.push($optGroup);
  }

  return optGroups;
}

function createBingoOptionGroup(categoryName) {
  const $optGroup = document.createElement('optgroup');
  $optGroup.setAttribute('label', categoryName);

  return $optGroup;
}

function createBingoOption(option) {
  const $option = document.createElement('option');
  $option.textContent = option;
  $option.value = option;

  return $option;
}

function onToggleGameMode(event) {
  const isChecked = event.target.checked;

  if (isChecked) {
    currentState = states[PLAYING];

    const bingoOptionsIsInDom = Boolean($bingoOptions.parentElement);
    if (bingoOptionsIsInDom) {
      $bingoOptions.parentElement.removeChild($bingoOptions);
    }
  } else {
    currentState = states[PICK_AND_CHOOSE];
  }
}

function init() {
  reset();
  $bingoOptions.addEventListener('change', onSelectOption);
  $switch.addEventListener('change', onToggleGameMode);
  $resetButton.addEventListener('click', reset);
}

function reset() {
  document.body.appendChild($bingoOptions);

  currentState = states[PICK_AND_CHOOSE];
  $switch.checked = false;

  $bingoGrid.innerHTML = '';
  bingoTiles = [];

  for (const tile of createBingoTiles()) {
    bingoTiles.push(tile);
    $bingoGrid.appendChild(tile);
  }
}

function emptyBingoOptions() {
  $bingoOptions.innerHTML = '';
}

function onSelectOption(event) {
  event.stopPropagation();
  const option = event.target.value;
  const $button = event.target.parentNode;


  setBingoOption(option, $button);
  emptyBingoOptions();
  addBingoOptions();
}

function setBingoOption(option, $button) {
  const $tileText = $button.querySelector(".bingo-tile-text");

  const isDefaultOption = option === 'default';
  if (isDefaultOption) {
    $button.dataset.option = null;
    $tileText.textContent = '';
  }

  $button.dataset.option = option;
  $tileText.textContent = option;

  $activeTile = null;
}

init();
