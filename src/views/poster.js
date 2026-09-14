import { renderMain } from "./content.js";

export const posterMarkup = `
  <div class="poster-maker">
    <h1 class="app__title">Poster Maker</h1>

    <div class="poster__container">
      <div class="form">
        <h2 class="form__title">Poster Data</h2>

        <div class="space-y-4">
          <div class="form__group">
            <label class="form__label" for="input-search">Search Movie</label>
            <div class="flex gap-2">
              <input
                type="text"
                id="input-search"
                placeholder="Enter movie title"
                class="form__input"
              />
              <select id="search-type" class="form__input search-type">
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="episode">Episode</option>
                <option value="all">All</option>
              </select>
              <button
                type="button"
                id="btn-search"
                class="form__button form__button--primary px-3"
              >
                Search
              </button>
            </div>
          </div>

          <div id="search-results" class="form__group hidden">
            <label class="form__label" for="select-movie">Results</label>
            <select id="select-movie" class="form__input">
              <option value="">Select a movie...</option>
            </select>
          </div>

          <hr class="my-4" />

          <div class="form__group">
            <label class="form__label" for="input-image">
              Image
              <span id="image-source" class="text-xs font-normal text-gray-500 ml-1"></span>
            </label>
            <input
              type="file"
              id="input-image"
              accept="image/*"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-title">Title</label>
            <input
              type="text"
              id="input-title"
              placeholder="Movie/Event Title"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-year">Year</label>
            <input
              type="text"
              id="input-year"
              placeholder="2024"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-names">Names (comma separated)</label>
            <input
              type="text"
              id="input-names"
              placeholder="Name 1, Name 2, Name 3"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-genre">Genre</label>
            <input
              type="text"
              id="input-genre"
              placeholder="Action, Drama, Comedy"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-director">Created by</label>
            <input
              type="text"
              id="input-director"
              placeholder="Director name"
              class="form__input"
            />
          </div>
        </div>

        <div class="flex gap-4 mt-6 form__buttons">
          <button id="btn-preview" class="form__button form__button--primary">
            Preview
          </button>
          <button
            id="btn-download"
            class="form__button form__button--secondary"
          >
            Download
          </button>
          <button id="btn-upload" class="form__button form__button--primary">
            Upload
          </button>
        </div>

        <div class="url-display hidden">
          <label class="form__label">URL</label>
          <div class="url-display__row">
            <input
              type="text"
              id="cloudinary-url"
              class="form__input"
              readonly
            />
            <button id="btn-copy" class="form__button form__button--copy">
              Copy
            </button>
          </div>
        </div>
      </div>

      <div>
        <div class="poster">
          <div id="poster-preview" class="poster__preview">
            <div id="poster-image" class="poster__image">
              <img src="" alt="Poster" />
            </div>

            <div class="poster__info">
              <div class="poster__header">
                <h2 id="poster-title" class="poster__title">Title</h2>
                <span id="poster-year" class="poster__year">Year</span>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">Genre</p>
                <p id="poster-genre" class="poster__section-value">Genre</p>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">Cast</p>
                <p id="poster-names" class="poster__section-value">Names</p>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">created by</p>
                <p id="poster-creator" class="poster__section-value">creator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  </div>
`;

// Layout da página: renderMain cria o container onde a página injeta posterMarkup
// page define a aba ativa na sidebar; o id do container é "poster-container"
export function renderPoster(loggedIn) {
  return renderMain(loggedIn, "poster", "poster-container");
}