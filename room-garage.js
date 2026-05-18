import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";

export class Garage extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = ["binary_sensor.garagentor"];
    this.addEventListener("click", this._click);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this._click);
  }

  _click() {
    const state = this.hass.states["binary_sensor.garagentor"].state;
    const btn = state !== "on" ? "garagentor_offnen" : "garagentor_schliessen";
    this.hass.callService("button", "press", {
      entity_id: `button.${btn}`,
    });
  }

  static get styles() {
    return css`
      .garage-blade {
        width: 100%;
        height: 5px;
        margin-top: 5px;
        background-color: var(--polar-light-gray);
      }
      .garage-blade-open {
        background-color: var(--aurora-red);
        // animation: blink 1s infinite alternate;
        margin-top: 1px;
      }
    `;
  }

  render() {
    return html`
      <div class="garage-blade"></div>
      <div class="garage-blade"></div>
      <div class="garage-blade"></div>
      <div class="garage-blade"></div>
      <div class="garage-blade"></div>
      <div class="garage-blade"></div>
      <div class="garage-blade"></div>
    `;
  }

  updated() {
    super.updated();

    const state = this.hass.states["binary_sensor.garagentor"].state;
    this.querySelectorAll(`.garage-blade`).forEach((el, idx) => {
      el.classList.toggle("garage-blade-open", state === "on");
      el.classList.toggle("hidden", idx > 3 && state === "on");
    });
  }
}
customElements.define("room-garage", Garage);
