class IEdgeElement extends HTMLElement {
  connectedCallback() {
    this.setAttribute('tabindex', '0');
  }
}

window.customElements.define('i-edge', IEdgeElement);
