import {
  LitElement,
  html,
  css,
  render,
} from "https://unpkg.com/lit-element@3.3.2/lit-element.js?module";

import { loadBgImage, roomPositions, svgCss } from "./bgimage.js";
import "./water-tank.js";
import "./spark-bar.js";
import "./plasmaflow.js";
const helpers = await window.loadCardHelpers();

function currentDay() {
  const now = new Date();
  const yyyymmdd = now.toISOString().split("T")[0];
  const startOfDay = `${yyyymmdd} 00:00:00`;
  const endOfDay = `${yyyymmdd} 23:59:59`;
  return [startOfDay, endOfDay];
}

function plotlyDefaultConfig(yrange, height = 70) {
  return {
    hours_to_show: "current_day",
    config: {
      displayModeBar: false,
    },
    layout: {
      height: height,
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
        b: 0,
        r: 0,
      },
      yaxis: {
        showgrid: false,
        showticklabels: false,
        zeroline: false,
        showline: false,
        ticks: "",
        title: "",
        fixedrange: true,
        range: yrange,
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
  };
}

class TabletPanel extends LitElement {
  setInnerNumeric(element, value, decimal = 1) {
    if (typeof element === "string") {
      element = this.renderRoot.querySelector(element);
    }
    if (!element) {
      // console.log("setInnerNumeric: element undefined.");
      return;
    }
    element.innerHTML = parseFloat(value).toFixed(decimal);
  }
  getPrevIcon(element) {
    return element.parentElement.previousElementSibling.firstElementChild;
  }
  toggleClassElementAndIcon(element, cls, condition) {
    element.parentElement.classList.toggle(cls, condition);
    this.getPrevIcon(element).classList.toggle(cls, condition);
  }
  clickMoreInfo(entityId) {
    return () => {
      this.dispatchEvent(
        new CustomEvent("hass-more-info", {
          detail: { entityId: entityId },
          bubbles: true,
          composed: true,
        })
      );
    };
  }
  renderHeatingBar(room) {
    return html`
      <div
        id="${room}-heatingbar"
        style="
          width: 100%; 
          height: 5px; 
          position: absolute; 
          bottom: 0;
        "
      >
        <spark-bar
          color="var(--aurora-orange)"
          colorGlow="var(--aurora-red)"
          drift="20"
        ></spark-bar>
      </div>
    `;
  }

  renderClimate(room) {
    return html`
      <div class="primary container-icon-left">
        <ha-icon icon="mdi:thermometer"></ha-icon>
      </div>
      <div class="primary">
        <span id="${room}-temp-is"></span>
        <span class="span-unit">°C</span>
      </div>
      <div class="container-icon-left">
        <ha-icon icon="mdi:thermometer-auto"></ha-icon>
      </div>
      <div>
        <span id="${room}-temp"></span>
        <span class="span-unit">°C</span>
      </div>
      <div class="container-icon-left">
        <ha-icon icon="mdi:valve"></ha-icon>
      </div>
      <div>
        <span id="${room}-valve"></span>
        <span class="span-unit">%</span>
      </div>
      <div class="container-icon-left">
        <ha-icon icon="mdi:water"></ha-icon>
      </div>
      <div>
        <span id="${room}-humidity-is"></span>
        <span class="span-unit">%</span>
      </div>
    `;
  }

  updateClimate(room, climateEntity, valveEntity = undefined) {
    const climate = this.hass.states[climateEntity];
    const elTempIs = this.shadowRoot.querySelector(`#${room}-temp-is`);
    this.setInnerNumeric(elTempIs, climate.attributes.current_temperature);
    this.toggleClassElementAndIcon(
      elTempIs,
      "cold",
      climate.attributes.current_temperature < climate.attributes.temperature
    );

    this.setInnerNumeric(`#${room}-temp`, climate.attributes.temperature);
    this.setInnerNumeric(
      `#${room}-humidity-is`,
      climate.attributes.current_humidity
    );
    if (valveEntity) {
      const valve = this.hass.states[valveEntity].state;
      const el = this.shadowRoot.querySelector(`#${room}-valve`);
      this.setInnerNumeric(el, valve);
      // this.toggleClassElementAndIcon(el, "text-pulse-glow", valve > 0);
      const heatingbar = this.shadowRoot.querySelector(`#${room}-heatingbar`);
      if (heatingbar) {
        heatingbar.style.backgroundColor = `rgba(208, 135, 112, ${
          valve / 100
        })`;
        const sparkbar = heatingbar.querySelector("spark-bar");
        sparkbar.setAttribute("active", valve > 0);
        sparkbar.setAttribute("sparks", Math.round(valve));
      }
    }
  }

  renderWindow(room) {
    return html`
      <div class="room-window-container" id="${room}-window">
        <ha-icon
          class="icon-window-closed"
          icon="mdi:window-closed-variant"
        ></ha-icon>
        <ha-icon
          class="icon-window-opened"
          icon="mdi:window-open-variant"
        ></ha-icon>
      </div>
    `;
  }

  updateWindow(room, windowEntity) {
    const roomElement = this.shadowRoot.querySelector(`#room-${room}`);
    const window = this.hass.states[windowEntity];
    const elWindowClosed = roomElement.querySelector(".icon-window-closed");
    const elWindowOpened = roomElement.querySelector(".icon-window-opened");
    if (window.state == "on") {
      elWindowClosed.classList.add("hidden");
      elWindowOpened.classList.remove("hidden");
    } else {
      elWindowClosed.classList.remove("hidden");
      elWindowOpened.classList.add("hidden");
    }
  }

  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    const viewport = document.head.querySelector('meta[name="viewport"]');
    const innerWidth = window.innerWidth;
    const meta = `width=device-width, initial-scale=${
      innerWidth / 2000
    }, minimum-scale=${
      innerWidth / 2000
    }, maximum-scale=0.75, user-scalable=no`;
    if (viewport) {
      viewport.setAttribute("content", meta);
    } else {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      viewport.content = meta;
      document.head.appendChild(viewport);
    }
  }

  async firstUpdated() {
    this.cards = {};

    this.bgimage = await loadBgImage();
    const container = this.renderRoot.querySelector("#background-svg");
    container?.appendChild(this.bgimage);

    const totalWidth = container.clientWidth;
    const totalHeight = (totalWidth * 3) / 5;
    for (const roomid in roomPositions) {
      const roomEl = this.renderRoot.querySelector(`#room-${roomid}`);
      if (!roomEl) continue;
      const pos = roomPositions[roomid];
      roomEl.style.left = `${pos.x * totalWidth}px`;
      roomEl.style.top = `${pos.y * totalHeight}px`;
      roomEl.style.width = `${pos.w * totalWidth}px`;
      roomEl.style.height = `${pos.h * totalHeight}px`;
    }

    document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("ha-drawer")
      .shadowRoot.querySelector("aside")
      .setAttribute("style", "display:none");

    {
      const clock = this.renderRoot.querySelector("#clock");
      const card = await helpers.createCardElement({
        type: "clock",
        clock_style: "digital",
        clock_size: "medium",
        show_seconds: false,
        no_background: true,
        face_style: "markers",
      });
      this.cards["clock"] = card;
      clock?.appendChild(card);
    }

    await this.initEgFlur();
    await this.initStromverteilung();
    await this.initStromverteilung2();
    await this.initStromnutzung();
    await this.initEingang();
    await this.initBatterie();
    await this.initWetterstation();
  }

  updated(changedProperties) {
    // UG
    this.updateHeizung();
    this.updateBatterie();
    this.updateLuftung();
    this.updateUgBuro();
    this.updateUgHobby();
    // EG
    this.updateEgBad();
    this.updateEgWohnzimmer();
    this.updateEgKuche();
    this.updateEgBuro();
    this.updateEgFlur();
    // OG
    this.updateOgBad();
    this.updateOgSchlafzimmer();
    this.updateOgKind1();
    this.updateOgKind2();

    // Other
    this.updateStromverteilung();
    this.updateStromverteilung2();
    this.updateZisterne();
    this.updatePvBars();
    this.updateStromnutzung();
    this.updateGewachshaus();
    this.updateEingang();
    this.updateHeizungBoiler();
    this.updateStrom();
    this.updateWetterstation();
    this.updateGarage();

    super.updated(changedProperties);
    if (!changedProperties.has("hass") || !this.cards) {
      return;
    }

    for (const card in this.cards) {
      this.cards[card].hass = this.hass;
    }
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return [
      html`<div id="background-svg"></div>
        <div id="clock"></div>`,
      // UG
      this.renderHeizung(),
      this.renderBatterie(),
      this.renderLuftung(),
      this.renderUgBuro(),
      this.renderUgHobby(),
      // EG
      this.renderEgBad(),
      this.renderEgWohnzimmer(),
      this.renderEgKuche(),
      this.renderEgFlur(),
      this.renderEgBuro(),
      // OG
      this.renderOgBad(),
      this.renderOgSchlafzimmer(),
      this.renderOgKind1(),
      this.renderOgKind2(),

      // Other
      this.renderStromverteilung(),
      this.renderStromverteilung2(),
      this.renderZisterne(),
      this.renderPvBars(),
      this.renderStromnutzung(),
      this.renderGewachshaus(),
      this.renderEingang(),
      this.renderHeizungBoiler(),
      this.renderStrom(),
      this.renderWetterstation(),
      this.renderGarage(),
    ];
  }

  static get styles() {
    return css`
      html,
      body,
      :host {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }
      :host {
        z-index: 1;
        font-size: 20px;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;

        --mdc-icon-size: 100%;
        --aurora-red: #bf616a;
        --aurora-blue: #5e81ac;
        --aurora-green: #a3be8c;
        --aurora-yellow: #ebcb8b;
        --aurora-orange: #d08770;
        --aurora-pink: #b48ead;
        --frost-green: #8fbcbb;
        --frost-sky-blue: #88c0d0;
        --frost-cadet-blue: #81a1c1;
        --frost-steel-blue: #5e81ac;
        --snow-dark: #d8dee9;
        --snow-medium: #e5e9f0;
        --snow-light: #eceff4;
        --polar-dark-gray: #2e3440;
        --polar-bright-gray: #3b4252;
        --polar-river-gray: #434c5e;
        --polar-light-gray: #4c566a;

        --ha-card-background: none;
        --ha-card-border-width: 0;
        --ha-card-border-radius: 0;

        --primary-text-color: var(--snow-light);
        --secondary-text-color: var(--snow-light);
        color: var(--primary-text-color);

        --state-inactive-color: var(--snow-dark);
        --state-icon-color: var(--snow-dark);
        --state-switch-active-color: var(--aurora-orange);
        --state-active-color: var(--aurora-orange);
      }

      .hidden {
        display: none !important;
      }

      @keyframes blink {
        to {
          opacity: 0;
        }
      }

      @keyframes cold {
        to {
          filter: drop-shadow(0 0 5px var(--frost-steel-blue));
        }
      }

      @keyframes text-pulse-glow {
        to {
          filter: drop-shadow(0 0 10px var(--aurora-orange));
          color: var(--aurora-orange);
        }
      }
      .text-pulse-glow {
        animation: text-pulse-glow 2s infinite alternate;
      }

      #background-svg {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: -99;
      }

      .room-container {
        position: absolute;
        z-index: -2;
      }

      .box-shadow {
        box-shadow: 2px 2px 8px 2px #00000050;
      }

      .room-container-inner {
        position: absolute;
        z-index: 1;
        top: 10px;
        left: 10px;
        bottom: 10px;
        right: 10px;
      }

      .room-window-container {
        position: absolute;
        top: 0;
        right: 0;
        width: 50px;
        height: 50px;
      }
      .room-window-container ha-icon {
        --mdc-icon-size: 100%;
      }
      .icon-window-opened {
        color: var(--aurora-red);
        animation: blink 1s infinite alternate;
      }
      .icon-window-closed {
        color: var(--polar-light-gray);
      }

      .primary {
        display: inline-block;
        font-size: 1.7em;
      }
      .primary ha-icon {
        --mdc-icon-size: 0.8em;
        margin-left: -6px;
      }

      ha-icon {
        --mdc-icon-size: 0.9em;
        color: var(--state-icon-color);
      }

      .container-icon-left {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: -0.15em;
      }

      .span-unit {
        font-size: 50%;
        margin-top: 1px;
        vertical-align: super;
      }

      .primary .span-unit {
        margin-left: 0;
      }

      .grid {
        position: absolute;
        display: grid;
        grid-template-columns: 1.5em auto;
        grid-auto-flow: dense;
        grid-gap: 7px 0;
        height: fit-content;
      }

      .ok {
        color: var(--aurora-green);
      }
      .cold {
        font-weight: bold;
        animation: cold 1s infinite alternate;
      }

      .room-light {
        position: absolute;
        width: 50px;
        height: 50px;
        top: 0;
        right: 0;
      }

      .pvbar-value {
        bottom: 3px;
        position: absolute;
        font-weight: 700;
        font-size: 0.7em;
        color: var(--primary-text-color);
      }

      .aurora-green {
        color: var(--aurora-green);
      }
      .bold {
        font-weight: 700;
      }

      .padding-5 {
        padding: 5px;
      }

      #room-stromGarage,
      #room-stromUg,
      #room-stromEg,
      #room-stromOg {
        display: flex;
        align-items: center;
      }

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

      @keyframes spin {
        100% {
          transform: rotate(360deg);
        }
      }

      #room-stromverteilungInfo .room-container-inner,
      #room-stromnutzungInfo .room-container-inner {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
        font-size: 2em;
        font-weight: 700;
      }
      #room-stromverteilungInfo {
        color: var(--aurora-green);
      }
      #room-stromnutzungInfo {
        color: var(--aurora-yellow);
      }

      #room-stromverteilungInfo ha-icon,
      #room-stromnutzungInfo ha-icon {
        --mdc-icon-size: 30px;
        color: unset;
      }

      #room-stromnutzungInfo .room-container-inner {
        align-items: end;
      }

      #garage-icon,
      #garage-icon-open,
      #garage-icon-unknown {
        --mdc-icon-size: 100%;
      }

      #wetterstation-graph {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50px;
      }

      #ugburo-icon {
        margin-top: 20px;
        --mdc-icon-size: 120px;
        color: var(--polar-river-gray);
        z-index: -1;
      }

      ${svgCss}
    `;
  }

  renderHeizung() {
    const room = "heizung";
    return html`<div id="room-${room}" class="room-container box-shadow">
      <div class="room-container-inner">
        <div class="grid">
          <div class="primary container-icon-left">
            <ha-icon icon="mdi:flash"></ha-icon>
          </div>
          <div class="primary">
            <span id="${room}-power"></span>
            <span class="span-unit">W</span>
          </div>
          <div class="primary container-icon-left">
            <ha-icon icon="mdi:water-boiler"></ha-icon>
          </div>
          <div class="primary">
            <span id="${room}-speicherist"></span>
            <span class="span-unit">°C</span>
          </div>
          <div class="primary container-icon-left">
            <ha-icon icon="mdi:heating-coil"></ha-icon>
          </div>
          <div class="primary">
            <span id="${room}-vorlaufist"></span>
            <span class="span-unit">°C</span>
          </div>
          <ha-icon icon="mdi:backup-restore"></ha-icon>
          <div>
            <span id="${room}-rucklaufist"></span>
            <span class="span-unit">°C</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  updateHeizung() {
    const room = "heizung";
    this.setInnerNumeric(
      `#${room}-power`,
      this.hass.states["sensor.shelly_heizung_total_active_power"].state
    );
    this.setInnerNumeric(
      `#${room}-speicherist`,
      this.hass.states["sensor.heizung_speicheristtemp"].state
    );
    {
      const el = this.renderRoot.querySelector(`#${room}-vorlaufist`);
      this.setInnerNumeric(
        el,
        this.hass.states["sensor.heizung_wpvorlaufist"].state
      );
      // Glow if heizung is on
      this.toggleClassElementAndIcon(
        el,
        "text-pulse-glow",
        this.hass.states["sensor.shelly_heizung_total_active_power"].state >
          1000
      );
    }

    this.setInnerNumeric(
      `#${room}-rucklaufist`,
      this.hass.states["sensor.heizung_ruecklaufisttemp"].state
    );
  }

  renderUgHobby() {
    const room = "ughobby";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000ea0c9999105")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
      </div>
    </div>`;
  }

  updateUgHobby() {
    const room = "ughobby";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000ea0c9999105",
      "number.hmip_falmot_c12_001b9be9a04a8c_level_ch10"
    );
  }

  renderEgBad() {
    const room = "egbad";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000e9be99677bf")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
        ${this.renderWindow(room)}
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateEgBad() {
    const room = "egbad";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000e9be99677bf",
      "number.hmip_falmot_c12_001b9be9a04a8c_level_ch2"
    );
    this.updateWindow(room, "binary_sensor.fenster_eg_bad_window");
  }

  renderEgWohnzimmer() {
    const room = "egwohnzimmer";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000e9be9967562")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
        ${this.renderWindow(room)}
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateEgWohnzimmer() {
    const room = "egwohnzimmer";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000e9be9967562",
      "number.hmip_falmot_c12_001b9be9a04a8c_level_ch6"
    );
    this.updateWindow(room, "binary_sensor.bthome_sensor_67af_window");
  }

  renderEgKuche() {
    const room = "egkuche";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000e9be9967564")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateEgKuche() {
    const room = "egkuche";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000e9be9967564",
      "number.hmip_falmot_c12_001b9be9a04a8c_level_ch5"
    );
  }

  async initEgFlur() {
    const card = await helpers.createCardElement({
      type: "button",
      entity: "switch.shelly_mini3_eg_flur",
      icon: "mdi:lightbulb",
      show_state: false,
      show_name: false,
      card_mod: {
        style: ":host ha-state-icon {width: 100%; height: 100%;}",
      },
    });
    card.hass = this.hass;
    this.renderRoot.querySelector("#egflur-light").appendChild(card);
    this.cards["egflur-light"] = card;
  }

  renderEgFlur() {
    const room = "egflur";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000e9be996750d")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
        <div id="${room}-light" class="room-light"></div>
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateEgFlur() {
    const room = "egflur";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000e9be996750d",
      "number.hmip_falmot_c12_001b9be9a04a8c_level_ch4"
    );
  }

  renderEgBuro() {
    const room = "egburo";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000e9be9967562")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
        ${this.renderWindow(room)}
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateEgBuro() {
    const room = "egburo";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000e9be9967562",
      "number.hmip_falmot_c12_001b9be9a04a8c_level_ch3"
    );
    this.updateWindow(room, "binary_sensor.fenster_eg_buro_window");
  }

  renderOgBad() {
    const room = "ogbad";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000ea0c9999128")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
        ${this.renderWindow(room)}
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateOgBad() {
    const room = "ogbad";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000ea0c9999128",
      "number.hmip_falmot_c12_001ba2699cca62_level_ch1"
    );
    this.updateWindow(room, "binary_sensor.bthome_sensor_9bbe_window");
  }

  renderOgSchlafzimmer() {
    const room = "ogschlafzimmer";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000ea0c9999117")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateOgSchlafzimmer() {
    const room = "ogschlafzimmer";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000ea0c9999117",
      "number.hmip_falmot_c12_001ba2699cca62_level_ch2"
    );
  }

  renderOgKind1() {
    const room = "ogkind1";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000ea0c9999126")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateOgKind1() {
    const room = "ogkind1";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000ea0c9999126",
      "number.hmip_falmot_c12_001ba2699cca62_level_ch3"
    );
  }

  renderOgKind2() {
    const room = "ogkind2";
    return html`<div
      id="room-${room}"
      class="room-container box-shadow"
      @click="${this.clickMoreInfo("climate.hmip_sthd_000ea0c999910a")}"
    >
      <div class="room-container-inner">
        <div class="grid">${this.renderClimate(room)}</div>
      </div>
      ${this.renderHeatingBar(room)}
    </div>`;
  }

  updateOgKind2() {
    const room = "ogkind2";
    this.updateClimate(
      room,
      "climate.hmip_sthd_000ea0c999910a",
      "number.hmip_falmot_c12_001ba2699cca62_level_ch4"
    );
  }

  renderStromverteilung2() {
    return html`<div id="room-stromverteilung2" class="room-container"></div>`;
  }

  async initStromverteilung2() {
    const el = this.renderRoot.querySelector("#room-stromverteilung2");
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
    this.cards["stromverteilung2-graph"] = card;
  }
  updateStromverteilung2() {}

  async initStromverteilung() {
    const el = this.renderRoot.querySelector("#room-stromverteilung");
    // Define strict start and end of the current day
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
    el.appendChild(card);
    this.cards["stromverteilung-graph"] = card;
  }
  renderStromverteilung() {
    return html`<div id="room-stromverteilung" class="room-container"></div>`;
  }
  updateStromverteilung() {
    this.setInnerNumeric(
      "#stromverteilung-total-now",
      this.hass.states["sensor.goodwe_house_consumption"].state
    );
  }

  renderZisterne() {
    return html`<div id="room-zisterne" class="room-container">
      <water-tank></water-tank>
    </div>`;
  }
  updateZisterne() {}

  renderPvBars() {
    return html`<div id="room-pvgarage" class="room-container">
        <div class="pvbar-value">
          <span></span><span>W</span>
        </div>
        <spark-bar
          aspectRatio="0.1"
          color="var(--aurora-yellow)"
          colorGlow="var(--aurora-yellow)"
          size="10"
          invertDriftDirection="true"
          drift="20"
        ></spark-bar>
      </div>
      <div
        id="room-pvwest"
        class="room-container"
        style="transform: rotate(18deg);"
      >
        <div class="pvbar-value">
          <span></span><span>W</span>
        </div>
        <spark-bar
          aspectRatio="0.1"
          color="var(--aurora-yellow)"
          colorGlow="var(--aurora-yellow)"
          size="10"
          invertDriftDirection="true"
          drift="20"
        ></spark-bar>
      </div>
      <div
        id="room-pvost"
        class="room-container"
        style="transform: rotate(18deg);"
      >
        <div class="pvbar-value">
          <span></span><span>W</span>
        </div>
        <spark-bar
          aspectRatio="0.1"
          color="var(--aurora-yellow)"
          colorGlow="var(--aurora-yellow)"
          size="10"
          invertDriftDirection="true"
          drift="20"
        ></spark-bar>
      </div>
    </div>`;
  }
  updatePvBars() {
    const powers = [1, 2, 3].map(
      (i) => this.hass.states[`sensor.goodwe_mppt${i}_power`].state
    );
    ["west", "ost", "garage"].forEach((id, idx) => {
      const bar = this.renderRoot.querySelector(`#room-pv${id}`);
      bar.style.backgroundColor = `rgba(235, 203, 139, ${powers[idx] / 1000})`;
      const sparks = Math.round(
        (powers[idx] / 1e4) ** 1.5 * bar.clientWidth * 5
      );
      bar.querySelector("spark-bar").setAttribute("sparks", sparks);
      this.setInnerNumeric(bar.querySelector("span"), powers[idx]);
    });
  }

  renderStromnutzung() {
    return html`<div id="room-stromnutzung" class="room-container"></div>`;
  }
  async initStromnutzung() {
    const el = this.renderRoot.querySelector("#room-stromnutzung");
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
      height: el.clientHeight,
      layout: {
        font: {
          size: 10,
        },
        height: el.clientHeight,
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
          l: 30,
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
    el.appendChild(card);
    this.cards["stromnutzung-graph"] = card;
  }
  updateStromnutzung() {}

  renderGewachshaus() {
    const room = "gewachshaus";
    return html`<div id="room-${room}" class="room-container">
      <div class="room-container-inner">
        <div class="grid">
          <div class="primary container-icon-left">
            <ha-icon icon="mdi:thermometer"></ha-icon>
          </div>
          <div class="primary">
            <span id="${room}-temp-is"></span>
            <span class="span-unit">°C</span>
          </div>
          <div class="primary container-icon-left">
            <ha-icon icon="mdi:water"></ha-icon>
          </div>
          <div class="primary">
            <span id="${room}-humidity-is"></span>
            <span class="span-unit">%</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  updateGewachshaus() {
    const room = "gewachshaus";
    this.setInnerNumeric(
      this.shadowRoot.querySelector(`#${room}-temp-is`),
      this.hass.states["sensor.temperatur_gewachshaus_temperature"].state
    );
    this.setInnerNumeric(
      this.shadowRoot.querySelector(`#${room}-humidity-is`),
      this.hass.states["sensor.temperatur_gewachshaus_humidity"].state
    );
  }

  renderEingang() {
    const room = "eingang";
    return html`<div id="room-${room}" class="room-container">
      <div
        style="
        position: absolute; 
        right: 0; 
        width: 50px;
        transform: scaleX(-1);
      "
      ></div>
    </div>`;
  }

  async initEingang() {
    const card = await helpers.createCardElement({
      type: "button",
      entity: "switch.mini_aussenbeleuchtung_nord",
      icon: "mdi:coach-lamp-variant",
      show_state: false,
      show_name: false,
      card_mod: {
        style: ":host ha-state-icon {width: 100%; height: 100%;}",
      },
    });
    card.hass = this.hass;
    this.renderRoot
      .querySelector("#room-eingang")
      .firstElementChild.appendChild(card);
    this.cards["eingang-light"] = card;
  }
  updateEingang() {}

  renderHeizungBoiler() {
    return html`
      <div id="room-heizungboiler" class="room-container">
        <plasma-flow
          style="
          width: 100%; 
          height: 100%; 
          position: absolute;
          border-radius: 10px;
          overflow: hidden;
          background-color: var(--polar-dark-gray);
          "
        >
        </plasma-flow>
      </div>
    `;
  }

  updateHeizungBoiler() {
    const activity =
      this.hass.states["sensor.shelly_heizung_total_active_power"].state / 1000;
    this.renderRoot
      .querySelector("#room-heizungboiler")
      .querySelector("plasma-flow")
      .setAttribute("activity", activity);
  }

  renderStrom() {
    return ["Ug", "Eg", "Og", "Garage"]
      .map(
        (id) =>
          html`
            <div id="room-strom${id}" class="room-container">
              <div class="grid aurora-green padding-5">
                <div class="primary container-icon-left">
                  <ha-icon
                    class="aurora-green"
                    style="margin-top: 0; margin-left: 2px;"
                    icon="mdi:lightning-bolt"
                  ></ha-icon>
                </div>
                <div class="primary stromvalue bold">
                  <span></span
                  ><span style="font-size: 50%; vertical-align: super;">
                    W</span
                  >
                </div>
              </div>
            </div>
          `
      )
      .concat([
        html`<div id="room-stromnutzungInfo" class="room-container">
          <div class="room-container-inner">
            <ha-icon icon="mdi:solar-power-variant"></ha-icon>
            <div>
              <span id="stromnutzungInfo-power"></span
              ><span class="span-unit">W</span>
            </div>
            <div style="font-size: 0.5em;">
              <span>max</span>
              <span id="stromnutzungInfo-power-max"></span
              ><span class="span-unit">W</span>
            </div>
          </div>
        </div>`,
        html`<div id="room-stromverteilungInfo" class="room-container">
          <div class="room-container-inner">
            <ha-icon icon="mdi:flash"></ha-icon>
            <div>
              <span id="stromverteilungInfo-power"></span
              ><span class="span-unit">W</span>
            </div>
          </div>
        </div>`,
      ]);
  }

  updateStrom() {
    [
      ["Ug", "shelly_keller_total_active_power"],
      ["Eg", "shelly_eg_total_active_power"],
      ["Og", "shelly3em63g3_b08184e0b6e0_total_active_power"],
      ["Garage", "shelly_garage_total_active_power"],
    ].forEach(([floor, entity]) => {
      this.setInnerNumeric(
        `#room-strom${floor} .stromvalue span`,
        this.hass.states[`sensor.${entity}`].state,
        { decimal: 0 }
      );
    });

    [
      ["verteilung", "goodwe_load"],
      ["nutzung", "goodwe_pv_power"],
    ].forEach(([id, entity]) => {
      this.setInnerNumeric(
        `#strom${id}Info-power`,
        this.hass.states[`sensor.${entity}`].state,
        { decimal: 0 }
      );
    });
    this.setInnerNumeric(
      `#stromnutzungInfo-power-max`,
      this.hass.states["sensor.pv_power_max_taglich"].state,
      { decimal: 0 }
    );
  }

  renderBatterie() {
    const room = "batterie";
    return html`
      <div id="room-batterie" class="room-container box-shadow">
        <div class="room-container-inner">
          <div class="grid">
            <div class="primary container-icon-left">
              <ha-icon icon="mdi:flash"></ha-icon>
            </div>
            <div class="primary">
              <span id="${room}-power"></span>
              <span class="span-unit">W</span>
            </div>
            <div class="primary container-icon-left">
              <ha-icon icon="mdi:battery"></ha-icon>
            </div>
            <div class="primary">
              <span id="${room}-load"></span>
              <span class="span-unit">%</span>
            </div>
            <div class="container-icon-left">
              <ha-icon icon="mdi:thermometer"></ha-icon>
            </div>
            <div>
              <span id="${room}-temp"></span>
              <span class="span-unit">°C</span>
            </div>
          </div>
        </div>
        <div id="batterie-graph"></div>
      </div>
    `;
  }

  async initBatterie() {
    const el = this.renderRoot.querySelector("#room-batterie #batterie-graph");
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
      height: el.clientHeight,
      layout: {
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
    this.cards["batterie-graph"] = card;
  }
  updateBatterie() {
    const load =
      this.hass.states["sensor.goodwe_battery_state_of_charge"].state;
    this.setInnerNumeric("#batterie-load", load, { decimal: 0 });
    this.setInnerNumeric(
      "#batterie-power",
      this.hass.states["sensor.goodwe_battery_power"].state,
      { decimal: 0 }
    );
    this.setInnerNumeric(
      "#batterie-temp",
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

  renderLuftung() {
    const room = "luftung";
    return html`
      <div id="room-${room}" class="room-container box-shadow">
        <div class="room-container-inner">
          <div class="grid">
            <div class="primary container-icon-left">
              <ha-icon icon="mdi:thermometer"></ha-icon>
            </div>
            <div class="primary">
              <span id="${room}-temp"></span>
              <span class="span-unit">°C</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateLuftung() {
    const climate = this.hass.states["climate.blauberg_s21"];
    const temp = climate.attributes.current_temperature;
    this.setInnerNumeric("#luftung-temp", temp);
    const lufter = this.renderRoot.querySelector("#lufter");
    if (lufter) {
      const duration = { low: 10, medium: 5, high: 3 }[
        climate.attributes.fan_mode
      ];
      lufter.style.animation = `spin ${duration}s linear infinite`;
    }
  }

  async initWetterstation() {
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
    this.cards["wetterstation-graph"] = card;
  }

  renderWetterstation() {
    const room = "wetterstation";
    return html`
      <div id="room-${room}" class="room-container box-shadow">
        <div class="room-container-inner">
          <div class="grid" style="margin-left: 5px">
            <div class="primary container-icon-left">
              <ha-icon icon="mdi:thermometer"></ha-icon>
            </div>
            <div class="primary">
              <span id="${room}-temp-is"></span>
              <span class="span-unit">°C</span>
            </div>

            <div class="container-icon-left">
              <ha-icon icon="mdi:white-balance-sunny"></ha-icon>
            </div>
            <div>
              <span id="${room}-illumination"></span>
              <span class="span-unit">lx</span>
            </div>

            <div class="container-icon-left">
              <ha-icon icon="mdi:water"></ha-icon>
            </div>
            <div>
              <span id="${room}-humidity-is"></span>
              <span class="span-unit">%</span>
            </div>

            <div class="container-icon-left">
              <ha-icon icon="mdi:wind-turbine"></ha-icon>
            </div>
            <div>
              <span id="${room}-wind"></span>
              <span class="span-unit">km/h</span>
            </div>
          </div>
          <div class="grid" style="right: 0;">
            <div class="container-icon-left">
              <ha-icon icon="mdi:thermometer-chevron-up"></ha-icon>
            </div>
            <div>
              <span id="${room}-temp-max"></span>
              <span class="span-unit">°C</span>
            </div>
            <div class="container-icon-left">
              <ha-icon icon="mdi:thermometer-chevron-down"></ha-icon>
            </div>
            <div>
              <span id="${room}-temp-min"></span>
              <span class="span-unit">°C</span>
            </div>
          </div>
        </div>
        <div id="${room}-graph"></div>
      </div>
    `;
  }
  updateWetterstation() {
    const room = "wetterstation";
    [
      ["temp-is", "temperatur"],
      ["illumination", "beleuchtungsstarke"],
      ["humidity-is", "luftfeuchtigkeit"],
      ["wind", "windgeschwindigkeit"],
    ].forEach(([id, entity]) =>
      this.setInnerNumeric(
        `#${room}-${id}`,
        this.hass.states[`sensor.hmip_swo_pl_00181d89a75413_${entity}`].state
      )
    );
    this.setInnerNumeric(
      `#${room}-temp-max`,
      this.hass.states["sensor.wettersensor_temperatur_max_taglich"].state
    );
    this.setInnerNumeric(
      `#${room}-temp-min`,
      this.hass.states["sensor.wettersensor_temperatur_min_taglich"].state
    );
  }

  renderGarage() {
    const room = "garage";
    return html`<div id="room-${room}" class="room-container">
      <ha-icon icon="mdi:garage-variant" id="${room}-icon"></ha-icon>
      <ha-icon icon="mdi:garage-open-variant" id="${room}-icon-open"></ha-icon>
      <ha-icon icon="mdi:help-box" id="${room}-icon-unknown"></ha-icon>
    </div>`;
  }

  updateGarage() {
    const room = "garage";
    const state = this.hass.states["binary_sensor.garagentor"].state;

    this.renderRoot
      .querySelector(`#${room}-icon`)
      .classList.toggle("hidden", state !== "off");
    this.renderRoot
      .querySelector(`#${room}-icon-open`)
      .classList.toggle("hidden", state !== "on");
    this.renderRoot
      .querySelector(`#${room}-icon-unknown`)
      .classList.toggle("hidden", state !== "unknown");
  }

  renderUgBuro() {
    const room = "ugburo";
    return html`<div id="room-${room}" class="room-container box-shadow">
      <div class="room-container-inner">
        <div class="grid">
          <div class="container-icon-left">
            <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
          </div>
          <div>
            <span id="${room}-material"></span>
          </div>
          <div class="primary container-icon-left">
            <ha-icon icon="mdi:progress-clock"></ha-icon>
          </div>
          <div class="primary">
            <span id="${room}-progress"></span>
            <span class="span-unit">%</span>
          </div>
        </div>
        <div
          style="
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;"
        >
          <ha-icon icon="mdi:printer-3d-nozzle" id="${room}-icon"></ha-icon>
        </div>
      </div>
    </div>`;
  }

  updateUgBuro() {
    const room = "ugburo";
    const printing = this.hass.states["sensor.schichtwerk"] === "printing";
    this.renderRoot
      .querySelector(`#${room}-icon`)
      .classList.toggle("text-pulse-glow", printing);

    this.renderRoot.querySelector(`#${room}-material`).innerHTML =
      this.hass.states["sensor.schichtwerk_material"].state;

    const progress = this.renderRoot.querySelector(`#${room}-progress`);
    progress.parentElement.classList.toggle("hidden", !printing);
    progress.parentElement.previousElementSibling.classList.toggle(
      "hidden",
      !printing
    );
    progress.innerHTML =
      this.hass.states["sensor.schichtwerk_fortschritt"].state;
  }
}
customElements.define("tablet-panel", TabletPanel);
