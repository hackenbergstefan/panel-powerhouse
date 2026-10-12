import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { currentDay, setInnerNumeric } from "./helper.js";

const helpers = await window.loadCardHelpers();

function powerMode(hass) {
  const pv = hass.states["sensor.goodwe_pv_power"].state;
  const bat = hass.states["sensor.goodwe_battery_power"].state;
  const grid = hass.states["sensor.goodwe_active_power"].state;
  if (grid < -200) {
    return "grid";
  } else if (bat > 0) {
    return "bat";
  } else if (pv > 0) {
    return "pv";
  }
  return "unknown";
}

export class Stromverteilung extends Room {
  async firstUpdated() {
    await super.firstUpdated();

    const card = await helpers.createCardElement({
      type: "custom:plotly-graph",
      color_scheme: ["#d08770", "#88c0d0", "#8185c1", "#b48ead", "#8fbcbb", "#a3be8c"],
      entities: [
        {
          entity: "sensor.shelly_heizung_total_active_power",
          fill: "tozeroy",
          line: { width: 2 },
        },
        {
          entity: "sensor.shelly_keller_total_active_power",
          fill: "tozeroy",
          line: { width: 2 },
        },
        {
          entity: "sensor.shelly_eg_total_active_power",
          fill: "tozeroy",
          line: { width: 2 },
        },
        {
          entity: "sensor.shelly3em63g3_b08184e0b6e0_total_active_power",
          fill: "tozeroy",
          line: { width: 2 },
        },
        {
          entity: "sensor.shelly_garage_w_o_wallbox",
          fill: "tozeroy",
          line: { width: 2 },
        },
        {
          entity: "sensor.wallbox_ladeleistung",
          fill: "tozeroy",
          line: { width: 2 },
        },
      ],
      hours_to_show: "current_day",
      config: {
        displayModeBar: false,
      },
      layout: {
        height: this.renderRoot.clientHeight,
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
          b: 130,
          r: 30,
        },
        yaxis: {
          showgrid: true,
          showticklabels: true,
          zeroline: true,
          showline: true,
          side: "right",
          title: "",
          tickformat: ".1s",
        },
        xaxis: {
          showgrid: false,
          showticklabels: false,
          zeroline: false,
          showline: false,
          ticks: "",
          fixedrange: true,
          range: currentDay().reverse(),
        },
      },
    });
    this.renderRoot.appendChild(card);
    this._cards["stromverteilung-graph"] = card;

    this.requestUpdate();
  }
}
customElements.define("room-stromverteilung", Stromverteilung);

export class Stromverteilung2 extends Room {
  async firstUpdated() {
    await super.firstUpdated();

    const el = this.renderRoot;
    const card = await helpers.createCardElement({
      type: "custom:plotly-graph",
      raw_plotly_config: true,
      entities: [
        {
          entity: "sensor.stromverbrauch_keller_taglich",
          domain: { x: [0.1, 0.9], y: [0, 1] },
          type: "pie",
          values: [
            "$ex Number(hass.states['sensor.heizung_verbrauch'].state) / 1000",
            "$ex Number(hass.states['sensor.stromverbrauch_keller_taglich'].state) / 1000",
            "$ex Number(hass.states['sensor.stromverbrauch_eg_taglich'].state) / 1000",
            "$ex Number(hass.states['sensor.stromverbrauch_og_taglich_2'].state) / 1000",
            "$ex Number(hass.states['sensor.stromverbrauch_garage_taglich'].state) / 1000",
            "$ex Number(hass.states['sensor.wallbox_energie_taglich'].state)",
          ],
          labels: ["Heizung", "Keller", "EG", "OG", "Garage", "Wallbox"],
          textinfo: "value",
          textposition: "inside",
          texttemplate:
            "<span style='font-size: 0.9em; font-weigth: 900; color: var(--primary-text-color);'>%{value:.0f}</span>",
          hole: 0.7,
          marker: {
            colors: ["#d08770", "#88c0d0", "#8185c1", "#b48ead", "#8fbcbb", "#a3be8c"],
          },
          text: "$ex Number(hass.states['sensor.goodwe_today_load'].state) / 1000",
          sort: false,
        },
        {
          entity: "sensor.stromverbrauch_keller_taglich",
          type: "pie",
          domain: { x: [0.21, 0.79], y: [0.21, 0.79] },
          values: [
            "$ex Number(hass.states['sensor.goodwe_today_s_pv_generation'].state - hass.states['sensor.goodwe_today_battery_charge'].state) / 1000",
            "$ex Number(hass.states['sensor.goodwe_today_energy_import'].state) / 1000",
            "$ex Number(hass.states['sensor.goodwe_today_battery_discharge'].state) / 1000",
          ],
          labels: ["PV", "Netz", "Batterie"],
          textinfo: "none",
          hole: 0.7,
          marker: {
            colors: ["#ebcb8b", "#bf616a", "#5e81ac"],
          },
          text: "$ex Number(hass.states['sensor.goodwe_today_load'].state) / 1000",
          sort: false,
        },
      ],
      config: {
        displayModeBar: false,
      },
      layout: {
        font: {
          size: 12,
        },
        annotations: [
          {
            text: `$fn ({hass}) =>
              "<span style='font-size: 40px; font-weight: 700;'>"
              + Number(hass.states['sensor.goodwe_today_load'].state).toFixed(1)
              + "</span><br><span style='font-size: 10px;'>kWh</span>"`,
            xref: "paper",
            yref: "paper",
            xanchor: "center",
            yanchor: "center",
            x: 0.5,
            y: 0.5,
            showarrow: false,
          },
        ],
        height: el.clientHeight,
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        legend: { visible: true, y: 0, orientation: "h", font: { size: 13 } },
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
          l: 40,
          b: 80,
          r: 0,
        },
      },
    });
    card.hass = this.hass;
    el.appendChild(card);
    this._cards["stromverteilung2-graph"] = card;
    await this.requestUpdate();
  }
}
customElements.define("room-stromverteilung2", Stromverteilung2);

