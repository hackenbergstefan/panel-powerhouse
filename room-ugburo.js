import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";

export class Ugburo extends Room {
  render() {
    this.classList.add("box-shadow");
    if (!this._cards) {
      return html``;
    }
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
              z-index: -1;"
            icon="mdi:printer-3d-nozzle"
            id="${this.id}-icon"
          ></ha-icon>
        </div>
      </div>
    `;
  }

  updated() {
    super.updated();
    const printing = this.hass.states["sensor.schichtwerk"] === "printing";
    this.renderRoot
      .querySelector(`#${this.id}-icon`)
      .classList.toggle("text-pulse-glow", printing);
    this.renderRoot.querySelector(`#${this.id}-material`).innerHTML =
      this.hass.states["sensor.schichtwerk_material"].state;

    const progress = this.renderRoot.querySelector(`#${this.id}-progress`);
    progress.classList.toggle("hidden", !printing);
    progress.querySelector("span").innerHTML =
      this.hass.states["sensor.schichtwerk_fortschritt"].state;
  }
}
customElements.define("room-ugburo", Ugburo);
