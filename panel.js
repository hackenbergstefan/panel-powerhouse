import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@3/lit-element.js?module";

import "./bgimage.js";
import "./spark-bar.js";
import "./plasmaflow.js";
import { HouseBackground } from "./bgimage.js";
import { Room } from "./room.js";
import { Climate } from "./room-climate.js";
import "./room-heizung.js";
import "./room-gewachshaus.js";
import "./room-pvbars.js";
import { PvBar } from "./room-pvbars.js";
import "./room-eingang.js";
import { Batterie } from "./room-batterie.js";
import "./room-luftung.js";
import { Wetterstation } from "./room-wetterstation.js";
import "./room-strom.js";
import "./room-clock.js";
import "./room-mull.js";
import { Garage } from "./room-garage.js";
import { Ugburo } from "./room-ugburo.js";
import { StromHausAnimation, StromNow } from "./room-strom.js";
import "./room-awning.js";

class TabletPanel extends LitElement {
  static get properties() {
    return {
      _backgroundReady: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._backgroundReady = false;
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

    console.log("connected");

    const viewport = document.head.querySelector('meta[name="viewport"]');
    const innerWidth = window.innerWidth;
    const meta = `width=device-width, initial-scale=${
      innerWidth / 2400
    }, minimum-scale=${
      innerWidth / 2400
    }, maximum-scale=0.75, user-scalable=no`;
    if (viewport) {
      viewport.setAttribute("content", meta);
    } else {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      viewport.content = meta;
      document.head.appendChild(viewport);
    }
    document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("ha-drawer")
      .setAttribute("style", "--ha-sidebar-width: 0");
  }

  static get cssContainers() {
    return css`
      .icon-label {
        display: grid;
        grid-template-columns: 35px auto;
        height: fit-content;
        --mdc-icon-size: 0.9em;
        justify-content: flex-start;
        align-items: flex-start;
        margin-bottom: 7px;
      }
      .icon-label ha-icon {
        margin-top: -0.1ex;
      }
      .big ha-icon {
        margin-left: -0.2em;
      }
    `;
  }

  static get cssShortcuts() {
    return css`
      .hidden {
        display: none !important;
      }
    `;
  }

  static get cssAnimations() {
    return css`
      @keyframes spin {
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes blink {
        to {
          opacity: 0;
        }
      }
      @keyframes scale {
        to {
          transform: scale(1.5);
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
      @keyframes pulse-glow {
        to {
          filter: box-shadow(0 0 10px var(--glow-color));
        }
      }
      .pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite alternate;
      }
    `;
  }

  static get cssStyles() {
    return css`
      .box-shadow {
        box-shadow: 2px 2px 8px 2px #00000050;
      }

      .big {
        font-size: 1.8em;
      }

      .unit {
        font-size: 50%;
        margin-top: 1px;
        vertical-align: super;
      }
    `;
  }

  static get styles() {
    return [
      css`
        html,
        body,
        :host {
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        :host {
          z-index: 1;
          font-size: 22px;
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
      `,
      TabletPanel.cssContainers,
      TabletPanel.cssShortcuts,
      TabletPanel.cssStyles,
      TabletPanel.cssAnimations,
      HouseBackground.styles,
      Room.styles,
      Climate.styles,
      PvBar.styles,
      Batterie.styles,
      Wetterstation.styles,
      Garage.styles,
      Ugburo.styles,
      StromNow.styles,
      StromHausAnimation.styles,
    ];
  }
  render() {
    const bg = html`<house-background
      svgpath="local/powerhouse/bgimage.svg"
      @background-ready=${() => {
        this._backgroundReady = true;
      }}
    ></house-background>`;
    if (!this.hass || !this._backgroundReady) {
      return bg;
    }
    return [
      bg,
      html`<room-clock .panel=${this} .hass=${this.hass}></room-clock>`,
      ...[
        "ogbad",
        "ogschlafzimmer",
        "ogkind1",
        "ogkind2",
        "egbad",
        "egwohnzimmer",
        "egkuche",
        "egflur",
        "egburo",
        "ughobby",
      ].map(
        (id) =>
          html`<room-climate
            .panel=${this}
            .hass=${this.hass}
            id="${id}"
            class="pulse-glow"
          ></room-climate>`,
      ),
      html`<room-heizung
        .panel=${this}
        .hass=${this.hass}
        id="heizung"
        class="pulse-glow-yellow"
      ></room-heizung>`,
      html`<room-heizungboiler
        .panel=${this}
        .hass=${this.hass}
        id="heizungboiler"
      ></room-heizungboiler>`,
      html`<room-gewachshaus
        .panel=${this}
        .hass=${this.hass}
        id="gewachshaus"
      ></room-gewachshaus>`,
      ...["garage", "ost", "west"].map(
        (id) =>
          html`<room-pvbar
            .panel=${this}
            .hass=${this.hass}
            id="pv${id}"
          ></room-pvbar>`,
      ),
      html`<room-eingang
        .panel=${this}
        .hass=${this.hass}
        id="eingang"
      ></room-eingang>`,
      html`<room-batterie
        .panel=${this}
        .hass=${this.hass}
        id="batterie"
      ></room-batterie>`,
      html`<room-luftung
        .panel=${this}
        .hass=${this.hass}
        id="luftung"
      ></room-luftung>`,
      html`<room-wetterstation
        .panel=${this}
        .hass=${this.hass}
        id="wetterstation"
      ></room-wetterstation>`,
      html`<room-ugburo
        .panel=${this}
        .hass=${this.hass}
        id="ugburo"
      ></room-ugburo>`,
      html`<room-stromverteilung
        .panel=${this}
        .hass=${this.hass}
        id="stromverteilung"
      ></room-stromverteilung>`,
      html`<room-stromverteilung2
        .panel=${this}
        .hass=${this.hass}
        id="stromverteilung2"
      ></room-stromverteilung2>`,
      html`<room-stromnutzung
        .panel=${this}
        .hass=${this.hass}
        id="stromnutzung"
      ></room-stromnutzung>`,
      html`<room-strom-now
        .panel=${this}
        .hass=${this.hass}
        id="stromug"
      ></room-strom-now>`,
      html`<room-strom-now
        .panel=${this}
        .hass=${this.hass}
        id="stromeg"
      ></room-strom-now>`,
      html`<room-strom-now
        .panel=${this}
        .hass=${this.hass}
        id="stromog"
      ></room-strom-now>`,
      html`<room-strom-now
        .panel=${this}
        .hass=${this.hass}
        id="stromgarage"
      ></room-strom-now>`,
      html`<room-strom-total-now
        .panel=${this}
        .hass=${this.hass}
        id="stromverteilunginfo"
      ></room-strom-total-now>`,
      html`<room-strom-total-now
        .panel=${this}
        .hass=${this.hass}
        id="stromnutzunginfo"
      ></room-strom-total-now>`,
      html`<room-mull .panel=${this} .hass=${this.hass} id="mull"></room-mull>`,
      html`<room-garage
        .panel=${this}
        .hass=${this.hass}
        id="garage"
      ></room-garage>`,
      html`<room-strom-haus-animation
        .panel=${this}
        .hass=${this.hass}
        .haus=${this.renderRoot.querySelector("#haus").cloneNode(true)}
      ></room-strom-haus-animation>`,
      html`<room-awning
        .panel=${this}
        .hass=${this.hass}
        .icon=${this.renderRoot.querySelector("#markise").cloneNode(true)}
        id="markiseost"
        awning="ost"
      ></room-awning>`,
      html`<room-awning
        .panel=${this}
        .hass=${this.hass}
        .icon=${this.renderRoot.querySelector("#markise").cloneNode(true)}
        id="markisewest"
        awning="west"
      ></room-awning>`,
      html`<room-pv-today
        .panel=${this}
        .hass=${this.hass}
        id="pvtoday"
      ></room-pv-today>`,
    ];
  }
}
customElements.define("tablet-panel", TabletPanel);
