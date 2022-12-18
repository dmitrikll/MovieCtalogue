import { API_KEY } from './apiKey';
import { BASE_URL } from './baseUrl';
import getRefs from '../refs';
import fetchMovies from './fetchMovies';
import { markUpGallery, observer } from '../films';
import infiniteScroll, { scrollListener } from '../infiniteScroll';
const { containerPagination } = getRefs();
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

const searchForm = document.querySelector('.js-search__form');
const searchInput = document.querySelector('.search_input');
const filmGallery = document.querySelector('.film-gallery');

searchForm.addEventListener('submit', async (e, page = 1, per_page = 20) => {
  e.preventDefault();
  containerPagination.classList.add('hide');

  if (/^\s*$/.test(searchInput.value)) {
    searchInput.value = '';
    return;
  }
  // observer.disconnect();
  window.removeEventListener('scroll', scrollListener);
  filmGallery.innerHTML = '';

  //Place for spinner

  const fetchedMovies = await fetchMovies(searchInput.value, page);
  const genres = await axios(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  const total_results = await fetchedMovies.data.total_results;

  if (fetchedMovies.data.total_results === 0) {
    searchInput.value = '';

    Notify.warning(
      'Sorry, there are no movies matching your search query. Please try again.'
    );
    return;
  }
  Notify.success(
    `Hooray! We found ${fetchedMovies.data.total_results} movies.`
  );

  filmGallery.insertAdjacentHTML(
    'beforeend',
    markUpGallery(fetchedMovies.data.results, genres.data.genres)
  );
  // container.classList.add('hide') // для приховування стор. пагінації

  if (per_page * page >= total_results) {
    return;
  }

  infiniteScroll(searchInput.value, page, per_page);
  searchInput.value = '';
});
