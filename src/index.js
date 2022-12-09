import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const debounce = require('lodash.debounce');

const API_KEY = '31936057-7f7d0c6f748880506350ca56e';

const searchBar = document.querySelector('#search-box');
const gallery = document.querySelector('.gallery');

let perPage = 40;
let startPage = 1;

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
  let inputSearchValue = e.target.value;
  fetchData(inputSearchValue, startPage)
    .then(respData => {
      console.log('wywolanie fetchPictures respData', respData); // dziala
    })
    .catch(error => console.log(error));
}

searchBar.addEventListener('input', debounce(showPictures, 300));
