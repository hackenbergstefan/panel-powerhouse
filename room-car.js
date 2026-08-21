import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

export class Car extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = ["sensor.wallbox_ladestatus"];
  }

  static get styles() {
    return css`
      .icon-car {
        mask-image: url("local/powerhouse/car.svg");
        mask-repeat: no-repeat;
        position: absolute;
        width: 150px;
        height: 150px;
        top: 20px;
        right: 20px;
      }
      .car-disconnected {
        background: var(--polar-light-gray);
      }
      .car-connected {
        background: var(--state-icon-color);
      }
      .car-charging {
        background: var(--aurora-green);
      }
    `;
  }

  render() {
    return html`
      <div class="room-container-inner">
        <div id="${this.id}-icon"></div>
      </div>
    `;
  }

  updated() {
    super.updated();

    const wallboxState = this.hass.states["sensor.wallbox_ladestatus"].state;
    const wallboxStates = { A: "disconnected", B: "connected", C: "charging" };
    this.querySelector(`#${this.id}-icon`).className =
      `icon-car car-${wallboxStates[wallboxState]}`;
  }
}
customElements.define("room-car", Car);
