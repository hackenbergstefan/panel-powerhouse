import { html } from "https://unpkg.com/lit-element@3/lit-element.js?module";
import { Room } from "./room.js";
import { currentDay } from "./helper.js";

const helpers = await window.loadCardHelpers();

export class Mull extends Room {
  static get properties() {
    return {
      mullToday: { type: Array },
      mullTomorrow: { type: Array },
      ...Room.properties,
    };
  }

  updated() {
    super.updated();
  }

  constructor() {
    super();
    this.mullToday = [];
    this.mullTomorrow = [];
    this._unsubCalendar = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._subscribeToCalendar();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubCalendar) {
      this._unsubCalendar();
    }
  }

  async _subscribeToCalendar() {
    if (!this.hass || !this.hass.connection) return;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date();
    endOfTomorrow.setHours(23, 59, 59, 999);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    try {
      this._unsubCalendar = await this.hass.connection.subscribeMessage(
        (message) => {
          this.mullToday =
            message.events
              .filter(
                (event) =>
                  new Date(event.start).setHours(0, 0, 0, 0) ==
                    startOfToday.getTime() && new Date().getHours() < 10
              )
              .map((event) => event.summary.toLowerCase()) || [];
          this.mullTomorrow =
            message.events
              .filter(
                (event) =>
                  new Date(event.start).setHours(0, 0, 0, 0) ==
                  new Date(startOfToday.getDate() + 1).getTime()
              )
              .map((event) => event.summary.toLowerCase()) || [];
        },
        {
          type: "calendar/event/subscribe",
          entity_id: "calendar.mull_2026",
          start: startOfToday,
          end: endOfTomorrow,
        }
      );
    } catch (err) {
      console.error("Failed to subscribe to calendar events:", err);
    }
  }

  render() {
    const keywords = {
      wertstoff: "color: gold;",
      bio: "color: peru;",
      papier: "color: cornflowerblue;",
      restmüll: "color: black;",
      problem: "color: darkorchid;",
    };
    let style = "";
    for (const key in keywords) {
      if (this.mullToday.some((msg) => msg.includes(key))) {
        style = `
          ${keywords[key]} 
          animation: blink 1s ease-in infinite alternate, scale 1s 1s ease-in infinite alternate;
        `;
        break;
      }
      if (this.mullTomorrow.some((msg) => msg.includes(key))) {
        style = keywords[key];
        break;
      }
    }
    return html`<ha-icon
      style="
        position: absolute;
        --mdc-icon-size: 80px;
        bottom: 0;
        ${style}
      "
      class="${!style ? "hidden" : ""}"
      icon="mdi:delete"
    ></ha-icon>`;
  }
}

customElements.define("room-mull", Mull);
