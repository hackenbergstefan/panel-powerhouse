import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { IDS } from "./bgimage.js";

export class Room extends LitElement {
  static get properties() {
    return {
      panel: { type: Object },
      hass: { type: Object },
      id: { type: String },
      _cards: { type: Object },
    };
  }
  constructor() {
    super();
    this._cards = {};
  }

  createRenderRoot() {
    return this;
  }

  static get styles() {
    return css`
      .room-container {
        position: absolute;
        z-index: -2;
      }
      .room-container-inner {
        position: absolute;
        z-index: 1;
        top: 10px;
        left: 10px;
        bottom: 10px;
        right: 10px;
      }
    `;
  }
  updated() {
    super.updated();

    if (this.id) {
      this.style.left = `${IDS[this.id].x}px`;
      this.style.top = `${IDS[this.id].y}px`;
      this.style.width = `${IDS[this.id].w}px`;
      this.style.height = `${IDS[this.id].h}px`;
    }
    this.classList.add("room-container");

    for (const card in this._cards) {
      this._cards[card].hass = this.hass;
    }
  }

  render() {
    return html``;
  }
}
