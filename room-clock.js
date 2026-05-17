import { html } from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";

const helpers = await window.loadCardHelpers();

export class Clock extends Room {
  async firstUpdated() {
    super.firstUpdated();

    const card = await helpers.createCardElement({
      type: "clock",
      clock_style: "digital",
      clock_size: "medium",
      show_seconds: false,
      no_background: true,
      face_style: "markers",
    });
    this._cards["clock"] = card;
    this.appendChild(card);
    await this.requestUpdate();
  }

  updated() {
    super.updated();
    this.style.left = "0";
    this.style.top = "0";
    this.style.width = "100%";
  }
}

customElements.define("room-clock", Clock);
