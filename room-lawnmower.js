import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { prettyDuration } from "./helper.js";

export class Lawnmower extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = ["lawn_mower.kleines_getwerk_lawn_mower"];
  }

  static get styles() {
    return css`
      .icon-lawnmower {
        mask-image: url("local/powerhouse/lawnmower.svg");
        mask-repeat: no-repeat;
        position: absolute;
        width: 100px;
        height: 50px;
      }
      .lawnmower-mowing {
        background: var(--aurora-green);
      }
      .lawnmower-docked {
        background: var(--polar-light-gray);
      }
    `;
  }

  render() {
    return html`
    <div
      id="${this.id}-icon"
      class="icon-lawnmower"
            @click=${this._clickMoreInfo}
    </div>`;
  }

  _clickMoreInfo() {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: "lawn_mower.kleines_getwerk_lawn_mower" },
        bubbles: true,
        composed: true,
      }),
    );
  }

  updated() {
    super.updated();
    const lawn_mower =
      this.hass.states["lawn_mower.kleines_getwerk_lawn_mower"];
    console.log("lawn_mower", lawn_mower);
    this.querySelector(`#${this.id}-icon`).className =
      `icon-lawnmower lawnmower-${lawn_mower.state}`;
  }
}
customElements.define("room-lawnmower", Lawnmower);
