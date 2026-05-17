import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";

export const IDS = {
  ogbad: { shrink: true },
  ogschlafzimmer: { shrink: true },
  ogkind1: { shrink: true },
  ogkind2: { shrink: true },
  egbad: { shrink: true },
  egwohnzimmer: { shrink: true },
  egkuche: { shrink: true },
  egflur: { shrink: true },
  egburo: { shrink: true },
  heizung: { shrink: true },
  batterie: { shrink: true },
  luftung: { shrink: true },
  ughobby: { shrink: true },
  ugburo: { shrink: true },
  // zisterne: {},
  pvgarage: {},
  pvost: {},
  pvwest: {},
  stromnutzung: {},
  stromverteilung: {},
  stromverteilung2: {},
  eingang: {},
  gewachshaus: {},
  heizungboiler: {},
  stromug: {},
  stromeg: {},
  stromog: {},
  stromgarage: {},
  stromnutzunginfo: {},
  stromverteilunginfo: {},
  wetterstation: {},
  garage: {},
};

async function loadSvg(path) {
  const res = await fetch(path);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "image/svg+xml");
  return doc.documentElement;
}

export class HouseBackground extends LitElement {
  static get styles() {
    return css`
      house-background,
      house-background svg {
        z-index: -99;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
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
  }

  constructor() {
    super();

    this.positionsCompleted = false;
  }

  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    this.svg = await loadSvg("local/powerhouse/bgimage.svg");
    this.adjustRoomSizes();
    await this.requestUpdate();

    this.dispatchEvent(
      new CustomEvent("background-ready", {
        bubbles: true,
      })
    );
  }

  adjustRoomSizes() {
    const viewBox = this.svg.attributes.viewBox;
    const [_x, _y, svgWidth, svgHeight] = viewBox.value.split(" ");
    const margin = 5;

    for (const id in IDS) {
      const room = this.svg.querySelector(`#${id}`);
      if (IDS[id].shrink) {
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
      }
      room.classList = "svg-room";

      // Set positions and sizes
      IDS[id].x =
        (parseFloat(room.attributes.x?.value) / svgWidth) * window.innerWidth;
      IDS[id].y =
        (parseFloat(room.attributes.y?.value) / svgHeight) * window.innerHeight;
      IDS[id].w =
        (parseFloat(room.attributes.width.value) / svgWidth) *
        window.innerWidth;
      IDS[id].h =
        (parseFloat(room.attributes.height.value) / svgHeight) *
        window.innerHeight;
    }
  }

  render() {
    return html`${this.svg}`;
  }
}

customElements.define("house-background", HouseBackground);
