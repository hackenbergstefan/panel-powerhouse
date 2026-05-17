import { LitElement, html, css } from "https://unpkg.com/lit@3/index.js?module";

class PlasmaFlow extends LitElement {
  static properties = {
    blobs: { type: Number },
    activity: { type: Number },
  };

  constructor() {
    super();

    this.activity = 0.1;
    this.blobs = 30;

    this._blobData = [];
  }

  firstUpdated() {
    super.firstUpdated();
    this.generateBlobs();
  }

  updated(changed) {
    if (changed.has("blobs")) {
      this.generateBlobs();
    }
  }

  generateBlobs() {
    this._blobData = [];

    const width = 100;
    const height = 200;

    for (let i = 0; i < this.blobs; i++) {
      const size = this.random(10, 200);
      this._blobData.push({
        width: size,
        height: size * this.random(0.6, 1.4),
        startX: this.random(-120, width * 0.8),
        startY: this.random(-120, height),
        endX: this.random(-120, width * 0.8),
        endY: this.random(-120, height),
        scale: this.random(0.6, 1.4),
        duration: this.random(3, 10) / this.activity,
        delay: this.random(-10, 0),
        opacity: this.random(0.25, 0.9),
      });
    }

    this.requestUpdate();
  }

  random(min, max) {
    return min + Math.random() * (max - min);
  }

  static styles = css`
    :host {
      position: absolute;
      display: inline-block;
    }

    .plasma-box {
      position: absolute;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }

    .plasma {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      mix-blend-mode: screen;
      filter: blur(16px);
      animation-name: drift;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      will-change: transform, opacity;
    }

    .blob::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: radial-gradient(
        circle at 35% 35%,
        rgba(2, 5, 39, 0.95),
        rgba(12, 32, 44, 0.9) 40%,
        rgba(105, 199, 242, 0.15) 75%,
        rgba(255, 255, 255, 0) 80%
      );
    }

    .ambient-glow {
      position: absolute;

      inset: 0;

      background: radial-gradient(
        ellipse at center,
        rgba(59, 170, 255, 0.12),
        transparent 70%
      );

      animation: pulse 4s ease-in-out infinite;

      pointer-events: none;
    }

    @keyframes drift {
      from {
        transform: translate(var(--start-x), var(--start-y)) scale(var(--scale));
      }

      to {
        transform: translate(var(--end-x), var(--end-y))
          scale(calc(var(--scale) * 1.2));
      }
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 0.5;
      }

      50% {
        opacity: 1;
      }
    }
  `;

  renderBlob(blob) {
    return html`
      <div
        class="blob"
        style="
                    width:${blob.width}px;
                    height:${blob.height}px;

                    opacity:${blob.opacity};

                    --start-x:${blob.startX}px;
                    --start-y:${blob.startY}px;

                    --end-x:${blob.endX}px;
                    --end-y:${blob.endY}px;

                    --scale:${blob.scale};

                    animation-duration:
                        ${blob.duration}s;

                    animation-delay:
                        ${blob.delay}s;
                "
      ></div>
    `;
  }

  render() {
    return html`
      <div class="plasma-box">
        <div class="plasma">
          ${this._blobData.map((blob) => this.renderBlob(blob))}
          <div class="ambient-glow"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("plasma-flow", PlasmaFlow);
