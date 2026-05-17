import { css } from "https://unpkg.com/lit-element@3.3.2/lit-element.js?module";

var svgCache = undefined;

export const roomIds = [
  "ogbad",
  "ogschlafzimmer",
  "ogkind1",
  "ogkind2",
  "egbad",
  "egwohnzimmer",
  "egkuche",
  "egflur",
  "egburo",
  "heizung",
  "batterie",
  "luftung",
  "ughobby",
  "ugburo",
];

export const boxIds = [
  "zisterne",
  "pvgarage",
  "pvost",
  "pvwest",
  "stromnutzung",
  "stromverteilung",
  "stromverteilung2",
  "eingang",
  "gewachshaus",
  "heizungboiler",
  "stromUg",
  "stromEg",
  "stromOg",
  "stromGarage",
  "stromnutzungInfo",
  "stromverteilungInfo",
  "wetterstation",
  "garage",
];

export const roomPositions = {};

export const svgCss = css`
  .svg-room {
    stroke: black;
    stroke-width: 0px;
    fill: none;
  }
  #feld1,
  #feld2 {
    filter: drop-shadow(2px 2px 5px #00000050);
  }

  #lufter {
    transform-origin: center;
    transform-box: fill-box;
  }
`;

function adjustRoomSizes(svg) {
  const viewBox = svg.attributes.viewBox;
  const [_x, _y, svgWidth, svgHeight] = viewBox.value.split(" ");
  const margin = 5;
  for (const roomid of roomIds) {
    const room = svg.querySelector(`#${roomid}`);
    room.setAttribute("x", parseFloat(room.attributes.x.value) + margin);
    room.setAttribute("y", parseFloat(room.attributes.y.value) + margin);
    room.setAttribute(
      "width",
      parseFloat(room.attributes.width.value) - 2 * margin
    );
    room.setAttribute(
      "height",
      parseFloat(room.attributes.height.value) - 2 * margin
    );
    room.classList = "svg-room";

    roomPositions[roomid] = {
      x: parseFloat(room.attributes.x.value) / svgWidth,
      y: parseFloat(room.attributes.y.value) / svgHeight,
      w: parseFloat(room.attributes.width.value) / svgWidth,
      h: parseFloat(room.attributes.height.value) / svgHeight,
    };
  }
  for (const id of boxIds) {
    const room = svg.querySelector(`#${id}`);
    roomPositions[id] = {
      x: parseFloat(room.attributes.x?.value) / svgWidth,
      y: parseFloat(room.attributes.y?.value) / svgHeight,
      w: parseFloat(room.attributes.width.value) / svgWidth,
      h: parseFloat(room.attributes.height.value) / svgHeight,
    };
  }
}

export async function loadBgImage() {
  if (svgCache) {
    return svgCache.cloneNode(true);
  }

  const res = await fetch("local/bgimage.svg");
  const text = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "image/svg+xml");

  const svg = doc.documentElement;
  adjustRoomSizes(svg);
  svgCache = svg;

  return svg.cloneNode(true);
}
