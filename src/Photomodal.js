// PhotoModal.js — DOM-based photo lightbox

export default class PhotoModal {
  constructor() {
    this._build();
  }

  _build() {
    // Modal overlay
    this.el = document.createElement('div');
    this.el.id = 'photo-modal';

    this.el.innerHTML = `
      <div class="modal-frame">
        <div class="modal-header">
          <span id="modal-title">♥ MEMORY</span>
          <button class="modal-close" id="modal-close-btn">✕ CLOSE</button>
        </div>
        <div class="modal-photo-wrap" id="modal-photo-wrap">
          <div class="photo-placeholder" id="photo-placeholder">
            <div class="pixel-heart">♥</div>
            <p>Add your photo to<br>assets/photos/</p>
          </div>
          <img id="modal-img" style="display:none" alt="Memory photo" />
        </div>
        <div class="modal-caption">
          <h3 id="modal-caption"></h3>
          <div class="date-tag" id="modal-date"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.el);

    document
      .getElementById('modal-close-btn')
      .addEventListener('click', () => this.hide());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });

    this._img = document.getElementById('modal-img');
    this._placeholder = document.getElementById('photo-placeholder');
    this._caption = document.getElementById('modal-caption');
    this._date = document.getElementById('modal-date');
    this._title = document.getElementById('modal-title');
  }

  show(paintingData) {
    this._caption.textContent = paintingData.caption || '';
    this._date.textContent = paintingData.date || '';
    this._title.textContent = '♥ MEMORY #' + (paintingData.index ?? '');

    // Try to load photo; fall back to placeholder
    const src = paintingData.photo;
    const testImg = new Image();
    testImg.onload = () => {
      this._img.src = src;
      this._img.style.objectPosition = paintingData.objectPosition || '50% 50%';
      this._img.style.display = 'block';
      this._placeholder.style.display = 'none';
    };
    testImg.onerror = () => {
      this._img.style.display = 'none';
      this._placeholder.style.display = 'flex';
      this._placeholder.innerHTML = `
        <div class="pixel-heart">♥</div>
        <p>Place your photo at:<br><br>${src}</p>
      `;
    };
    testImg.src = src;

    this.el.classList.add('visible');
    document.getElementById('hint-bubble').classList.remove('visible');
  }

  hide() {
    this.el.classList.remove('visible');
  }
}
