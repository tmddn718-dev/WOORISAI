// <lucide-icon name="house" size="20" stroke-width="1.75" label="홈"> — renders a Lucide icon from the lucide UMD build (window.lucide).
(function () {
  if (customElements.get('lucide-icon')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const pascal = n => String(n || '').replace(/(^|-)([a-z0-9])/g, (_, a, b) => b.toUpperCase());
  class LucideIcon extends HTMLElement {
    static get observedAttributes() { return ['name', 'size', 'stroke-width', 'label']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const L = window.lucide;
      if (!L || !L.icons) { clearTimeout(this._t); this._t = setTimeout(() => this.render(), 60); return; }
      const size = this.getAttribute('size') || '20';
      const sw = this.getAttribute('stroke-width') || '1.75';
      const label = this.getAttribute('label');
      const node = L.icons[pascal(this.getAttribute('name'))];
      this.style.display = 'inline-flex';
      this.style.flex = 'none';
      this.style.width = size + 'px';
      this.style.height = size + 'px';
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      root.innerHTML = '';
      if (!node) return;
      const kids = Array.isArray(node[0]) ? node : (node[2] || []);
      const svg = document.createElementNS(NS, 'svg');
      const attrs = { xmlns: NS, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      for (const k in attrs) svg.setAttribute(k, attrs[k]);
      if (label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); } else { svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); }
      svg.style.display = 'block';
      kids.forEach(([tag, a]) => { const el = document.createElementNS(NS, tag); for (const k in a) el.setAttribute(k, a[k]); svg.appendChild(el); });
      root.appendChild(svg);
    }
  }
  customElements.define('lucide-icon', LucideIcon);
})();
