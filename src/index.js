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

let perPage = 40;
let page = 1;
let inputSearchValue, totalPages;

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
        // console.log('wywolanie fetchPictures respData', respData);

        let picsInArray = respData.hits.length;

        if (picsInArray === 0) {
          Notiflix.Notify.warning(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        } else {
          showPictures(respData);
          lightbox.refresh();
        }
      })
      .catch(error => console.log(error));
  }
};

const loadMore = () => {
  if (page === totalPages) {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  } else {
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
  const result =
    ((document.documentElement.scrollTop + window.innerHeight) /
      getPageHeight()) *
    100;

  // console.log(result);

  if (result > 70) {
    if (page != totalPages) {
      ++page;
      // console.log(`current page is ${page} of ${totalPages}`);
      loadMore();
    }
    return;
  }
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
