import { html } from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";

const helpers = await window.loadCardHelpers();

export class Awning extends Room {
  static get properties() {
    return {
      awning: { type: String },
      icon: { type: Object },
      ...Room.properties,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [`cover.shelly_markise_${this.awning}`];
  }

  render() {
    return html`<svg
      style="position: absolute; left:0; top: 0; width: 100%; height: 100%;"
      @click=${this._clickMoreInfo}
    >
      ${this.icon}
    </svg>`;
  }

  _clickMoreInfo() {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: `cover.shelly_markise_${this.awning}` },
        bubbles: true,
        composed: true,
      })
    );
  }

  updated() {
    super.updated();
    const state = this.hass.states[`cover.shelly_markise_${this.awning}`].state;
    this.renderRoot
      .querySelector("svg path")
      .style.setProperty(
        "fill",
        state == "open" ? "var(--aurora-orange)" : "var(--polar-light-gray)"
      );
  }
}

customElements.define("room-awning", Awning);
