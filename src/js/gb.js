import '../scss/gb.scss';


const DEBUG = false;


class gb {


  constructor() {
    // Determine language from local storage or from navigator language
    this._lang = localStorage.getItem('website-lang');
    if (this._lang === null) {
      this._lang = (['fr', 'es', 'de', 'gb', 'en'].indexOf(navigator.language.substring(0, 2)) !== -1) ? navigator.language.substring(0, 2) : 'en';
      localStorage.setItem('website-lang', this._lang);
    }

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
          document.querySelector('#nls-nav-events').innerHTML = this._nls.nav.events;
          document.querySelector('#nls-nav-discography').innerHTML = this._nls.nav.discography;
          document.querySelector('#nls-nav-medias').innerHTML = this._nls.nav.medias;
          document.querySelector('#nls-nav-links').innerHTML = this._nls.nav.links;
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
    return new Promise((resolve, reject) => {
      document.querySelector('#info-modal').addEventListener('click', this._infoModal.bind(this));
      if (document.body.dataset.type === 'biography') {
        this._buildBiographyPage();
      } else if (document.body.dataset.type === 'discography') {
        this._buildDiscographyPage();
      } else {
        if (DEBUG === true) { console.log(`Err. Unknown page type to init the website with`); }
        reject(new Error('Invalid <body> type. Should be either index, listen or tree'));
      }
      resolve();
    });
  }


  _buildBiographyPage() {
    if (DEBUG === true) { console.log(`5. Init website with the artist biography page`); }
    document.querySelector('#nls-bio-short').innerHTML = this._nls.bio.short;
    document.querySelector('#nls-bio-content1').innerHTML = this._nls.bio.content1;
    document.querySelector('#nls-bio-content2').innerHTML = this._nls.bio.content2;
    document.querySelector('#nls-bio-content3').innerHTML = this._nls.bio.content3;
    document.querySelector('#nls-bio-content4').innerHTML = this._nls.bio.content4;
    document.querySelector('#nls-bio-content5').innerHTML = this._nls.bio.content5;
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
    // Force timeout to wait for draw, then raf to display scroll
    setTimeout(() => {
      this._mainScroll = new window.ScrollBar({
        target: document.body,
        style: {
          color: 'white'
        }
      });
      // Force raf after scroll creation to make scrollbar properly visible
      requestAnimationFrame(() => {
        this._mainScroll.updateScrollbar();
      });
    }, 100);
  }


  _buildDiscographyPage() {
    if (DEBUG === true) { console.log(`5. Init website with the artist discography page`); }

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
    // Force timeout to wait for draw, then raf to display scroll
    setTimeout(() => {
      this._mainScroll = new window.ScrollBar({
        target: document.body,
        style: {
          color: 'white'
        }
      });
      // Force raf after scroll creation to make scrollbar properly visible
      requestAnimationFrame(() => {
        this._mainScroll.updateScrollbar();
      });
    }, 100);
  }


  _events() {
    // Blur modal event
    document.getElementById('modal-overlay').addEventListener('click', this._closeModal.bind(this));
  }


  // Utils for main page


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

