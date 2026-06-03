import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import "https://unpkg.com/plotly.js-dist-min@3/plotly.min.js?module";

import { Room } from "./room.js";
import { currentDayJs, setInnerNumeric } from "./helper.js";

export class Batterie extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "sensor.goodwe_battery_state_of_charge",
      "sensor.goodwe_battery_power",
      "sensor.goodwe_battery_temperature",
    ];
  }

  static get styles() {
    return css`
      #batterie-icon-1,
      #batterie-icon-2,
      #batterie-icon-3,
      #batterie-icon-4 {
        fill: var(--aurora-blue);
      }

      #batterie-graph {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 40%;
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

  async _fetchTodayHistory() {
    const [dayStart, _] = currentDayJs();

    try {
      const entity = "sensor.goodwe_battery_state_of_charge";
      const history = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: dayStart,
        entity_ids: [entity],
        significant_changes_only: false,
        no_attributes: true,
      });

      // Extract timestamps and states
      const entityHistory = history[entity] || [];
      const xData = [];
      const yData = [];

      entityHistory.forEach((stateUpdate) => {
        const val = parseFloat(stateUpdate.s); // 's' stands for state in this API schema
        if (!isNaN(val)) {
          // Convert HA timestamp (seconds) to a JavaScript Date object
          xData.push(new Date(stateUpdate.lu * 1000)); // 'lu' is last_updated timestamp
          yData.push(val);
        }
      });

      return { x: xData, y: yData };
    } catch (err) {
      console.error("Failed to fetch Home Assistant history:", err);
      return { x: [], y: [] };
    }
  }

  async firstUpdated() {
    await super.firstUpdated();

    const historyData = await this._fetchTodayHistory();
    const trace = {
      x: historyData.x,
      y: historyData.y,
      mode: "lines",
      line: { color: "#5e81ac", width: 2 },
      fill: "tozeroy",
    };
    const layout = {
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
        range: currentDayJs(),
      },
    };
    const config = { responsive: false, displayModeBar: false };

    const graph = this.querySelector("#batterie-graph");
    Plotly.newPlot(graph, [trace], layout, config);
    this._chartInitialized = true;
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
      this.panel.renderRoot.querySelector(
        `house-background #batterie-icon-${i}`
      )
    );
    batterieIcons.forEach((el, idx) => {
      if (!el) return;
      el.classList.toggle("hidden", level < idx * 25);
    });

    // Update Graph
    if (this._chartInitialized) {
      const graph = this.querySelector("#batterie-graph");
      const now = new Date();
      if (now > graph.layout.xaxis.range[1]) {
        // It's a new day! Reset the layout range and wipe old data to save memory
        const update = {
          x: [[]],
          y: [[]],
        };
        const layoutUpdate = {
          "xaxis.range": currentDayJs(),
        };
        Plotly.update(graph, update, layoutUpdate, [0]);
      }
      const update = {
        x: [[now]],
        y: [[parseFloat(level)]],
      };
      Plotly.extendTraces(graph, update, [0]);
    }
  }
}
customElements.define("room-batterie", Batterie);
