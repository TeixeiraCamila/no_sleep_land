// View Poster Maker: template do formulário de dados e do preview do pôster gerado
import { render_main } from "./content.js";

export const poster_markup = `
  <div class="poster-maker">
    <h1 class="app__title">Criador de Pôster</h1>

    <div class="poster__container">
      <div class="form">
        <h2 class="form__title">Dados do Pôster</h2>

        <div class="space-y-4">
          <div class="form__group">
            <label class="form__label" for="input-search">Buscar Filme</label>
            <div class="flex gap-2">
              <input
                type="text"
                id="input-search"
                placeholder="Digite o título do filme"
                class="form__input"
              />
              <select id="search-type" class="form__input search-type">
                <option value="movie">Filme</option>
                <option value="series">Série</option>
                <option value="episode">Episódio</option>
                <option value="all">Todos</option>
              </select>
              <button
                type="button"
                id="btn-search"
                class="form__button form__button--primary px-3"
              >
                Buscar
              </button>
            </div>
          </div>

          <div id="search-results" class="form__group hidden">
            <label class="form__label" for="select-movie">Resultados</label>
            <select id="select-movie" class="form__input">
              <option value="">Selecione um filme...</option>
            </select>
          </div>

          <hr class="my-4" />

          <div class="form__group">
            <label class="form__label" for="input-image">
              Imagem
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
            <label class="form__label" for="input-title">Título</label>
            <input
              type="text"
              id="input-title"
              placeholder="Título do Filme/Evento"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-year">Ano</label>
            <input
              type="text"
              id="input-year"
              placeholder="2024"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-names">Nomes (separados por vírgula)</label>
            <input
              type="text"
              id="input-names"
              placeholder="Nome 1, Nome 2, Nome 3"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-genre">Gênero</label>
            <input
              type="text"
              id="input-genre"
              placeholder="Ação, Drama, Comédia"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="input-director">Criado por</label>
            <input
              type="text"
              id="input-director"
              placeholder="Nome do diretor"
              class="form__input"
            />
          </div>
        </div>

        <div class="flex gap-4 mt-6 form__buttons">
          <button id="btn-preview" class="form__button form__button--primary">
            Pré-visualizar
          </button>
          <button
            id="btn-download"
            class="form__button form__button--secondary"
          >
            Baixar
          </button>
          <button id="btn-upload" class="form__button form__button--primary">
            Enviar
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
              Copiar
            </button>
          </div>
        </div>
      </div>

      <div>
        <div class="poster">
          <div id="poster-preview" class="poster__preview">
            <div id="poster-image" class="poster__image">
              <img src="" alt="Pôster" />
            </div>

            <div class="poster__info">
              <div class="poster__header">
                <h2 id="poster-title" class="poster__title">Título</h2>
                <span id="poster-year" class="poster__year">Ano</span>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">Gênero</p>
                <p id="poster-genre" class="poster__section-value">Gênero</p>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">Elenco</p>
                <p id="poster-names" class="poster__section-value">Nomes</p>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">criado por</p>
                <p id="poster-creator" class="poster__section-value">criador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  </div>
`;

// Layout da página: render_main cria o container onde a página injeta poster_markup
// page define a aba ativa na sidebar; o id do container é "poster-container"
export function render_poster(logged_in) {
  return render_main(logged_in, "poster", "poster-container");
}