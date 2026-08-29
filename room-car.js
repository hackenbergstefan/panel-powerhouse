import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

export class Car extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "sensor.wallbox_ladestatus",
      "sensor.id_3_pro_performance_battery",
      "sensor.id_3_pro_performance_electric_range",
      "sensor.wallbox_ladeleistung",
    ];
  }

  static get styles() {
    return css`
      .icon-car {
        mask-image: url("local/powerhouse/car.svg");
        mask-repeat: no-repeat;
        width: 180px;
        height: 98px;
        position: absolute;
        top: 20px;
        right: 20px;
      }
      .car-disconnected {
        background: var(--polar-light-gray);
      }
      .car-connected {
        background: var(--state-icon-color);
      }
      @keyframes text-pulse-glow-green {
        to {
          filter: drop-shadow(0 0 10px var(--aurora-green));
        }
      }
      .text-pulse-glow-green {
        animation: text-pulse-glow-green 1s infinite alternate;
        color: var(--aurora-green);
      }
      .car-charging {
        background: var(--aurora-green);
      }
    `;
  }

  render() {
    this.classList.add("box-shadow");
    return html`
      <div class="room-container-inner" style="padding-left: 20px">
        <div id="${this.id}-icon" class="icon-car"></div>
        <div class="icon-label big">
          <ha-icon icon="mdi:battery"></ha-icon>
          <div id="${this.id}-soc">
            <span></span>
            <span class="unit">%</span>
          </div>
        </div>
        <div class="icon-label big">
          <ha-icon icon="mdi:map-marker-distance"></ha-icon>
          <div id="${this.id}-range">
            <span></span>
            <span class="unit">km</span>
          </div>
        </div>
        <div class="icon-label big" style="margin-top: 20px;">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>
          <div id="${this.id}-chargePower">
            <span></span>
            <span class="unit">kW</span>
          </div>
        </div>
      </div>
    `;
  }

  updated() {
    super.updated();

    const plugged =
      this.hass.states["sensor.id_3_pro_performance_plug"].state ===
      "connected";
    const color = plugged ? "aurora-green" : "frost-green";
    const soc = Number(
      this.hass.states["sensor.id_3_pro_performance_battery"].state,
    );
    setInnerNumeric(this.renderRoot, `#${this.id}-soc span`, soc, 0);
    this.querySelector(`#${this.id}-icon`).style.background =
      `linear-gradient(to top, var(--${color}) ${soc}%, var(--polar-light-gray) ${soc}%)`;

    const range =
      this.hass.states["sensor.id_3_pro_performance_electric_range"].state;
    setInnerNumeric(this.renderRoot, `#${this.id}-range span`, range, 0);

    const chargePower =
      Number(this.hass.states["sensor.wallbox_ladeleistung"].state) / 1000;
    setInnerNumeric(
      this.renderRoot,
      `#${this.id}-chargePower span`,
      chargePower,
      0,
    );
    this.querySelector(
      `#${this.id}-chargePower`,
    ).parentElement.classList.toggle("text-pulse-glow-green", chargePower > 0);
  }
}
customElements.define("room-car", Car);
