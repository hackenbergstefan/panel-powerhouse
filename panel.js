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
import { Car } from "./room-car.js";
import { Lawnmower } from "./room-lawnmower.js";

class TabletPanel extends LitElement {
  static get properties() {
    return {
      _backgroundReady: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._backgroundReady = false;
    this._pollInterval = 30000;
    this._pollTimer = null;
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

    this._updateScale();
    this._viewport = document.head.querySelector('meta[name="viewport"]');
    this._origViewport = this._viewport?.getAttribute("content");
    this._viewport?.setAttribute(
      "content",
      "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes",
    );
    this._resizeObserver = new ResizeObserver(() => this._updateScale());
    this._resizeObserver.observe(this);
    this._drawer = document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("ha-drawer");
    this._origDrawerStyle = this._drawer.getAttribute("style");
    this._drawer.setAttribute("style", "--ha-sidebar-width: 0");

    this._setupPolling();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    if (this._drawer) {
      if (this._origDrawerStyle === null) {
        this._drawer.removeAttribute("style");
      } else {
        this._drawer.setAttribute("style", this._origDrawerStyle);
      }
      this._drawer = null;
    }
    if (this._origViewport) {
      this._viewport?.setAttribute("content", this._origViewport);
    }
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  _updateScale() {
    const w = this.clientWidth || window.innerWidth;
    const h = this.clientHeight || window.innerHeight;
    this.style.setProperty("--stage-scale", Math.min(w / 2400, h / 1600));
  }

  _setupPolling() {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._pollTimer = setInterval(() => {
      const now = Date.now();
      this.requestUpdate();
    }, this._pollInterval);
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
        animation: text-pulse-glow 2s steps(10) infinite alternate;
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

      .red {
        color: var(--aurura-red);
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

          --stage-scale: 1;
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
      css`
        #stage {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2400px;
          height: 1600px;
          transform: translate(-50%, -50%) scale(var(--stage-scale));
          transform-origin: center center;
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
      Car.styles,
      Lawnmower.styles,
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
      return html`<div id="stage">${bg}</div>`;
    }
    return html`<div id="stage">${[
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
          ></room-climate>`,
      ),
      html`<room-heizung
        .panel=${this}
        .hass=${this.hass}
        id="heizung"
      ></room-heizung>`,
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
        .haus=${(this._hausClone ??= this.renderRoot
          .querySelector("#haus")
          .cloneNode(true))}
      ></room-strom-haus-animation>`,
      html`<room-awning
        .panel=${this}
        .hass=${this.hass}
        .icon=${(this._markiseOst ??= this.renderRoot
          .querySelector("#markise")
          .cloneNode(true))}
        id="markiseost"
        awning="ost"
      ></room-awning>`,
      html`<room-awning
        .panel=${this}
        .hass=${this.hass}
        .icon=${(this._markiseWest ??= this.renderRoot
          .querySelector("#markise")
          .cloneNode(true))}
        id="markisewest"
        awning="west"
      ></room-awning>`,
      html`<room-pv-today
        .panel=${this}
        .hass=${this.hass}
        id="pvtoday"
      ></room-pv-today>`,
      html`<room-car .panel=${this} .hass=${this.hass} id="car"></room-car>`,
      html`<room-lawnmower
        .panel=${this}
        .hass=${this.hass}
        id="lawnmower"
      ></room-lawnmower>`,
    ]}</div>`;
  }
}
customElements.define("tablet-panel", TabletPanel);
