import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

export class Luftung extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "climate.blauberg_s21",
      "sensor.blauberg_s21",
      "sensor.blauberg_s21_2",
      "sensor.blauberg_s21_3",
      "sensor.blauberg_s21_4",
    ];
  }

  render() {
    this.classList.add("box-shadow");
    return html`
      <div class="room-container-inner">
        <div
          id="${this.id}-temp-aussenluft"
          class="big"
          style="position: absolute; bottom: 0; left: 0;"
        >
          <span></span>
          <span class="unit">°C</span>
        </div>
        <div
          id="${this.id}-temp-zuluft"
          class="big"
          style="position: absolute; top: 0; left: 0;"
        >
          <span></span>
          <span class="unit">°C</span>
        </div>
        <div
          id="${this.id}-temp-abluft"
          class="big"
          style="position: absolute; top: 0; right: 0;"
        >
          <span></span>
          <span class="unit">°C</span>
        </div>
        <div
          id="${this.id}-temp-fortluft"
          class="big"
          style="position: absolute; bottom: 0; right: 0;"
        >
          <span></span>
          <span class="unit">°C</span>
        </div>
        <ha-icon
          style="
            position: absolute;
            top: calc(50% - 25px);
            left: 10px;
            width: 50px;
            height: 50px;
            color: var(--polar-light-gray);
          "
          icon="mdi:arrow-up-bold"
        ></ha-icon>
        <ha-icon
          style="
            position: absolute;
            top: calc(50% - 25px);
            right: 10px;
            width: 50px;
            height: 50px;
            color: var(--polar-light-gray);
          "
          icon="mdi:arrow-down-bold"
        ></ha-icon>
      </div>
      <div
        style="
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          --mdc-icon-size: 120px;
        "
      >
        <ha-icon
          id="${this.id}-icon"
          icon="mdi:fan"
          style="color: var(--polar-light-gray);"
        ></ha-icon>
        <div
          id="${this.id}-fan-speed"
          style="position: absolute; font-weight: bold;"
        >
          <span></span>
        </div>
      </div>
    `;
  }

  updated() {
    super.updated();

    for (const [sensor, span] of [
      ["sensor.blauberg_s21", "aussenluft"],
      ["sensor.blauberg_s21_2", "zuluft"],
      ["sensor.blauberg_s21_3", "abluft"],
      ["sensor.blauberg_s21_4", "fortluft"],
    ]) {
      setInnerNumeric(
        this.renderRoot,
        `#${this.id}-temp-${span} span`,
        this.hass.states[sensor].state,
      );
    }

    const climate = this.hass.states["climate.blauberg_s21"];
    const duration = { low: 10, medium: 5, high: 3 }[
      climate.attributes.fan_mode
    ];
    this.querySelector(`#${this.id}-icon`).style.animation =
      `spin ${duration}s linear infinite`;

    const fanSpeed = { low: "1", medium: "2", high: "3" }[
      climate.attributes.fan_mode
    ];
    this.querySelector(`#${this.id}-fan-speed span`).innerHTML = fanSpeed;
  }
}
customElements.define("room-luftung", Luftung);
