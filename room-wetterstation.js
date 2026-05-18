import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

const helpers = await window.loadCardHelpers();

export class Wetterstation extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "sensor.hmip_swo_pl_00181d89a75413_temperatur",
      "sensor.hmip_swo_pl_00181d89a75413_luftfeuchtigkeit",
      "sensor.hmip_swo_pl_00181d89a75413_beleuchtungsstarke",
      "sensor.hmip_swo_pl_00181d89a75413_windgeschwindigkeit",
      "sensor.wettersensor_temperatur_max_taglich",
      "sensor.wettersensor_temperatur_min_taglich",
    ];
  }

  async firstUpdated() {
    super.firstUpdated();

    const el = this.renderRoot.querySelector("#wetterstation-graph");
    const card = await helpers.createCardElement({
      type: "custom:plotly-graph",
      entities: [
        {
          entity: "sensor.hmip_swo_pl_00181d89a75413_luftfeuchtigkeit",
          fill: "tozeroy",
          line: { width: 1, color: "#81a1c1" },
        },
        {
          entity: "sensor.hmip_swo_pl_00181d89a75413_temperatur",
          fill: "tozeroy",
          line: { width: 2, color: "#8fbcbb" },
          yaxis: "y2",
        },
        {
          entity: "sensor.hmip_swo_pl_00181d89a75413_beleuchtungsstarke",
          fill: "tozeroy",
          line: { width: 2, color: "#d8dee9" },
          yaxis: "y3",
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
          b: 15,
          r: 0,
        },
        yaxis: {
          showgrid: false,
          showticklabels: false,
          zeroline: false,
          showline: false,
          title: "",
          // fixedrange: false,
          // range: [0, 100],
        },
        yaxis2: {
          showgrid: false,
          showticklabels: true,
          zeroline: false,
          showline: false,
          title: "",
          overlaying: "y",
          // fixedrange: false,
          // range: [0, 100],
        },
        yaxis3: {
          showgrid: false,
          showticklabels: true,
          zeroline: false,
          showline: false,
          title: "",
          overlaying: "y",
          // fixedrange: false,
          // range: [0, 100],
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
    this._cards["wetterstation-graph"] = card;
    await this.requestUpdate();
  }

  static get styles() {
    return css`
      #wetterstation-graph {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
      }
      #wetterstation .icon-label {
        grid-template-columns: 25px auto;
      }
    `;
  }

  render() {
    this.classList.add("box-shadow");
    if (!this._cards) {
      return html``;
    }
    return html`
      <div class="room-container-inner">
        <div style="margin-left: 0px">
          <div class="icon-label big">
            <ha-icon icon="mdi:thermometer"></ha-icon>
            <div id="${this.id}-temp-is">
              <span></span>
              <span class="unit">°C</span>
            </div>
          </div>
          <div class="icon-label">
            <ha-icon icon="mdi:white-balance-sunny"></ha-icon>
            <div id="${this.id}-illumination">
              <span></span>
              <span class="unit">lx</span>
            </div>
          </div>
          <div class="icon-label">
            <ha-icon icon="mdi:water"></ha-icon>
            <div id="${this.id}-humidity-is">
              <span></span>
              <span class="unit">%</span>
            </div>
          </div>
          <div class="icon-label">
            <ha-icon icon="mdi:wind-turbine"></ha-icon>
            <div id="${this.id}-wind">
              <span></span>
              <span class="unit">km/h</span>
            </div>
          </div>
        </div>
        <div style="position: absolute; top: 0; right: 0;">
          <div class="icon-label">
            <ha-icon icon="mdi:thermometer-chevron-up"></ha-icon>
            <div id="${this.id}-temp-max">
              <span></span>
              <span class="unit">°C</span>
            </div>
          </div>
          <div class="icon-label">
            <ha-icon icon="mdi:thermometer-chevron-down"></ha-icon>
            <div id="${this.id}-temp-min">
              <span></span>
              <span class="unit">°C</span>
            </div>
          </div>
        </div>
      </div>
      <div id="${this.id}-graph"></div>
    `;
  }

  updated() {
    super.updated();
    [
      ["temp-is", "temperatur"],
      ["illumination", "beleuchtungsstarke"],
      ["humidity-is", "luftfeuchtigkeit"],
      ["wind", "windgeschwindigkeit"],
    ].forEach(([id, entity]) =>
      setInnerNumeric(
        this.renderRoot,
        `#${this.id}-${id} span`,
        this.hass.states[`sensor.hmip_swo_pl_00181d89a75413_${entity}`].state
      )
    );
    setInnerNumeric(
      this.renderRoot,
      `#${this.id}-temp-max span`,
      this.hass.states["sensor.wettersensor_temperatur_max_taglich"].state
    );
    setInnerNumeric(
      this.renderRoot,
      `#${this.id}-temp-min span`,
      this.hass.states["sensor.wettersensor_temperatur_min_taglich"].state
    );
  }
}
customElements.define("room-wetterstation", Wetterstation);
