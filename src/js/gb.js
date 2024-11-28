import '../scss/gb.scss';
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'; // So windows.chrome doesn't go bananas with country flags
import ScrollBar from '../lib/ScrollBar';


let DEBUG = false; // Not a const because it can be updated if debug is set in URL
const SUPPORTED_LANGUAGES = ['de', 'en', 'es', 'fr', 'ja', 'pt'];
polyfillCountryFlagEmojis(); // Polyfill country flag for proper display in windows.chrome


class gb {


  /**
   * @class
   * @constructor
   * @summary Website's content and interaction handler
   * @author Arthur Beaulieu
   * @since November 2024
   * @licence GPL-v3.0
   * @description <blockquote>
   * Handle each pages of the websites, update page content according to the selected language
   * and finally, handle all kind of user events to make pages fully interactive.
   * </blockquote> **/
  constructor() {
    /**
     * The app target language
     * @type {String}
     * @private
     **/
    this._lang = null;
    /**
     * The national language settings, holding all translated keys used in app
     * @type {Object}
     * @private
     **/
    this._nls = null;
    /**
     * All information concerning the artists : bio, programs, releases, medias and links
     * @type {Object}
     * @private
     **/
    this._info = null;
    /**
     * The page main custom scrollbar
     * @type {Object}
     * @private
     **/
    this._mainScroll = null;
    /**
     * The website's current version
     * @type {String}
     * @private
     **/
    this._version = '1.1.0';

    // Update debug flag if it is given in the url
    if (window.location.href.indexOf('?debug') !== -1) {
      DEBUG = true;
    }
    if (DEBUG === true) { console.log(`guillaumebeaulieu.com v${this._version} : Begin website initialization`); }
    // Determine language from local storage or from navigator language
    this._lang = localStorage.getItem('website-lang');
    if (this._lang === null) {
      // If no local storage entry exists, check if browser language is supported and use it if so, defaults to english otherwise
      this._lang = (SUPPORTED_LANGUAGES.indexOf(navigator.language.substring(0, 2)) !== -1) ? navigator.language.substring(0, 2) : 'en';
      // Save curent language in local storage
      localStorage.setItem('website-lang', this._lang);
    }
    // Initialization chained sequence
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


  /**
   * @method
   * @name _initLang
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Method to initialize the website's language according to the selected one. Fetches the key/values
   * for the given language, store them as parsed JSON and update all commonly shared DOM element between pages.
   * </blockquote>
   * @returns {Promise} A Promise resolved when languages keys are retrieven, stored and that DOM is updated, rejected otherwise **/
  _initLang() {
    if (DEBUG === true) { console.log(`    Fetch language keys with ${this._lang} locale`); }
    return new Promise((resolve, reject) => {
      // Get associated language JSON file holding key/values for each text
      fetch(`assets/json/${this._lang}.json`).then(data => {
        // Parse received data as JSON to store it as internal
        data.json().then(nlsKeys => {
          if (DEBUG === true) { console.log(`    Language keys successfully retrieven`); }
          this._nls = nlsKeys;
          // Update select menu with supported langs
          document.querySelector('#nls-header-select-label').innerHTML = this._nls.nav.lang;
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
          document.querySelector('#nls-nav-programs').innerHTML = this._nls.nav.programs;
          document.querySelector('#nls-nav-programs').href = `/${this._nls.pages.programs}`;
          document.querySelector('#nls-nav-discography').innerHTML = this._nls.nav.discography;
          document.querySelector('#nls-nav-discography').href = `/${this._nls.pages.discography}`;
          document.querySelector('#nls-nav-medias').innerHTML = this._nls.nav.medias;
          document.querySelector('#nls-nav-medias').href = `/${this._nls.pages.medias}`;
          document.querySelector('#nls-nav-links').innerHTML = this._nls.nav.links;
          document.querySelector('#nls-nav-links').href = `/${this._nls.pages.links}`;
          // Listen to lang update and force page reload with newly set language
          select.addEventListener('change', e => {
            localStorage.setItem('website-lang', e.target.value);
            window.location.reload();
          });
          resolve();
        }).catch(err => {
          if (DEBUG === true) { console.error(`Can't parse language keys, the JSON file may be is invalid`); }
          reject(err);
        });
      }).catch(err => {
        if (DEBUG === true) { console.error(`Couldn't retrieve language keys`); }
        reject(err);
      });
    });
  }


  /**
   * @method
   * @name _fetchArtistInfo
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Method to fetch and store all information about the artist ; pictures, bio, programs, releases, medias and links.
   * </blockquote>
   * @returns {Promise} A Promise resolved when information are retrieven and stored, rejected otherwise **/
  _fetchArtistInfo() {
    if (DEBUG === true) { console.log(`    Fetch band links and releases`); }
    return new Promise((resolve, reject) => {
      // Get artist info as json stored in assets
      fetch(`assets/json/info.json`).then(data => {
        data.json().then(infoKeys => {
          if (DEBUG === true) { console.log(`    Artist information successfully retrieven`); }
          this._info = infoKeys;
          resolve();
        }).catch(err => {
          if (DEBUG === true) { console.error(`Can't parse language keys, the JSON file may be is invalid`); }
          reject(err);
        });
      }).catch(err => {
        if (DEBUG === true) { console.error(`Couldn't retrieve language keys`); }
        reject(err);
      });
    });
  }


  /**
   * @method
   * @name _buildPage
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Depending on the data-type set on the document HTML tag body, it will build the according page.
   * In case of an unsupported data-type, it will build the 404 page.
   * </blockquote>
   * @returns {Promise} A Promise resolved when the selected page has been built **/
  _buildPage() {
    if (DEBUG === true) { console.log(`    Build HTML DOM depending on the page type`); }
    return new Promise(resolve => {
      switch (document.body.dataset.type) {
        case 'biography':
          this._buildBiographyPage();
          break;
        case 'programs':
          this._buildProgramsPage();
          break;
        case 'discography':
          this._buildDiscographyPage();
          break;
        case 'medias':
          this._buildMediasPage();
          break;
        case 'links':
          this._buildLinksPage();
          break;
        default:
          this._build404Page();
          break;
      }
      resolve();
    });
  }


  /**
   * @method
   * @name _buildBiographyPage
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Build the artist's Biography page according to info and pictures stored in internal <code>this._info</code> attribute.
   * </blockquote> **/
  _buildBiographyPage() {
    if (DEBUG === true) { console.log(`    Init website with the artist biography page`); }    
    // Update page title, short and full biography and call-to-action link
    document.title = `Guillaume Beaulieu | ${this._nls.nav.biography}`;
    document.querySelector('#nls-bio-short').innerHTML = this._info.bio.short[this._lang];
    document.querySelector('#nls-bio-content').innerHTML = this._info.bio.full[this._lang];
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


  /**
   * @method
   * @name _buildProgramsPage
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Build the artist's Programs page according to info stored in internal <code>this._info</code> attribute.
   * </blockquote> **/
  _buildProgramsPage() {
    if (DEBUG === true) { console.log(`    Init website with the artist programs page`); }    
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.programs}`;
    document.querySelector('#nls-programs-description').innerHTML = this._nls.programs.description;
    document.querySelector('#nls-programs-contact').innerHTML = this._nls.programs.contact;
    // Build artist programs
    for (let i = 0; i < this._info.programs.length; ++i) {
      const container = document.createElement('A');
      container.href = '#';
      container.classList.add('event');
      container.innerHTML = `
        <img src="/assets/img/programs/${this._info.programs[i].image}" alt="program-image" height="311" width="220">
        <div>
          <h3>${this._info.programs[i].title[this._lang]}</h3>
          <p>${this._info.programs[i].description[this._lang]}</p>
        </div>
      `;
      document.querySelector('#programs-wrapper').appendChild(container);
      // perform PDF download upon click on program
      container.addEventListener('click', () => {
        const link = document.createElement('A');
        link.href = `/assets/doc/${this._info.programs[i].path}`;
        link.download = `${this._info.programs[i].path}`;
        link.dispatchEvent(new MouseEvent('click'));
      });
    }
  }


  /**
   * @method
   * @name _buildDiscographyPage
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Build the artist's albums page according to released albums stored in internal <code>this._info</code> attribute.
   * </blockquote> **/
  _buildDiscographyPage() {
    if (DEBUG === true) { console.log(`    Init website with the artist discography page`); }
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.discography}`;
    document.querySelector('#nls-disco-description').innerHTML = this._nls.discography.description;
    // Build artist releases
    for (let i = 0; i < this._info.releases.length; ++i) {
      const container = document.createElement('A');
      container.href = '#';
      container.classList.add('release');
      container.innerHTML = `
        <img src="/assets/img/releases/${this._info.releases[i].cover}" alt="release-image" height="300" width="300">
        <h1>${this._info.releases[i].title}</h1>
        <h2>${this._info.releases[i].artist}</h2>
      `;
      document.querySelector('#releases-wrapper').appendChild(container);
      container.addEventListener('click', this._releaseModal.bind(this, i));
    }
  }


  /**
   * @method
   * @name _buildMediasPage
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Build the artist's Medias page according to available medias stored in internal <code>this._info</code> attribute.
   * </blockquote> **/
  _buildMediasPage() {
    if (DEBUG === true) { console.log(`    Init website with the artist medias page`); }
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
      container.addEventListener('click', this._watchMediaModal.bind(this, i));
    }
  }


