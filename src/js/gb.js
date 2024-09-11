import '../scss/gb.scss';


const DEBUG = false;


class gb {


  constructor() {
    // Determine language from local storage or from navigator language
    this._lang = localStorage.getItem('website-lang');
    if (this._lang === null) {
      this._lang = (['de', 'en', 'es', 'fr', 'pt'].indexOf(navigator.language.substring(0, 2)) !== -1) ? navigator.language.substring(0, 2) : 'en';
      localStorage.setItem('website-lang', this._lang);
    }
    // Class internals for lang, translations and artist info
    this._nls = null;
    this._info = null;
    this._mainScroll = null;
    this._version = '1.0.0';
    // Begin website initialization
    if (DEBUG === true) { console.log(`guillaumebeaulieu.com v${this._version} : Begin website initialization`); }
    this._initLang()
      .then(this._fetchArtistInfo.bind(this))
      .then(this._buildPage.bind(this))
      .then(this._events.bind(this))
      .then(this._finalizeInit.bind(this))
      .catch(err => { // Error are displayed even if DEBUG is set to false, to notify end user to contact support
        console.error(`guillaumebeaulieu.com v${this._version} : Fatal error during initialization, please contact support :\n`, err);
      })
      .finally(() => {
        if (DEBUG === true) { console.log(`guillaumebeaulieu.com v${this._version} : Website initialization done`); }
      });
  }


  _initLang() {
    if (DEBUG === true) { console.log(`1. Fetch language keys with ${this._lang} locale`); }
    return new Promise((resolve, reject) => {
      fetch(`assets/json/${this._lang}.json`).then(data => {
        data.json().then(nlsKeys => {
          if (DEBUG === true) { console.log(`2. Language keys successfully retrieven`); }
          this._nls = nlsKeys;
          // Update select menu with supported langs
          const select = document.getElementById('lang-select');
          for (let i = 0; i < select.children.length; ++i) {
            select.children[i].innerHTML = this._nls.lang[select.children[i].value];
            if (select.children[i].value === this._lang) {
              select.children[i].setAttribute('selected', true);
            }
          }
          // Update nav and shared elements between pages
          document.querySelector('#nls-nav-biography').innerHTML = this._nls.nav.biography;
          document.querySelector('#nls-nav-biography').href = `/${this._nls.pages.biography}`;
          document.querySelector('#nls-nav-discography').innerHTML = this._nls.nav.discography;
          document.querySelector('#nls-nav-discography').href = `/${this._nls.pages.discography}`;
          document.querySelector('#nls-nav-medias').innerHTML = this._nls.nav.medias;
          document.querySelector('#nls-nav-medias').href = `/${this._nls.pages.medias}`;
          document.querySelector('#nls-nav-links').innerHTML = this._nls.nav.links;
          document.querySelector('#nls-nav-links').href = `/${this._nls.pages.links}`;
          // Listen to lang update
          select.addEventListener('change', e => {
            localStorage.setItem('website-lang', e.target.value);
            window.location.reload();
          });

          resolve();
        }).catch(err => {
          if (DEBUG === true) { console.log(`Err. Can't parse language keys, the JSON file may be is invalid`); }
          reject(err);
        });
      }).catch(err => {
        if (DEBUG === true) { console.log(`Err. Couldn't retrieve language keys`); }
        reject(err);
      });
    });
  }


  _fetchArtistInfo() {
    if (DEBUG === true) { console.log(`1. Fetch band links and releases`); }
    return new Promise((resolve, reject) => {
      fetch(`assets/json/info.json`).then(data => {
        data.json().then(infoKeys => {
          if (DEBUG === true) { console.log(`2. Links and releases successfully retrieven`); }
          this._info = infoKeys;
          resolve();
        }).catch(err => {
          if (DEBUG === true) { console.log(`Err. Can't parse language keys, the JSON file may be is invalid`); }
          reject(err);
        });
      }).catch(err => {
        if (DEBUG === true) { console.log(`Err. Couldn't retrieve language keys`); }
        reject(err);
      });
    });
  }


