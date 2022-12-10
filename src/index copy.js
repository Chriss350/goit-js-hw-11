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

let perPage = 40;
let startPage = 1;
let inputSearchValue;

lazyLoadImages.init();

async function fetchData(input, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${input}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.log('deklaracja fetchPictures ,async/await, error:', error.message);
  }
}

async function showPictures(e) {
  inputSearchValue = e.target.value;
  fetchData(inputSearchValue, startPage)
    .then(respData => {
      console.log('wywolanie fetchPictures respData', respData); // dziala

      let picsInArray = respData.hits.length;

      if (picsInArray === 0) {
        Notiflix.Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        createGallery(respData);

        const lightbox = new SimpleLightbox('.gallery a', {
          captionsData: 'alt',
          captionDelay: 250,
          scrollZoom: false,
        });
      }
    })
    .catch(error => console.log(error));
}

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

function getScrollTop() {
  return window.pageYOffset !== undefined
    ? window.pageYOffset
    : (document.documentElement || document.body.parentNode || document.body)
        .scrollTop;
}

const nextPage = (input, page) => {
  fetchData(input, page);
  console.log('next page');
  showPictures(input);
};

const createGallery = data => {
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

  gallery.innerHTML = markup;
};

const getSearchValue = () => {
  console.log(searchBar.value);
};

// searchBar.addEventListener('input', debounce(showPictures, 300));
searchBar.addEventListener('input', debounce(getSearchValue, 300));

window.onscroll = () => {
  if (getScrollTop() < getPageHeight() - window.innerHeight) return;
  startPage += 1;
  nextPage(inputSearchValue, startPage);
};
