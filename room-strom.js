import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { currentDay, setInnerNumeric } from "./helper.js";

const helpers = await window.loadCardHelpers();

export class Stromverteilung extends Room {
  async firstUpdated() {
    await super.firstUpdated();

    const card = await helpers.createCardElement({
      type: "custom:plotly-graph",
      color_scheme: ["#d08770", "#88c0d0", "#a3be8c", "#b48ead", "#8fbcbb"],
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
          entity: "sensor.shelly_garage_total_active_power",
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
          b: 80,
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
          ],
          labels: ["Heizung", "Keller", "EG", "OG", "Garage"],
          textinfo: "value",
          textposition: "inside",
          texttemplate:
            "<span style='font-size: 0.8em; font-weigth: 700; color: var(--primary-text-color);'>%{value:.0f} kWh</span>",
          hole: 0.65,
          marker: {
            colors: ["#d08770", "#88c0d0", "#a3be8c", "#b48ead", "#8fbcbb"],
          },
          text: "$ex Number(hass.states['sensor.goodwe_today_load'].state) / 1000",
          sort: false,
        },
        {
          entity: "sensor.stromverbrauch_keller_taglich",
          type: "pie",
          domain: { x: [0.2, 0.8], y: [0.2, 0.8] },
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
              "<span style='font-size: 34px; font-weight: 700;'>"
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
        legend: { visible: true, y: 0, orientation: "h", font: { size: 10 } },
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
          size: 10,
        },
        height: this.clientHeight,
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        legend: { visible: true, y: 0 },
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
          b: 20,
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
    stromgarage: "shelly_garage_total_active_power",
  };

  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = [`sensor.${StromNow.mapping[this.id]}`];
  }

  render() {
    const additionalStyle = {
      stromug: "",
      stromeg: "",
      stromog: "",
      stromgarage: "justify-content: center;",
    }[this.id];
    return html`
      <div
        style="
          display: flex;
          align-items: center;
          height: 100%;
          ${additionalStyle}
        "
      >
        <div
          class="icon-label big"
          style="
        color: var(--aurora-green);
        padding-left: 5px;
        grid-template-columns: 25px auto;
        --mdc-icon-size: 0.8em;
      "
        >
          <ha-icon icon="mdi:flash"></ha-icon>
          <div>
            <span></span>
            <span class="unit">W</span>
          </div>
        </div>
      </div>
    `;
  }

  updated() {
    super.updated();

    setInnerNumeric(
      this.renderRoot,
      `#${this.id} span`,
      this.hass.states[`sensor.${StromNow.mapping[this.id]}`].state,
      { decimal: 0 }
    );
  }
}
customElements.define("room-strom-now", StromNow);

export class StromTotalNow extends Room {
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
    },
  };

  connectedCallback() {
    super.connectedCallback();

    const config = StromTotalNow.mapping[this.id];
    this._updateEntities = [`sensor.${config.entityNow}`].concat(
      config.entityMax ? [`sensor.${config.entityMax}`] : []
    );
  }

  render() {
    return html`
      <div
        class="room-container-inner"
        style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-size: 2em;
          ${StromTotalNow.mapping[this.id].style}
      "
      >
        <ha-icon
          style="--mdc-icon-size: 30px;"
          icon="${StromTotalNow.mapping[this.id].icon}"
        ></ha-icon>
        <div><span></span><span class="unit">W</span></div>
        <div id="${this.id}-max" style="font-size: 0.5em;">
          <span>max</span>
          <span></span><span class="unit">W</span>
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
      { decimal: 0 }
    );

    if (StromTotalNow.mapping[this.id].entityMax) {
      setInnerNumeric(
        this.renderRoot,
        this.querySelectorAll(`#${this.id}-max span`)[1],
        this.hass.states[`sensor.${StromTotalNow.mapping[this.id].entityMax}`]
          .state,
        { decimal: 0 }
      );
    } else {
      this.renderRoot
        .querySelectorAll(`#${this.id} div`)[2]
        .classList.add("hidden");
    }
  }
}
customElements.define("room-strom-total-now", StromTotalNow);
