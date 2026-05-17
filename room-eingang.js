import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";

const helpers = await window.loadCardHelpers();

export class Eingang extends Room {
  async firstUpdated() {
    super.firstUpdated();

    const card = await helpers.createCardElement({
      type: "button",
      entity: "switch.mini_aussenbeleuchtung_nord",
      icon: "mdi:coach-lamp-variant",
      show_state: false,
      show_name: false,
      card_mod: {
        style: ":host ha-state-icon {width: 100%; height: 100%;}",
      },
    });
    card.hass = this.hass;
    this._cards["card"] = card;
    await this.requestUpdate();
  }

  render() {
    if (!this._cards) {
      return html``;
    }
    return html`
      <div
        style="
        position: absolute; 
        right: 0; 
        width: 50px;
        transform: scaleX(-1);
      "
      >
        ${this._cards["card"]}
      </div>
    `;
  }
}
customElements.define("room-eingang", Eingang);
