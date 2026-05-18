import {
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { setInnerNumeric } from "./helper.js";

const helpers = await window.loadCardHelpers();

const climateEntities = {
  ogbad: {
    climate: "climate.hmip_sthd_000ea0c9999128",
    valve: "number.hmip_falmot_c12_001ba2699cca62_level_ch1",
    window: "binary_sensor.bthome_sensor_9bbe_window",
  },
  ogschlafzimmer: {
    climate: "climate.hmip_sthd_000ea0c9999117",
    valve: "number.hmip_falmot_c12_001ba2699cca62_level_ch4",
  },
  ogkind1: {
    climate: "climate.hmip_sthd_000ea0c9999126",
    valve: "number.hmip_falmot_c12_001ba2699cca62_level_ch2",
  },
  ogkind2: {
    climate: "climate.hmip_sthd_000ea0c999910a",
    valve: "number.hmip_falmot_c12_001ba2699cca62_level_ch3",
  },
  egbad: {
    climate: "climate.hmip_sthd_000e9be99677bf",
    valve: "number.hmip_falmot_c12_001b9be9a04a8c_level_ch2",
    window: "binary_sensor.fenster_eg_bad_window",
  },
  egwohnzimmer: {
    climate: "climate.hmip_sthd_000e9be9967562",
    valve: "number.hmip_falmot_c12_001b9be9a04a8c_level_ch6",
    window: "binary_sensor.bthome_sensor_67af_window",
  },
  egkuche: {
    climate: "climate.hmip_sthd_000e9be9967564",
    valve: "number.hmip_falmot_c12_001b9be9a04a8c_level_ch5",
  },
  egflur: {
    climate: "climate.hmip_sthd_000e9be996750d",
    valve: "number.hmip_falmot_c12_001b9be9a04a8c_level_ch4",
    light: "switch.shelly_mini3_eg_flur",
  },
  egburo: {
    climate: "climate.hmip_sthd_000e9be9967562",
    valve: "number.hmip_falmot_c12_001b9be9a04a8c_level_ch3",
    window: "binary_sensor.fenster_eg_buro_window",
  },
  ughobby: {
    climate: "climate.hmip_sthd_000ea0c9999105",
    valve: "number.hmip_falmot_c12_001b9be9a04a8c_level_ch10",
  },
};

export class Climate extends Room {
  connectedCallback() {
    super.connectedCallback();
    this._updateEntities = Object.values(climateEntities[this.id]);
  }

  async firstUpdated() {
    await super.firstUpdated();
    const light = climateEntities[this.id].light;
    if (light) {
      const card = await helpers.createCardElement({
        type: "button",
        entity: light,
        icon: "mdi:lightbulb",
        show_state: false,
        show_name: false,
        card_mod: {
          style: ":host ha-state-icon {width: 100%; height: 100%;}",
        },
      });
      console.log(this.id, card);
      this._cards["light"] = card;
      this.requestUpdate();
    }
  }

  _clickMoreInfo() {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: climateEntities[this.id].climate },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    this.classList.add("box-shadow");
    return [
      html` <div class="room-container-inner" @click=${this._clickMoreInfo}>
        <div class="icon-label big">
          <ha-icon icon="mdi:thermometer"></ha-icon>
          <div id="${this.id}-temp-is">
            <span></span>
            <span class="unit">°C</span>
          </div>
        </div>
        <div class="icon-label">
          <ha-icon icon="mdi:thermometer-auto"></ha-icon>
          <div id="${this.id}-temp">
            <span></span>
            <span class="unit">°C</span>
          </div>
        </div>
        <div class="icon-label">
          <ha-icon icon="mdi:valve"></ha-icon>
          <div id="${this.id}-valve">
            <span></span>
            <span class="unit">%</span>
          </div>
        </div>
        <div class="icon-label">
          <ha-icon icon="mdi:water"></ha-icon>
          <div id="${this.id}-humidity-is">
            <span></span>
            <span class="unit">%</span>
          </div>
        </div>
      </div>`,
      html`
        <div
          id="${this.id}-heatingbar"
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
      `,
      climateEntities[this.id].window
        ? html`
            <div class="room-window-container" id="${this.id}-window">
              <ha-icon
                class="icon-window-closed"
                icon="mdi:window-closed-variant"
              ></ha-icon>
              <ha-icon
                class="icon-window-opened"
                icon="mdi:window-open-variant"
              ></ha-icon>
            </div>
          `
        : html``,
      climateEntities[this.id].light
        ? html`<div class="light">${this._cards["light"]}</div>`
        : html``,
    ];
  }

  static get styles() {
    return css`
      .icon-window-opened {
        color: var(--aurora-red);
        animation: blink 1s infinite alternate;
      }
      .icon-window-closed {
        color: var(--polar-light-gray);
      }
      .room-window-container {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 50px;
        height: 50px;
      }
      .room-window-container ha-icon {
        --mdc-icon-size: 100%;
      }
      .light {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 50px;
        z-index: 1;
      }
    `;
  }

  updated() {
    super.updated();

    const climate = this.hass.states[climateEntities[this.id].climate];
    setInnerNumeric(
      this.renderRoot,
      `#${this.id}-temp-is span`,
      climate.attributes.current_temperature
    );
    setInnerNumeric(
      this.renderRoot,
      `#${this.id}-temp span`,
      climate.attributes.temperature
    );
    setInnerNumeric(
      this.renderRoot,
      `#${this.id}-humidity-is span`,
      climate.attributes.current_humidity
    );

    // Valve
    {
      const valve = this.hass.states[climateEntities[this.id].valve].state;
      setInnerNumeric(this.renderRoot, `#${this.id}-valve span`, valve);
      const heatingbar = this.renderRoot.querySelector(
        `#${this.id}-heatingbar`
      );
      if (heatingbar) {
        heatingbar.style.backgroundColor = `rgba(208, 135, 112, ${
          valve / 100
        })`;
        const sparkbar = heatingbar.querySelector("spark-bar");
        sparkbar.setAttribute("active", valve > 0);
        sparkbar.setAttribute("sparks", Math.round(valve));
      }
    }

    // Window
    if (climateEntities[this.id].window) {
      const windowState =
        this.hass.states[climateEntities[this.id].window].state;
      this.renderRoot
        .querySelector(".icon-window-opened")
        .classList.toggle("hidden", windowState !== "on");
      this.renderRoot
        .querySelector(".icon-window-closed")
        .classList.toggle("hidden", windowState === "on");
    }
  }
}

customElements.define("room-climate", Climate);
