import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

const mapping = { pvwest: 1, pvost: 2, pvgarage: 3 };

export class PvBar extends Room {
  static get styles() {
    return css`
      .pvbar-value {
        bottom: 3px;
        position: absolute;
        font-weight: 700;
        font-size: 0.7em;
        color: var(--primary-text-color);
      }
      room-pvbar {
        background-color: var(--polar-river-gray);
      }
      .pvbar-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    `;
  }

  render() {
    return html`
      <div class="pvbar-value"><span></span><span>W</span></div>
      <div class="pvbar-overlay"></div>
      <spark-bar
        aspectRatio="0.1"
        color="var(--aurora-yellow)"
        colorGlow="var(--aurora-yellow)"
        size="10"
        invertDriftDirection="true"
        drift="20"
      ></spark-bar>
    `;
  }
  updated() {
    super.updated();

    if (["pvost", "pvwest"].includes(this.id)) {
      this.style.transform = "rotate(18deg)";
    }

    const power =
      this.hass.states[`sensor.goodwe_mppt${mapping[this.id]}_power`].state;
    this.renderRoot.querySelector(
      ".pvbar-overlay"
    ).style.backgroundColor = `rgba(235, 203, 139, ${power / 1000})`;
    const sparks = Math.round((power / 1e4) ** 1.5 * this.clientWidth * 5);
    this.renderRoot.querySelector("spark-bar").setAttribute("sparks", sparks);
    setInnerNumeric(this.renderRoot, "span", power);
  }
}
customElements.define("room-pvbar", PvBar);
