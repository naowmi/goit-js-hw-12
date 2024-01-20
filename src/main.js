import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('.form');
const input = document.querySelector('.input');
const container = document.querySelector('.gallery');
const loaderMore = document.querySelector(".loader-more-btn")
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.button-load-more');
loadMoreBtnHide()
//? BACK-END PARAMS
const API_KEY = "41813550-341719f2cbf02751aeba3ddbd";
let query = '';
let page = 1; 
const perPage = 40; 
//? BACK-END PARAMS //

//! MODAL
let modal = new simpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});
//! MODAL //



//! BACK-END PARAMS 
const getSearchParams = () =>
  new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
  });

axios.defaults.baseURL = 'https://pixabay.com';
const url = `/api/`;
//! BACK-END PARAMS //


//* SUBMIT FORM
form.addEventListener('submit', async event => {
  event.preventDefault();
  page = 1; 
  clearContainer()
  loadMoreBtnHide()
  query = input.value.trim(); 

  if (query === '') return iziToast.info({
        timeout: 5000,
        title: "info",
        message:
          'Sorry, but you need to write at least one character!',
        position: 'topRight',
      });; 
  loaderShow()
  input.value = ''; 

  try {
    const response = await axios.get(url, {
      params: getSearchParams(),
    });

    loaderHide()
    const data = response.data;
    if (data.hits.length === 0) {
      iziToast.error({
        timeout: 5000,
        title: "Error",
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    }

     //? RENDER MARKUP
    renderMarkup(data.hits)

    if (data.hits.length >= perPage) {
      loadMoreBtnShow()
    }
    modal.refresh();
  } catch (error) {
    loader.style.display = 'none';
    iziToast.error({
      timeout: 5000,
      title: "Error",
      message: error.message,
      position: 'topRight',
    });
    console.error('Error when receiving data:', error);
  }
});
//* SUBMIT FORM //

//? LOAD MORE
loadMoreBtn.addEventListener('click', async () => {
  loaderMoreShow()

  page += 1;

  try {
    const response = await axios.get(url, {
      params: getSearchParams(),
    });

    loaderMoreHide()
    const data = response.data;

    if (page >= Math.ceil(data.totalHits / perPage)) {
      loadMoreBtnHide()
      iziToast.error({
        timeout: 5000,
         title: "Error",
        message: "You've reached the end of search results",
        position: 'topRight'
      });
    }
    //? RENDER MARKUP
    renderMarkup(data.hits)

    scrollImages();

    modal.refresh();
  } catch (error) {
    loaderMoreHide()
    iziToast.error({
      timeout: 5000,
      title: "Error",
      message: error.message,
      position: "topRight",
    });
    console.error('Error fetching more data:', error);
  }
});

const scrollImages = () => {
  const galleryItem = document.querySelector('.gallery-item');

  const galleryItemHeight = galleryItem.getBoundingClientRect().height;

  window.scrollBy({
    top: galleryItemHeight * 3,
    behavior: 'smooth',
  });
};

//? CLEAR CONTAINER
const clearContainer = () => {
  container.innerHTML = "";
}

//! LOADER SHOW AND HIDE
function loaderShow() {
loader.style.display = 'block';
}
function loaderHide() {
  loader.style.display = 'none';
}
function loaderMoreShow() {
  loaderMore.style.display = 'block'
}
function loaderMoreHide() {
  loaderMore.style.display = "none"
}


//! LOAD MORE BUTTON
function loadMoreBtnShow() {
  loadMoreBtn.style.display = 'block';
}
function loadMoreBtnHide() {
  loadMoreBtn.style.display = 'none';
}

//! RENDER MARKUP
function renderMarkup(data) {
const markup = data.reduce(
      (
        acc,
        { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
      ) =>
        acc +
        `<li class="gallery-item">
          <a href="${largeImageURL}">
           <img class="gallery-image" src="${webformatURL}" alt="${tags}"
           />
          </a>         
          <div class="card-container">
            <p class="p-item">Likes:<span class="span-item">${likes}</span></p>
            <p>Views:<span class="span-item">${views}</span></p>
            <p>Comments:<span class="span-item">${comments}</span></p>
            <p>Downloads:<span class="span-item">${downloads}</span></p>
          </div> 
        </li>`,
      ''
  );
  container.insertAdjacentHTML('beforeend', markup);
}
    