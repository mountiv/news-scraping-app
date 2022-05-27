function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
      
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
      
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
      
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });
      
        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });
      
        xhr.send();
        
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
      
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
      
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
      
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });
      
        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if(headers) {
          Object.entries(headers).forEach(([key, val]) => {
            xhr.setRequestHeader(key, val);
          });
        }
      
        xhr.send(JSON.stringify(body));
        
      } catch (error) {
        cb(error);
      }
    }
  }
}

const http = customHttp();

const newService = (function () {
  const apiKey = 'd799980c70664560bd375676f5295c78';
  const apiURL = 'https://newsapi.org/v2';

  return {
    topHeadlineNews(country = 'ru', cb) {
      http.get(`${apiURL}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everythingNews(query, cb) {
      http.get(`${apiURL}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

// Elements
const newsContainer = document.querySelector('.news-container .row');
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  leadNews();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  leadNews();
});

function leadNews() {
  const country = countrySelect.value;
  const search = searchInput.value;

  if (!search) {
    newService.topHeadlineNews(country, onGetResponce);
  } else {
    newService.everythingNews(search, onGetResponce);
  }
};

function onGetResponce(err, res) {
  if(err) {
    showAlert(err, 'error-msg');
  }
  if(!res.articles.length) {
    clearNewsContainer(newsContainer);
    emptyLoadItemTemplate();
    return;
  }
  renderNews(res.articles);
}

function renderNews(news) {
  let fragment = '';

  if(newsContainer.children.length) {
    clearNewsContainer(newsContainer);
  }

  news.forEach(newsItem => {
    let el = getItemTemplateNews(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

function getItemTemplateNews({ urlToImage, title, description, url }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Перейти к новости</a>
        </div>
      </div>
    </div>
  `;
}

function clearNewsContainer(container) {
  let children = container.lastElementChild;

  while(children) {
    container.removeChild(children);
    children = container.lastElementChild;
  }
}

function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type});
}

function emptyLoadItemTemplate() {
  newsContainer.insertAdjacentHTML("afterbegin", `
  <div class="col s12 m7">
    <h2 class="header">Новостей нет</h2>
    <div class="card horizontal">
      <div class="card-stacked">
        <div class="card-content">
          <p>Новостей с запросом  не найдено. Попробуйте другой запрос</p>
        </div>
      </div>
    </div>
  </div>
  `);
}