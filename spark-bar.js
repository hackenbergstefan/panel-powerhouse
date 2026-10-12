import { LitElement, html, css } from "https://unpkg.com/lit@3/index.js?module";

// Draws all sparks on one canvas instead of one animated DOM element per spark.
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

    this._particles = [];
    this._raf = 0;
    this._t0 = performance.now();
    this._rgb = "#ffffff";
    this._width = 0;
    this._height = 0;
    this._baseline = 0;
    this._scale = 1;
    this._loop = (now) => {
      this._draw(now);
      this._raf = requestAnimationFrame(this._loop);
    };
    this._onResize = () => this._resize();
  }

  static styles = css`
    :host {
      width: calc(100% - 5px);
      height: 0px;
      top: 0;
      display: block;
      position: absolute;
      z-index: -1;
      pointer-events: none;
    }

    canvas {
      position: absolute;
      left: 0;
      display: block;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver(this._onResize);
    this._resizeObserver.observe(this);
    window.addEventListener("resize", this._onResize);
    this._raf = requestAnimationFrame(this._loop);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._resizeObserver?.disconnect();
    window.removeEventListener("resize", this._onResize);
  }

  willUpdate(changed) {
    const shapeChanged = ["drift", "size", "aspectRatio"].some((k) =>
      changed.has(k),
    );
    const count = this.sparks || 0;
    if (shapeChanged) {
      this._particles = Array.from({ length: count }, () =>
        this._createParticle(),
      );
    } else if (this._particles.length > count) {
      this._particles.length = count;
    } else {
      // Keep existing sparks running; a count change must not reshuffle them.
      while (this._particles.length < count) {
        this._particles.push(this._createParticle());
      }
    }
  }

  updated() {
    this.style.color = this.color;
    this._rgb = getComputedStyle(this).color;
    this._resize();
  }

  _createParticle() {
    const size1 = this.size + Math.random() * this.size;
    return {
      w: size1 * this.aspectRatio,
      h: size1,
      dur: 0.8 + Math.random() * 10,
      delay: Math.random() * 2,
      x: Math.random(),
      drift: -(this.drift + Math.random() * this.drift),
    };
  }

  _resize() {
    const canvas = this.renderRoot?.querySelector("canvas");
    if (!canvas) return;

    const pad = this.size * 2 + 12;
    const width = this.clientWidth;
    const height = Math.ceil(2 * this.drift + 2 * pad);
    const stageScale =
      parseFloat(getComputedStyle(this).getPropertyValue("--stage-scale")) || 1;
    const scale = Math.min(2, (window.devicePixelRatio || 1) * stageScale);

    this._baseline = 2 * this.drift + pad;
    canvas.style.top = `${-this._baseline}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const pw = Math.max(1, Math.round(width * scale));
    const ph = Math.max(1, Math.round(height * scale));
    // Assigning width/height clears the canvas, so only do it on change.
    if (canvas.width !== pw) canvas.width = pw;
    if (canvas.height !== ph) canvas.height = ph;
    this._ctx = canvas.getContext("2d");
    this._width = width;
    this._height = height;
    this._scale = scale;
  }

  _draw(now) {
    const ctx = this._ctx;
    if (!ctx) return;

    ctx.setTransform(this._scale, 0, 0, this._scale, 0, 0);
    ctx.clearRect(0, 0, this._width, this._height);
    if (!this.active) return;

    ctx.fillStyle = this._rgb;
    const elapsed = (now - this._t0) / 1000;
    for (const p of this._particles) {
      const t = elapsed - p.delay;
      if (t < 0) continue;

      let phase = (t % p.dur) / p.dur;
      if (this.invertDriftDirection) phase = 1 - phase;
      const alpha = phase < 0.1 ? phase / 0.1 : 1 - (phase - 0.1) / 0.9;
      if (alpha <= 0) continue;

      const scale = 0.3 + 0.7 * phase;
      const rx = (p.w * scale) / 2;
      const ry = (p.h * scale) / 2;
      const x = p.x * this._width + p.w / 2;
      const y = this._baseline + p.drift * phase;

      ctx.globalAlpha = alpha * 0.25;
      ctx.beginPath();
      ctx.ellipse(x, y, rx + 2.5, ry + 2.5, 0, 0, 6.2832);
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832);
      ctx.fill();
    }
  }

  render() {
    return html`<canvas></canvas>`;
  }
}

customElements.define("spark-bar", SparkBar);
