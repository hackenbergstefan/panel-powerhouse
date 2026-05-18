import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

export class HeizungRoom extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "shelly_heizung_total_active_power",
      "heizung_speicheristtemp",
      "heizung_wpvorlaufist",
      "heizung_ruecklaufisttemp",
      "sensor.shelly_heizung_total_active_power",
    ];
  }

  render() {
    this.classList.add("box-shadow");
    return [
      html` <div class="room-container-inner">
        <div class="icon-label big">
          <ha-icon icon="mdi:flash"></ha-icon>
          <div id="${this.id}-power">
            <span></span>
            <span class="unit">W</span>
          </div>
        </div>
        <div class="icon-label">
          <ha-icon icon="mdi:water-boiler"></ha-icon>
          <div id="${this.id}-speicherist">
            <span></span>
            <span class="unit">°C</span>
          </div>
        </div>
        <div class="icon-label">
          <ha-icon icon="mdi:heating-coil"></ha-icon>
          <div id="${this.id}-vorlaufist">
            <span></span>
            <span class="unit">°C</span>
          </div>
        </div>
        <div class="icon-label">
          <ha-icon icon="mdi:backburger"></ha-icon>
          <div id="${this.id}-rucklaufist">
            <span></span>
            <span class="unit">°C</span>
          </div>
        </div>
      </div>`,
    ];
  }

  updated() {
    super.updated();

    [
      ["power", "shelly_heizung_total_active_power"],
      ["speicherist", "heizung_speicheristtemp"],
      ["vorlaufist", "heizung_wpvorlaufist"],
      ["rucklaufist", "heizung_ruecklaufisttemp"],
    ].forEach(([el, entity]) =>
      setInnerNumeric(
        this.renderRoot,
        `#${this.id}-${el} span`,
        this.hass.states[`sensor.${entity}`].state
      )
    );
    this.renderRoot
      .querySelector("#heizung-power")
      .parentElement.classList.toggle(
        "text-pulse-glow",
        this.hass.states["sensor.shelly_heizung_total_active_power"].state >
          1000
      );
  }
}
customElements.define("room-heizung", HeizungRoom);

export class HeizungBoiler extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = ["sensor.shelly_heizung_total_active_power"];
  }

  render() {
    return html`<plasma-flow
      style="
          width: 100%; 
          height: 100%; 
          position: absolute;
          border-radius: 10px;
          overflow: hidden;
          background-color: var(--polar-dark-gray);
          "
    >
    </plasma-flow>`;
  }

  updated() {
    super.updated();
    const activity =
      this.hass.states["sensor.shelly_heizung_total_active_power"].state / 1000;
    this.renderRoot
      .querySelector("plasma-flow")
      .setAttribute("activity", activity);
  }
}

customElements.define("room-heizungboiler", HeizungBoiler);
