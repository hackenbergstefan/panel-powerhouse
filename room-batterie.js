import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

const helpers = await window.loadCardHelpers();

export class Batterie extends Room {
  static get styles() {
    return css`
      #batterie-icon-1,
      #batterie-icon-2,
      #batterie-icon-3,
      #batterie-icon-4 {
        fill: var(--aurora-green);
      }

      #batterie-graph {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 50%;
      }
    `;
  }
  render() {
    this.classList.add("box-shadow");
    return html`
      <div class="room-container-inner">
        <div class="icon-label big">
          <ha-icon icon="mdi:flash"></ha-icon>
          <div id="${this.id}-power">
            <span></span>
            <span class="unit">W</span>
          </div>
        </div>
        <div class="icon-label big">
          <ha-icon icon="mdi:battery"></ha-icon>
          <div id="${this.id}-level">
            <span></span>
            <span class="unit">%</span>
          </div>
        </div>
        <div class="icon-label">
          <ha-icon icon="mdi:thermometer"></ha-icon>
          <div id="${this.id}-temp">
            <span></span>
            <span class="unit">°C</span>
          </div>
        </div>
      </div>
      <div id="batterie-graph"></div>
    `;
  }

  async firstUpdated() {
    await super.firstUpdated();

    const el = this.querySelector("#batterie-graph");
    const card = await helpers.createCardElement({
      type: "custom:plotly-graph",
      color_scheme: ["#5e81ac"],
      entities: [
        {
          entity: "sensor.goodwe_battery_state_of_charge",
          name: "PV",
          fill: "tozeroy",
          line: { width: 2 },
        },
      ],
      hours_to_show: "current_day",
      config: {
        displayModeBar: false,
      },
      layout: {
        height: el.clientHeight,
        font: {
          size: 10,
        },
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        legend: { visible: false },
        title: {
          pad: {
            t: 0,
            l: 0,
            b: 0,
            r: 0,
          },
        },
        margin: {
          t: 0,
          l: 0,
          b: 5,
          r: 0,
        },
        yaxis: {
          showgrid: true,
          showticklabels: false,
          zeroline: false,
          showline: false,
          tick0: 0,
          dtick: 25,
          title: "",
          fixedrange: true,
          range: [0, 100],
        },
        xaxis: {
          showgrid: false,
          showticklabels: false,
          zeroline: false,
          showline: false,
          ticks: "",
          fixedrange: true,
        },
      },
    });
    el.appendChild(card);
    this._cards["batterie-graph"] = card;
    await this.requestUpdate();
  }

  updated() {
    super.updated();

    const level =
      this.hass.states["sensor.goodwe_battery_state_of_charge"].state;
    setInnerNumeric(this.renderRoot, "#batterie-level span", level);
    setInnerNumeric(
      this.renderRoot,
      "#batterie-power span",
      this.hass.states["sensor.goodwe_battery_power"].state,
      { decimal: 0 }
    );
    setInnerNumeric(
      this.renderRoot,
      "#batterie-temp span",
      this.hass.states["sensor.goodwe_battery_temperature"].state
    );

    const batterieIcons = [1, 2, 3, 4].map((i) =>
      this.renderRoot.querySelector(`#batterie-icon-${i}`)
    );
    batterieIcons.forEach((el, idx) => {
      if (!el) return;
      el.classList.toggle("hidden", load < (idx - 1) * 25);
    });
  }
}
customElements.define("room-batterie", Batterie);
