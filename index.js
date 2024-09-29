const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//動態產生電影列表
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button 
          class="btn btn-info btn-add-favorite"
          data-id="${item.id}"
          >
          +
          </button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//加入我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//動態產生頁碼（依據電影數量）
function rendorPaginator(amount) {
  const numberOfPages = Math.ceil (amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages ; page++) {
    rawHTML +=`<li class="page-item"><a class="page-link" href="#" data-page = "${page}"> ${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//pagination 依據頁面取得對應的電影資料
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies //如果filteredmovies 不是空陣列,就顯示filteredmovies,如果是空陣列，就顯示movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex ,  startIndex + MOVIES_PER_PAGE)
}

//動態產生電影詳細資訊彈窗
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    //新增以下
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽paginator 確認點擊到哪頁
paginator.addEventListener('click' , function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number( event.target.dataset.page )
  renderMovieList(getMoviesByPage(page))
})

// 監聽 submit(搜尋按鈕)
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字 trim忽略空白格 toLowerCase自動轉換為小寫
  const keyword = searchInput.value.trim().toLowerCase()
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重新輸出至畫面
  rendorPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    rendorPaginator(movies.length)
    renderMovieList(getMoviesByPage(1)) //新增這裡
  })
  .catch((err) => console.log(err))