export class Stromnutzung extends Room {
  async firstUpdated() {
    await super.firstUpdated();

    const card = await helpers.createCardElement({
      type: "custom:plotly-graph",
      color_scheme: ["#ebcb8b", "#5e81ac", "#d08770", "#d8dee9"],
      entities: [
        {
          entity: "sensor.goodwe_pv_power",
          name: "PV",
          fill: "tozeroy",
          line: { width: 1 },
        },
        {
          entity: "sensor.goodwe_battery_power",
          fill: "tozeroy",
          name: "Batterie",
          line: { width: 1 },
        },
        {
          entity: "sensor.goodwe_active_power",
          name: "Netz",
          fill: "tozeroy",
          line: { width: 1 },
          filters: [{ map_y_numbers: "-y" }],
        },
        {
          entity: "sensor.goodwe_house_consumption",
          name: "Haus",
          line: { width: 2, dash: "dot" },
        },
      ],
      hours_to_show: "current_day",
      config: {
        displayModeBar: false,
      },
      layout: {
        font: {
          size: 15,
        },
        height: this.clientHeight,
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        legend: { visible: true, y: -0.1 },
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
          l: 40,
          b: 100,
          r: 0,
        },
        yaxis: {
          showgrid: true,
          showticklabels: true,
          zeroline: true,
          showline: true,
          // ticks: "",
          title: "",
          tickformat: ".1s",
          // fixedrange: true,
          // range: [0, 10000],
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
    this.appendChild(card);
    this._cards["stromnutzung-graph"] = card;
    await this.requestUpdate();
  }
}
customElements.define("room-stromnutzung", Stromnutzung);

export class StromNow extends Room {
  static mapping = {
    stromug: "shelly_keller_total_active_power",
    stromeg: "shelly_eg_total_active_power",
    stromog: "shelly3em63g3_b08184e0b6e0_total_active_power",
    stromgarage: "shelly_garage_w_o_wallbox",
  };

  static get styles() {
    return css`
      .flow-chevron {
        width: 20px;
        height: 30px;
        margin-left: 5px;

        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 3l7 9-7 9M7 3l7 9-7 9'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 3l7 9-7 9M7 3l7 9-7 9'/%3E%3C/svg%3E");
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        position: relative;
        transform: scaleX(-1);
      }

      .flow-chevron::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 120px;
        height: 100%;
        background: linear-gradient(
          to right,
          var(--power-color-transparent) 0%,
          rgba(255, 255, 255, 1) 50%,
          var(--power-color-transparent) 100%
        );
        background-size: 100px 100%;
        will-change: transform;
        animation: chevron-pulse calc(var(--power-animation-duration) / 8) linear
          infinite;
      }

      @keyframes chevron-pulse {
        from {
          transform: translateX(-100px);
        }

        to {
          transform: translateX(0);
        }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      `sensor.${StromNow.mapping[this.id]}`,
      "sensor.goodwe_pv_power",
      "sensor.goodwe_battery_power",
      "sensor.goodwe_active_power",
    ];
  }

  render() {
    const [flipped, additionalStyle] = {
      stromug: [false, ""],
      stromeg: [false, ""],
      stromog: [false, ""],
      stromgarage: [true, ""],
    }[this.id];
    return html`
      <div
        style="
          display: flex;
          gap: 0 10px;
          align-items: center;
          height: 100%;
          background: linear-gradient(to right, transparent, var(--power-color-transparent) 30% 70%, transparent);
          border-top: 4px solid var(--power-color);
          border-bottom: 4px solid var(--power-color);
          border-image: linear-gradient(to right, transparent, var(--power-color) 30% 70%, transparent) 1;
          border-width: 4px 0 4px 0;
          border-style: solid;
          ${flipped ? "justify-content: flex-end;" : "justify-content: flex-start;"}
          ${additionalStyle}
        "
      >
        ${!flipped ? html`<div class="flow-chevron"></div>` : ""}
        <div
          class="big"
          style="
          padding-left: 5px;
        "
        >
          <span></span>
          <span class="unit" style="margin-left:-5px">W</span>
        </div>
        ${flipped ? html`<div style="transform: scaleX(-1);"><div class="flow-chevron"></div></div>` : ""}
      </div>
    `;
  }

  updated() {
    super.updated();

    const power = this.hass.states[`sensor.${StromNow.mapping[this.id]}`].state;
    setInnerNumeric(this.renderRoot, `#${this.id} span`, power, { decimal: 0 });

    const alpha = Math.round(Math.min(power / 3000, 1) * 10) / 10;
    const [color, colorTransparent] = {
      pv: ["rgb(235, 203, 139)", `rgba(235, 203, 139, ${alpha})`],
      bat: ["rgb(94, 129, 172)", `rgba(94, 129, 172, ${alpha})`],
      grid: ["rgb(191, 97, 106)", `rgba(191, 97, 106, ${alpha})`],
      unknown: ["rgb(0,0,0)", `rgba(0,0,0, ${alpha})`],
    }[powerMode(this.hass)];

    // Only write changed values: a changed duration makes the running animation jump.
    const style = this.renderRoot.style;
    const set = (name, value) => {
      if (style.getPropertyValue(name) !== value) style.setProperty(name, value);
    };
    set("--power-color", color);
    set("--power-color-transparent", colorTransparent);
    set(
      "--power-animation-duration",
      `${Math.max(3, Math.round(15 - power / 1000))}s`,
    );
  }
}
customElements.define("room-strom-now", StromNow);

export class StromTotalNow extends Room {
  static get properties() {
    return {
      haus: { type: Object },
      ...Room.properties,
    };
  }

  static mapping = {
    stromverteilunginfo: {
      style: "color: var(--aurora-green);",
      icon: "mdi:flash",
      entityNow: "goodwe_load",
    },
    stromnutzunginfo: {
      style: "color: var(--aurora-yellow); text-align: right;",
      icon: "mdi:solar-power-variant",
      entityNow: "goodwe_pv_power",
      entityMax: "pv_power_max_taglich",
      entityTotal: "goodwe_today_s_pv_generation",
    },
  };

  connectedCallback() {
    super.connectedCallback();

    const config = StromTotalNow.mapping[this.id];
    this._updateEntities = [
      `sensor.${config.entityNow}`,
      `sensor.${config.entityTotal}`,
    ].concat(config.entityMax ? [`sensor.${config.entityMax}`] : []);
  }

  render() {
    return html`
      <div
        class="room-container-inner"
        style="
          display: flex;
          flex-direction: column;
          justify-content: top;
          font-size: 2em;
          ${StromTotalNow.mapping[this.id].style}
      "
      >
        <ha-icon
          style="--mdc-icon-size: 30px; margin-top: 80px;"
          icon="${StromTotalNow.mapping[this.id].icon}"
        ></ha-icon>
        <div><span></span><span class="unit">W</span></div>
        <div id="${this.id}-max" style="font-size: 0.5em;">
          <span>max</span>
          <span></span><span class="unit">W</span>
        </div>
        <div id="${this.id}-total" style="margin-top: auto">
          <div
            style="
            display: inline;
            font-size: 50%;
            margin-right: -3px"
          >
            Σ
          </div>
          <span></span><span class="unit">kWh</span>
        </div>
      </div>
    `;
  }

  updated() {
    super.updated();

    setInnerNumeric(
      this.renderRoot,
      `#${this.id} div span`,
      this.hass.states[`sensor.${StromTotalNow.mapping[this.id].entityNow}`]
        .state,
      { decimal: 0 },
    );

    if (StromTotalNow.mapping[this.id].entityMax) {
      setInnerNumeric(
        this.renderRoot,
        this.querySelectorAll(`#${this.id}-max span`)[1],
        this.hass.states[`sensor.${StromTotalNow.mapping[this.id].entityMax}`]
          .state,
        { decimal: 0 },
      );
    } else {
      this.renderRoot
        .querySelectorAll(`#${this.id} div`)[2]
        .classList.add("hidden");
    }
    if (StromTotalNow.mapping[this.id].entityTotal) {
      setInnerNumeric(
        this.renderRoot,
        this.querySelector(`#${this.id}-total span`),
        this.hass.states[`sensor.${StromTotalNow.mapping[this.id].entityTotal}`]
          .state,
        { decimal: 0 }
      );
    } else {
      this.renderRoot
        .querySelector(`#${this.id}-total`)
        .classList.add("hidden");
    }
  }
}
customElements.define("room-strom-total-now", StromTotalNow);

export class StromHausAnimation extends Room {
  static get properties() {
    return {
      haus: { type: Object },
      ...Room.properties,
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._updateEntities = [
      "sensor.goodwe_pv_power",
      "sensor.goodwe_battery_power",
      "sensor.goodwe_active_power",
    ];
  }

  static get styles() {
    return css`
      @keyframes foo {
        from {
          transform: translateY(-100%);
        }

        to {
          transform: translateY(200%);
        }
      }
      room-strom-haus-animation::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 50%;
        background-image: linear-gradient(
          0deg,
          rgba(255, 0, 0, 0) 0%,
          var(--strom-haus-color) 50%,
          rgba(255, 0, 0, 0) 100%
        );
        will-change: transform;
        animation: foo 5s linear infinite;
        animation-direction: var(--strom-haus-animation-direction);
      }
      room-strom-haus-animation {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        mask: url("#haus-mask");
      }
      room-strom-haus-animation polyline {
        stroke: #ffffff !important;
        stroke-width: 9 !important;
      }
    `;
  }

  render() {
    return html`<svg>
      <defs>
        <mask id="haus-mask">${this.haus}</mask>
      </defs>
    </svg>`;
  }

  updated() {
    super.updated();

    const [color, direction] = {
      pv: ["aurora-yellow", "normal"],
      bat: ["aurora-blue", "reverse"],
      grid: ["aurora-red", "normal"],
    }[powerMode(this.hass)];

    this.renderRoot.style.setProperty(
      "--strom-haus-animation-direction",
      direction,
    );
    this.renderRoot.style.setProperty("--strom-haus-color", `var(--${color})`);
  }
}
customElements.define("room-strom-haus-animation", StromHausAnimation);

export class PVToday extends Room {
  render() {
    return html`<div
      style="
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 110%;
        height: 100%;
        --mdc-icon-size: 25px;
        font-size: 0.85em;
      "
    >
      <ha-icon icon="mdi:transmission-tower-export"></ha-icon>
      <div class="big" style="margin-left: 10px;">
        <span id="pvtoday-import"></span>
        <span class="unit">kWh</span>
      </div>
      <ha-icon
        icon="mdi:transmission-tower-import"
        style="margin-left: 40px;"
      ></ha-icon>
      <div class="big" style="margin-left: 10px;">
        <span id="pvtoday-export"></span>
        <span class="unit">kWh</span>
      </div>
      <div class="big" style="margin-left: 10px;">
        <span id="pvtoday-export-euro"></span>
        <span class="unit">€</span>
      </div>
    </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [
      "sensor.goodwe_meter_today_energy_import",
      "sensor.goodwe_meter_today_energy_export",
    ];
  }

  updated() {
    super.updated();

    const energyImport =
      this.hass.states["sensor.goodwe_meter_today_energy_import"].state;
    this.renderRoot
      .querySelector("#pvtoday-import")
      .classList.toggle("red", energyImport > 10);

    setInnerNumeric(this.renderRoot, `#pvtoday-import`, energyImport, 0);

    const energyExport =
      this.hass.states["sensor.goodwe_meter_today_energy_export"].state;
    setInnerNumeric(this.renderRoot, "#pvtoday-export", energyExport, 0);
    setInnerNumeric(
      this.renderRoot,
      "#pvtoday-export-euro",
      energyExport * 0.0673,
      2
    );
  }
}

customElements.define("room-pv-today", PVToday);
