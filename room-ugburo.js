import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";

export class Ugburo extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "sensor.shichtwerk",
      "sensor.schichtwerk_fortschritt",
      "sensor.schichtwerk_material",
      "binary_sensor.bthome_sensor_2272_window",
    ];
  }

  static get styles() {
    return css`
      .ellipse-svg {
        width: 100%;
        height: auto;
        overflow: visible;
      }

      #ellipse-path {
        fill: none;
        stroke: var(--aurora-orange);
        stroke-width: 7;
        stroke-linecap: round;

        stroke-dasharray: 700 755;
        stroke-dashoffset: 700;
        animation: drawLine 4s linear infinite;
      }

      #ugburo-hotend-tip {
        fill: var(--aurora-orange);
        filter: drop-shadow(0 0 0px var(--aurora-orange));

        offset-path: path(
          "M 50,125 a 150,75 0 1,0 300,0 a 150,75 0 1,0 -300,0"
        );
        animation: moveHotend 4s linear infinite;
      }

      #ugburo-hotend {
        fill: var(--aurora-orange);
        filter: drop-shadow(0 0 2px var(--aurora-orange));
        offset-path: path(
          "M 50,125 a 150,75 0 1,0 300,0 a 150,75 0 1,0 -300,0"
        );
        offset-rotate: 0deg;
        transform: scale(7) translate(464px, -361px);
        animation: moveHotend 4s linear infinite;
      }

      #ugburo-svg {
        position: absolute;
        bottom: -20px;
      }

      @keyframes drawLine {
        to {
          stroke-dashoffset: -20;
        }
      }

      @keyframes moveHotend {
        0% {
          offset-distance: 0%;
        }
        100% {
          offset-distance: 100%;
        }
      }

      #printing-image {
        width: 100%;
        bottom: 0;
        position: absolute;
        z-index: 0;
      }
    `;
  }

  render() {
    this.classList.add("box-shadow");
    if (!this._cards) {
      return html``;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src =
      this.hass.states["camera.schichtwerk_vorschau"].attributes.entity_picture;

    img.onload = () => {
      const canvas = this.renderRoot.querySelector("#printing-image");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Remove all which is not orange or gray/white
        if ((r < 100 && g < 100) || (r < 200 && r == g && g == b)) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };

    return html`
      <div class="room-container-inner">
        <div class="icon-label">
          <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
          <div id="${this.id}-material"></div>
        </div>
        <div class="icon-label big" id="${this.id}-progress">
          <ha-icon icon="mdi:progress-clock"></ha-icon>
          <div>
            <span></span>
            <span class="unit">%</span>
          </div>
        </div>
        <div
          style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;"
        >
          <ha-icon
            style="
              margin-top: 20px;
              --mdc-icon-size: 120px;
              color: var(--polar-river-gray);
              z-index: -1;
              "
            icon="mdi:printer-3d-nozzle"
            id="${this.id}-icon"
          ></ha-icon>
        </div>
        <svg id="ugburo-svg" viewBox="0 0 400 250" class="ellipse-svg">
          <!-- The path representing the elliptic track -->
          <!-- rx=150 (horizontal radius), ry=75 (vertical radius) -->
          <path
            id="ellipse-path"
            d="M 50,125 a 150,75 0 1,0 300,0 a 150,75 0 1,0 -300,0"
          />

          <circle id="ugburo-hotend-tip" r="5" />
          <path
            id="ugburo-hotend"
            d="M-469,344.7h10v6h2v5h-2.5l-3.5,4h-2l-3.5-4h-2.5v-5h2V344.7"
          />
        </svg>
        <canvas id="printing-image"></canvas>
      </div>
      <div class="room-window-container" id="${this.id}-window">
        <div></div>
      </div>
    `;
  }

  updated() {
    super.updated();
    const printing =
      this.hass.states["sensor.schichtwerk"].state === "printing";
    this.renderRoot
      .querySelector(`#${this.id}-svg`)
      .classList.toggle("hidden", !printing);
    this.renderRoot.querySelector(`#${this.id}-material`).innerHTML =
      this.hass.states["sensor.schichtwerk_material"].state;

    const progress = this.renderRoot.querySelector(`#${this.id}-progress`);
    const progressState =
      this.hass.states["sensor.schichtwerk_fortschritt"].state;
    progress.classList.toggle("hidden", progressState == "not available");
    progress.querySelector("span").innerHTML = progressState;

    const windowState =
      this.hass.states["binary_sensor.bthome_sensor_2272_window"].state;
    const tilted =
      this.hass.states["sensor.bthome_sensor_2272_rotation"].state > 3;
    this.renderRoot.querySelector(
      `#${this.id}-window`
    ).firstElementChild.classList = tilted
      ? "icon-window-tilted"
      : windowState == "on"
      ? "icon-window-opened"
      : "icon-window-closed";
  }
}
customElements.define("room-ugburo", Ugburo);