        overlay.appendChild(container);
        setTimeout(() => overlay.style.opacity = 1, 50);
      });
    }).catch(e => console.error(e));
  }


  _artistModal(artist) {
    const overlay = document.getElementById('modal-overlay');
    // Open modal event
    fetch(`assets/html/biomodal.html`).then(data => {
      overlay.style.display = 'flex';
      data.text().then(htmlString => {
        const container = document.createRange().createContextualFragment(htmlString);
        container.querySelector('#artist-name').innerHTML = artist.fullName;
        container.querySelector('#artist-picture').src = `./assets/img/artists/${artist.picture}`;
        for (let i = 0; i < artist.roles.length; ++i) {
          container.querySelector('#artist-roles').innerHTML += this._nls.roles[artist.roles[i]];
          if (i + 1 < artist.roles.length) {
            container.querySelector('#artist-roles').innerHTML += ', ';
          }
        }
        container.querySelector('#artist-roles').innerHTML += ` ${this._nls.since} ${artist.range.split('-')[0]}`;
        container.querySelector('#artist-bio').innerHTML = artist.bio[this._lang];
        container.querySelector('#close-modal-button').innerHTML = this._nls.close;
        overlay.appendChild(container);
        requestAnimationFrame(() => overlay.style.opacity = 1);
      });
    }).catch(e => console.error(e));
  }


  _pastMembersModal(pastMembers) {
    const overlay = document.getElementById('modal-overlay');
    // Open modal event
    fetch(`assets/html/pastmembersmodal.html`).then(data => {
      overlay.style.display = 'flex';
      data.text().then(htmlString => {
        const container = document.createRange().createContextualFragment(htmlString);
        container.querySelector('#modal-title').innerHTML = this._nls.pastMembers;
        const artistsContainer = container.querySelector('#past-members-container');
        for (let i = 0; i < pastMembers.length; ++i) {
          const member = document.createElement('DIV');
          member.classList.add('past-member');
          let roles = '';
          for (let j = 0; j < pastMembers[i].roles.length; ++j) {
            roles += this._nls.roles[pastMembers[i].roles[j]];
            if (j + 1 < pastMembers[i].roles.length) {
              roles += ', ';
            }
          }
          roles += ` ${this._nls.from} ${pastMembers[i].range.split('-')[0]} ${this._nls.to} ${pastMembers[i].range.split('-')[1]}`;
          member.innerHTML = `
          <div><img src="./assets/img/artists/${pastMembers[i].picture}"><i>© ${pastMembers[i].pictureCredit}</i></div>
          <div class="past-member-infos">
            <span><h3>${pastMembers[i].fullName}</h3> – <i>${roles}</i></span>
            <p>${pastMembers[i].bio[this._lang]}</p>
          </div>
          `;
          artistsContainer.appendChild(member);
        }
        container.querySelector('#close-modal-button').innerHTML = this._nls.close;
        overlay.appendChild(container);
        // Force timeout to wait for draw, then raf to display scroll
        setTimeout(() => {
          const scroll = new window.ScrollBar({
            target: overlay.querySelector('#past-members-container'),
            style: {
              color: this._band.styles.mainColor
            }
          });
          // Force raf after scroll creation to make scrollbar properly visible
          requestAnimationFrame(() => {
            scroll.updateScrollbar();
          });
        }, 100);
        // Open modal
        requestAnimationFrame(() => overlay.style.opacity = 1);
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


  _getReleaseLink(links) {
    let url = '';
    for (let i = 0; i < links.length; ++i) {
      if (links[i].url !== '') {
        url = links[i].url;

        if (links[i].type === 'youtube') {
          return links[i].url;
        }
      }
    }

    return url;
  }


  _openReleaseVideo(url) {
    window.open(url, '_blank').focus();
  }


  // Utils for listen page


  _buildReleaseDate(date) {
    const dateArray = date.split('-');
    if (this._lang === 'en') {
      return `${this._nls.months[dateArray[1] - 1]} ${dateArray[0].replace(/^0+/, '')}, ${dateArray[2]}`;
    } else {
      return `${dateArray[0].replace(/^0+/, '')} ${this._nls.months[dateArray[1] - 1]} ${dateArray[2]}`;
    }
  }


  _buildTrackCredits(tracks) {
    let dom = '';
    for (let i = 0; i < tracks.length; ++i) {
      dom += `<h3>${i + 1}. ${tracks[i].title} – ${tracks[i].duration}</h3><p>`;
      if (tracks[i].composer !== '') { // Add composer if any
        dom += `<i>${this._nls.composer}</i> : ${tracks[i].composer}<br>`;
      }
      if (tracks[i].author !== '') { // Add author if any
        dom += `<i>${this._nls.author}</i> : ${tracks[i].author}`;
      }
      dom += `</p>`;
    }
    return dom;
  }


}


export default gb;