  /**
   * @method
   * @name _buildLinksPage
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Build the artist's links page according to available info in internal <code>this._info</code> attribute.
   * </blockquote> **/
  _buildLinksPage() {
    if (DEBUG === true) { console.log(`    Init website with the artist links page`); }
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.links}`;
    document.querySelector('#nls-links-description').innerHTML = this._nls.links.description;
    document.querySelector('#nls-links-contact').innerHTML = this._nls.links.contact;
    // Build artist links
    for (let i = 0; i < this._info.links.length; ++i) {
      const container = document.createElement('A');
      container.href= this._info.links[i].url;
      container.setAttribute('target', '_blank');
      container.setAttribute('rel', 'noopener');
      container.classList.add('link');
      container.innerHTML = `
        <img src="/assets/img/logo/${this._info.links[i].type}.svg" alt="release-image" height="60" width="60">
        <h1>${this._nls.links[this._info.links[i].type]}</h1>
      `;
      document.querySelector('#links-wrapper').appendChild(container);
    }
  }


  /**
   * @method
   * @name _build404Page
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Build the 404 page
   * </blockquote> **/
  _build404Page() {
    if (DEBUG === true) { console.log(`    Init website with the 404 page`); }
    // Update page title
    document.title = `Guillaume Beaulieu | ${this._nls.nav.error404}`;
    document.querySelector('#nls-404-title').innerHTML = this._nls.page404.title;
    document.querySelector('#nls-404-description').innerHTML = this._nls.page404.description;
  }


  /**
   * @method
   * @name _events
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Subscribe to all events that are globally shared between all pages.
   * </blockquote>
   * @returns {Promise} A Promise resolved when the events are subscribed **/
  _events() {
    if (DEBUG === true) { console.log(`    Subscribe to website's global events`); }
    return new Promise(resolve => {
      // Website information modal callback
      document.querySelector('#info-modal').addEventListener('click', this._infoModal.bind(this));
      // Blur modal event
      document.getElementById('modal-overlay').addEventListener('click', this._closeModal.bind(this));
      resolve();
    });
  }


  /**
   * @method
   * @name _finalizeInit
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Remove the loading overlay and build the page main scrollbar.
   * </blockquote>
   * @returns {Promise} A Promise resolved when the events are subscribed **/
  _finalizeInit() {
    if (DEBUG === true) { console.log(`    Finalize website's initialization`); }
    return new Promise(resolve => {
      document.querySelector('#loading-overlay').style.opacity = 0;
      setTimeout(() => {
        document.querySelector('#loading-overlay').style.display = 'none';
        this._mainScroll = new ScrollBar({
          target: document.body,
          style: {
            color: 'white'
          }
        });
        // Force raf after scroll creation to make scrollbar properly visible
        requestAnimationFrame(() => {
          this._mainScroll.updateScrollbar();
        });
      }, 400);
      resolve();
    });
  }


  /**
   * @method
   * @name _infoModal
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Fetch and build the information modal, holding info about the website, its licence and publishing responsible.
   * </blockquote> **/
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


  /**
   * @method
   * @name _releaseModal
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Fetch and build the release modal, holding its info and links.
   * </blockquote> 
   * @param {Number} index - The release index in the stored information **/
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

        new ScrollBar({
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


  /**
   * @method
   * @name _watchMediaModal
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Fetch and build the media modal for full screen experience of any media.
   * </blockquote> 
   * @param {Number} index - The media index in the stored information **/
  _watchMediaModal(index) {
    const overlay = document.getElementById('modal-overlay');
    // Open modal event
    fetch(`assets/html/modal/watchmediamodal.html`).then(data => {
      overlay.style.display = 'flex';
      data.text().then(htmlString => {
        const container = document.createRange().createContextualFragment(htmlString);
        container.querySelector('#iframe-object').src = this._info.medias[index].url;
        container.querySelector('#iframe-object').title = this._info.medias[index].title;
        overlay.appendChild(container);
        setTimeout(() => overlay.style.opacity = 1, 50);
      });
    }).catch(e => console.error(e));
  }


  /**
   * @method
   * @name _closeModal
   * @private
   * @memberof gb
   * @author Arthur Beaulieu
   * @since November 2024
   * @description <blockquote>
   * Callback method for a click event that will close a modal if the target contains close in its class
   * or if the user's clicked on the modal overlay.
   * </blockquote> 
   * @param {Event} e - The click event **/
  _closeModal(e) {
    if (e.srcElement.id !== 'modal-overlay' && e.srcElement.className !== 'close-modal') {
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
