import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

export class Luftung extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = ["climate.blauberg_s21"];
  }

  render() {
    this.classList.add("box-shadow");
    return html`
      <div class="room-container-inner">
        <div class="icon-label big">
          <ha-icon icon="mdi:thermometer"></ha-icon>
          <div id="${this.id}-temp">
            <span></span>
            <span class="unit">°C</span>
          </div>
        </div>
      </div>
      <div
        style="
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          --mdc-icon-size: 150px;
          color: var(--polar-light-gray);
        "
      >
        <ha-icon
          style="margin-top:40px"
          id="${this.id}-icon"
          icon="mdi:fan"
        ></ha-icon>
      </div>
    `;
  }

  updated() {
    super.updated();

    const climate = this.hass.states["climate.blauberg_s21"];
    setInnerNumeric(
      this.renderRoot,
      `#${this.id}-temp span`,
      climate.attributes.current_temperature
    );

    const duration = { low: 10, medium: 5, high: 3 }[
      climate.attributes.fan_mode
    ];
    this.querySelector(
      `#${this.id}-icon`
    ).style.animation = `spin ${duration}s linear infinite`;
  }
}
customElements.define("room-luftung", Luftung);
