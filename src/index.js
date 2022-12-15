import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const debounce = require('lodash.debounce');
const lazyLoadImages = require('lazy-load-images');

const API_KEY = '31936057-7f7d0c6f748880506350ca56e';

const searchBar = document.querySelector('#search-box');
const gallery = document.querySelector('.gallery');
const goTop = document.querySelector('#goTop');
const btnSettings = document.querySelector('#modal-settings');
const modal = document.querySelector('#myModal');
const btnCloseModal = document.querySelector('#close');
const darkbtn = document.querySelector('#dark');
const loadMoreBtn = document.querySelector('#loadMore');

const loadbtn = document.querySelector('#load');
const selbtn = document.querySelector('#sel');

let perPage = localStorage.getItem('hits');
let page = 0;
let totalPages = 0;
let inputSearchValue;

lazyLoadImages.init();

const getPageHeight = () => {
  const body = document.body;
  const html = document.documentElement;
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight
  );
};

loadMoreBtn.classList.add('isHidden');

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});

const fetchData = async (input, page) => {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${input}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.log('deklaracja fetchPictures ,async/await, error:', error.message);
  }
};

const getData = () => {
  inputSearchValue = searchBar.value;
  page = 1;
  gallery.innerHTML = '';

  if (inputSearchValue.length > 1) {
    fetchData(inputSearchValue, page)
      .then(respData => {
        totalPages = Math.ceil(respData.totalHits / perPage);
        // console.log(respData.totalHits);
        // console.log(totalPages);
        let picsInArray = respData.hits.length;

        if (picsInArray === 0) {
          Notiflix.Notify.warning(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        } else {
          showPictures(respData);
          lightbox.refresh();
          console.log(`current page is ${page} of ${totalPages}`);
          // console.log(JSON.parse(localStorage.getItem('load')));
          // console.log(totalPages);

          if (JSON.parse(localStorage.getItem('load') === 'true')) {
            if (totalPages > 1) {
              loadMoreBtn.classList.remove('isHidden');
            }
          }
        }
      })
      .catch(error => console.log(error));
  }
};

const loadMore = () => {
  if (page !== totalPages) {
    ++page;
    console.log(`current page is ${page} of ${totalPages}`);
    if (JSON.parse(localStorage.getItem('load') === 'true')) {
      if (page === totalPages) {
        loadMoreBtn.classList.add('isHidden');
      }
    }
    fetchData(inputSearchValue, page)
      .then(respData => {
        showPictures(respData);
        lightbox.refresh();
      })
      .catch(error => console.log(error));
  }
};

const showPictures = async data => {
  const markup = data.hits
    .map(
      hit => `<div class="gallery-item">
    <figure>
      <a href="${hit.largeImageURL}"><img src="${hit.webformatURL}" alt="tags: ${hit.tags}" data-lazy-load-src="${hit.webformatURL}"/></a>
      <figcaption>
        <div><b>Comments</b>: ${hit.comments}</div>
        <div><b>Likes</b>: ${hit.likes}</div>
        <div><b>Views</b>: ${hit.views}</div>
        <div><b>Downloads</b>: ${hit.downloads}</div>
      </figcaption>
    </figure>
  </div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
};

const checkUserScroll = () => {
  if (JSON.parse(localStorage.getItem('load')) === true) {
    return;
  }
  const result =
    ((document.documentElement.scrollTop + window.innerHeight) /
      getPageHeight()) *
    100;

  // console.log(result);

  if (result > 70) {
    if (page != totalPages) {
      loadMore();
    }
  }

  // console.log(result);
  if (result >= 99) {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
};

const showModal = () => {
  modal.style.display = 'block';
};

const closeModal = () => {
  modal.style.display = 'none';
};

goTop.addEventListener('click', e => {
  e.preventDefault();

  window.scrollTo({ top: 0, behavior: 'smooth' });
});

searchBar.addEventListener('input', debounce(getData, 300));

window.addEventListener('scroll', debounce(checkUserScroll, 300));

window.addEventListener('scroll', () => {
  const showBtn =
    document.documentElement.scrollTop > 300
      ? goTop.classList.add('show')
      : goTop.classList.remove('show');
  showBtn;
});

btnSettings.addEventListener('click', showModal);
btnCloseModal.addEventListener('click', closeModal);

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

const saveSettings = data => {
  const hits = data.value;
  const dataJSON = JSON.stringify(data.value);

  if (data.type === 'load') {
    localStorage.setItem(data.type, dataJSON);
  }

  if (data.type === 'darkMode') {
    localStorage.setItem(data.type, dataJSON);
  }

  if (data.type === 'hits') {
    localStorage.setItem(data.type, hits);
  }
};

const loadSettings = () => {
  if (localStorage.getItem('darkMode') === null) {
    localStorage.setItem('darkMode', false);
  }
  setDarkMode();

  if (localStorage.getItem('load') === null) {
    localStorage.setItem('load', false);
  }

  if (localStorage.getItem('hits') === null) {
    localStorage.setItem('hits', 40);
  }

  darkbtn.checked = JSON.parse(localStorage.getItem('darkMode'));
  loadbtn.checked = JSON.parse(localStorage.getItem('load'));
};

const setDarkMode = () => {
  if (JSON.parse(localStorage.getItem('darkMode')) === true) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
};

window.addEventListener('load', () => {
  loadSettings();
});

loadbtn.addEventListener('click', e => {
  const setting = {
    type: e.target.name,
    value: e.target.checked,
  };

  saveSettings(setting);

  if (page !== totalPages) {
    loadMoreBtn.classList.remove('isHidden');
  }
  if (e.target.checked === false) {
    loadMoreBtn.classList.add('isHidden');
  }
});

selbtn.addEventListener('change', e => {
  console.log();
  const setting = {
    type: e.target.name,
    value: e.target.value,
  };

  saveSettings(setting);
  perPage = e.target.value;
  console.log(setting);
});

darkbtn.addEventListener('click', e => {
  const setting = {
    type: e.target.name,
    value: e.target.checked,
  };
  // console.log(setting);
  saveSettings(setting);
  setDarkMode();
});

loadMoreBtn.addEventListener('click', () => {
  if (page != totalPages) {
    if (page === totalPages) {
      loadMoreBtn.classList.add('isHidden');
    }
    // console.log(`current page is ${page} of ${totalPages}`);
    loadMore();
  }
});
