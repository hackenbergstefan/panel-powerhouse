import { html } from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

export class Gewachshaus extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "temperatur_gewachshaus_temperature",
      "temperatur_gewachshaus_humidity",
    ];
  }

  render() {
    return html` <div class="room-container-inner">
      <div class="icon-label big">
        <ha-icon icon="mdi:thermometer"></ha-icon>
        <div id="${this.id}-temp-is">
          <span></span>
          <span class="unit">°C</span>
        </div>
      </div>
      <div class="icon-label">
        <ha-icon icon="mdi:water"></ha-icon>
        <div id="${this.id}-humidity-is">
          <span></span>
          <span class="unit">%</span>
        </div>
      </div>
    </div>`;
  }
  updated() {
    super.updated();
    [
      ["temp-is", "temperatur_gewachshaus_temperature"],
      ["humidity-is", "temperatur_gewachshaus_humidity"],
    ].forEach(([el, entity]) =>
      setInnerNumeric(
        this.renderRoot,
        `#${this.id}-${el} span`,
        this.hass.states[`sensor.${entity}`].state
      )
    );

    const g = this.panel.renderRoot.querySelector("#gewachshausShape");
    if (g) {
      g.classList.toggle(
        "text-pulse-glow",
        this.hass.states["sensor.temperatur_gewachshaus_temperature"].state > 40
      );
    }
  }
}
customElements.define("room-gewachshaus", Gewachshaus);
