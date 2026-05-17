import { LitElement, html, css } from "https://unpkg.com/lit@3/index.js?module";

class SparkBar extends LitElement {
  static properties = {
    active: { type: Boolean },
    sparks: { type: Number },
    drift: { type: Number },
    color: { type: String },
    colorGlow: { type: String },
    aspectRatio: { type: Number },
    size: { type: Number },
    invertDriftDirection: { type: Boolean },
  };

  constructor() {
    super();

    this.active = true;
    this.sparks = 50;
    this.drift = 10;
    this.size = 5;
    this.color = "#ffffff";
    this.colorGlow = "#ffffff";
    this.aspectRatio = 1.0;
    this.invertDriftDirection = false;
  }

  static styles = css`
    :host {
      width: calc(100% - 5px);
      height: 0px;
      top: 0;
      display: block;
      position: absolute;
      z-index: -1;
    }

    .spark {
      position: absolute;
      top: 50%;
      border-radius: 50%;
      opacity: 0;
      // animation-name: spark-move, flicker;
      // animation-timing-function: linear, ease-in-out;
      // animation-iteration-count: infinite, infinite;
      animation: spark-move linear infinite;
      // will-change: transform, opacity;
    }

    @keyframes spark-move {
      0% {
        transform: translate(0, 0) scale(0.3);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      100% {
        transform: translateY(var(--drift)) scale(1);
        opacity: 0;
      }
    }

    @keyframes flicker {
      0%,
      100% {
        filter: brightness(1);
      }
      50% {
        filter: brightness(2);
      }
    }
  `;

  createSpark(index) {
    const size1 = this.size + Math.random() * this.size;
    const size2 = size1 * this.aspectRatio;
    const moveDuration = 0.8 + Math.random() * 10;
    const flickerDuration = 0.1 + Math.random() * 2;
    const delay = Math.random() * 2;
    const left = Math.random() * 100;
    const drift = -(this.drift + Math.random() * this.drift);

    return html`
      <div
        class="spark"
        style="
          left:${left}%;
          width:${size2}px;
          height:${size1}px;
          --drift:${drift}px;
          animation-duration:
              ${moveDuration}s,
              ${flickerDuration}s;
          animation-delay:
              ${delay}s;
          background: ${this.color};
          box-shadow: 0 0 6px ${this.colorGlow}, 0 0 12px ${this.colorGlow};
          ${this.invertDriftDirection ? "animation-direction: reverse;" : ""}
        "
      ></div>
    `;
  }

  render() {
    if (!this.active) {
      return html``;
    }

    return html`
      ${Array.from({ length: this.sparks }, (_, i) => this.createSpark(i))}
    `;
  }
}

customElements.define("spark-bar", SparkBar);