  _buildPage() {
    if (DEBUG === true) { console.log(`5. Build HTML DOM depending on the page type`); }
    return new Promise(resolve => {
      document.querySelector('#info-modal').addEventListener('click', this._infoModal.bind(this));
      if (document.body.dataset.type === 'biography') {
        this._buildBiographyPage();
      } else if (document.body.dataset.type === 'discography') {
        this._buildDiscographyPage();
      } else if (document.body.dataset.type === 'medias') {
        this._buildMediasPage();
      } else if (document.body.dataset.type === 'links') {
        this._buildLinksPage();
      } else {
        this._build404Page();
      }
      resolve();
    });
  }


  _buildBiographyPage() {
    if (DEBUG === true) { console.log(`5. Init website with the artist biography page`); }    
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.biography}`;
    document.querySelector('#nls-bio-short').innerHTML = this._nls.biography.short;
    document.querySelector('#nls-bio-content1').innerHTML = this._nls.biography.content1;
    document.querySelector('#nls-bio-content2').innerHTML = this._nls.biography.content2;
    document.querySelector('#nls-bio-content3').innerHTML = this._nls.biography.content3;
    document.querySelector('#nls-bio-content4').innerHTML = this._nls.biography.content4;
    document.querySelector('#nls-bio-content5').innerHTML = this._nls.biography.content5;
    document.querySelector('#nls-bio-find-online').innerHTML = this._nls.biography.findOnline;
    // Handle image slideshow
    const spans = document.querySelector('#photo-select').children;
    for (let i = 0; i < spans.length; ++i) {
      spans[i].addEventListener('click', () => {
        for (let j = 0; j < spans.length; ++j) {
          spans[j].classList.remove('active');
        }
        spans[i].classList.add('active');
        document.querySelector('#artist-picture-path').src = `/assets/img/artists/${this._info.pictures.path[i]}`;
        document.querySelector('#artist-picture-author').textContent = this._info.pictures.author[i];
      });
    }
  }


  _buildDiscographyPage() {
    if (DEBUG === true) { console.log(`5. Init website with the artist discography page`); }
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.discography}`;
    document.querySelector('#nls-disco-description').innerHTML = this._nls.discography.description;
    // Build artist releases
    for (let i = 0; i < this._info.releases.length; ++i) {
      const container = document.createElement('DIV');
      container.classList.add('release');
      container.innerHTML = `
        <img src="/assets/img/releases/${this._info.releases[i].cover}" alt="release-image">
        <h1>${this._info.releases[i].title}</h1>
        <h2>${this._info.releases[i].artist}</h2>
      `;
      document.querySelector('#releases-wrapper').appendChild(container);
      container.addEventListener('click', this._releaseModal.bind(this, i));
    }
  }


  _buildMediasPage() {
    if (DEBUG === true) { console.log(`5. Init website with the artist medias page`); }
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.medias}`;
    document.querySelector('#nls-medias-description').innerHTML = this._nls.medias.description;
    document.querySelector('#nls-medias-link').innerHTML = this._nls.medias.link;
    // Build media elements
    for (let i = 0; i < this._info.medias.length; ++i) {
      const date = new Intl.DateTimeFormat(this._lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(this._info.medias[i].date));

      const container = document.createElement('DIV');
      container.classList.add('media');
      container.innerHTML = `
        <iframe src="${this._info.medias[i].url}" title="${this._info.medias[i].title}" allowfullscreen="" sandbox="allow-same-origin allow-scripts allow-popups" frameborder="0"></iframe>
        <h2>${this._info.medias[i].title}</h2>
        <h3>${date}</h3>
      `;
      document.querySelector('#medias-wrapper').appendChild(container);
    }
  }


  _buildLinksPage() {
    if (DEBUG === true) { console.log(`5. Init website with the artist links page`); }
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.links}`;
    document.querySelector('#nls-links-description').innerHTML = this._nls.links.linksDescription;
    document.querySelector('#nls-links-contact').innerHTML = this._nls.links.linksContact;
    // Build artist links
    for (let i = 0; i < this._info.links.length; ++i) {
      const container = document.createElement('A');
      container.href= this._info.links[i].url;
      container.setAttribute('target', '_blank');
      container.setAttribute('rel', 'noopener');
      container.classList.add('link');
      container.innerHTML = `
        <img src="/assets/img/logo/${this._info.links[i].type}.svg" alt="release-image">
        <h1>${this._nls.links[this._info.links[i].type]}</h1>
      `;
      document.querySelector('#links-wrapper').appendChild(container);
    }
  }


  _build404Page() {
    if (DEBUG === true) { console.log(`5. Init website with the 404 page`); }
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.error404}`;
    document.querySelector('#nls-404-title').innerHTML = this._nls.page404.title;
    document.querySelector('#nls-404-description').innerHTML = this._nls.page404.description;
  }


  _events() {
    // Blur modal event
    document.getElementById('modal-overlay').addEventListener('click', this._closeModal.bind(this));
  }


  _finalizeInit() {
    return new Promise(resolve => {
      document.querySelector('#loading-overlay').style.opacity = 0;
      setTimeout(() => {
        document.querySelector('#loading-overlay').style.display = 'none';
        this._mainScroll = new window.ScrollBar({
          target: document.body,
          style: {
            color: 'white'
          }
        });
        // Force raf after scroll creation to make scrollbar properly visible
        requestAnimationFrame(() => {
          this._mainScroll.updateScrollbar();
          resolve();
        });
      }, 400);
    });
  }


  // Modal related methods


  _infoModal() {
    const overlay = document.getElementById('modal-overlay');
    // Open modal event
    fetch(`assets/html/modal/infomodal.html`).then(data => {
      overlay.style.display = 'flex';
      data.text().then(htmlString => {
        const container = document.createRange().createContextualFragment(htmlString);
        container.querySelector('#nls-modal-title').innerHTML = this._nls.modal.info.title;
        container.querySelector('#nls-modal-content1').innerHTML = this._nls.modal.info.content1;
        container.querySelector('#nls-modal-content2').innerHTML = this._nls.modal.info.content2;
        container.querySelector('#nls-modal-content3').innerHTML = this._nls.modal.info.content3;
        container.querySelector('#close-modal-button').innerHTML = this._nls.close;
        overlay.appendChild(container);
        setTimeout(() => overlay.style.opacity = 1, 50);
      });
    }).catch(e => console.error(e));
  }


  _releaseModal(index) {
    const overlay = document.getElementById('modal-overlay');
    // Open modal event
    fetch(`assets/html/modal/releasemodal.html`).then(data => {
      overlay.style.display = 'flex';
      data.text().then(htmlString => {
        const date = new Intl.DateTimeFormat(this._lang, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(this._info.releases[index].date));
        const container = document.createRange().createContextualFragment(htmlString);
        container.querySelector('#release-title').innerHTML = this._info.releases[index].title;
        container.querySelector('#release-cover').src = `/assets/img/releases/${this._info.releases[index].cover}`;
        container.querySelector('#release-performer').innerHTML = `${this._nls.modal.release.discFrom} <i>${this._info.releases[index].artist}</i>`;
        container.querySelector('#release-publisher').innerHTML = `${this._nls.modal.release.publishedOn} ${date} ${this._nls.modal.release.publishedBy} <a href="${this._info.releases[index].labelLink}" target="_blank" rel="noopener" alt="label-link">${this._info.releases[index].label}</a>`;
        container.querySelector('#release-duration').innerHTML = `${this._info.releases[index].tracks} ${this._nls.modal.release.tracks} – ${this._info.releases[index].duration}`;
        container.querySelector('#close-modal-button').innerHTML = this._nls.close;

        for (let i = 0; i < this._info.releases[index].links.length; ++i) {
          const link = document.createElement('A');
          link.href = this._info.releases[index].links[i].url;
          link.classList.add('link');
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener');
          link.innerHTML = `
            <img src="/assets/img/logo/${this._info.releases[index].links[i].type}.svg" alt="link-icon">
            <p>${this._nls.links[this._info.releases[index].links[i].type]}</p>
          `;
          container.querySelector('#release-links').appendChild(link);
        }

        new window.ScrollBar({
          target: container.querySelector('#modal-content'),
          style: {
            color: 'white'
          }
        });

        overlay.appendChild(container);
        setTimeout(() => overlay.style.opacity = 1, 50);
      });
    }).catch(e => console.error(e));
  }


  _closeModal(e) {
    if (e.originalTarget.id !== 'modal-overlay' && e.originalTarget.className !== 'close-modal') {
      return;
    }

    const overlay = document.getElementById('modal-overlay');
    if (overlay.style.display === 'flex') {
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.innerHTML = '';
        overlay.style = '';
      }, 400);
    }
  }


}


export default gb;
