import { LitElement, html, css } from "https://unpkg.com/lit@3/index.js?module";

class WaterTank extends LitElement {
  static properties = {
    level: { type: Number },
    label: { type: Boolean },
  };

  constructor() {
    super();

    this.level = 72;
    this.label = true;
  }

  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      display: block;
    }

    * {
      box-sizing: border-box;
    }

    .tank {
      position: relative;
      width: 100%;
      height: 100%;

      overflow: hidden;
    }

    .water {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: calc(var(--level) * 1%);
      transition: height 500ms ease;
      // overflow: hidden;
      background: linear-gradient(
        to bottom,
        var(--frost-cadet-blue),
        var(--frost-steel-blue)
      );

      // box-shadow: inset 0 0 25px rgba(255, 255, 255, 0.12),
      //   0 0 30px rgba(0, 140, 255, 0.3);
    }

    .wave {
      position: absolute;
      left: -50%;
      width: 200%;
      border-radius: 42%;
      background: rgba(136, 192, 208, 0.4);
      animation-name: wave;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-direction: alternate;
    }

    .wave1 {
      top: -2px;
      height: 70px;
      opacity: 0.32;
      animation-duration: 10s;
      animation-direction: alternate;
    }

    .wave2 {
      background: linear-gradient(to bottom, rgba(136, 192, 208, 1) #ffffff00);
      border-radius: 100%;
      top: 0px;
      height: 25px;
      animation-name: wave2;
      animation-iteration-count: infinite;
      animation-duration: 7s;
      animation-direction: alternate;
    }

    .wave3 {
      top: -16px;
      height: 54px;
      opacity: 0.18;
      animation-duration: 1s;
      animation-direction: alternate;
    }

    .wave4 {
      top: -12px;
      height: 48px;
      opacity: 0.14;
      animation-duration: 9s;
      animation-direction: alternate;
    }

    .wave5 {
      top: -8px;
      height: 42px;
      opacity: 0.12;
      animation-duration: 15s;
      animation-direction: alternate;
    }

    .wave6 {
      top: -4px;
      height: 36px;
      opacity: 0.1;
      animation-duration: 11s;
      animation-direction: alternate;
    }

    .label {
      position: absolute;
      bottom: 20px;
      left: 50%;

      transform: translateX(-50%);
      z-index: 5;
      color: var(--snow-light);
      font-weight: 700;
    }

    @keyframes wave {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(30%);
      }
    }

    @keyframes wave2 {
      from {
        transform: scaleY(1);
      }
      to {
        transform: scaleY(1.3);
      }
    }
  `;

  render() {
    const safeLevel = Math.max(0, Math.min(100, this.level));

    return html`
      <div class="tank" style="--level:${safeLevel}">
        ${this.label ? html` <div class="label">${safeLevel}%</div> ` : null}

        <div class="water">
          <div class="wave wave1"></div>
          <div class="wave wave2"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("water-tank", WaterTank);
