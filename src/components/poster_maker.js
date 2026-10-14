// Gerador de pôster embutido no formulário: busca OMDB, preview e upload no Cloudinary
// Adaptado do Poster Maker (#/poster); devolve a URL da capa via callback on_upload

// Chaves consumidas em runtime; sem elas a busca OMDB e o upload ficam indisponíveis
const ENV_KEYS = [
  "VITE_OMDB_API_KEY",
  "VITE_CLOUDINARY_CLOUD_NAME",
  "VITE_CLOUDINARY_UPLOAD_PRESET",
];

// Variáveis resolvidas em build/dev a partir do .env da raiz via import.meta.env
// (mesmo padrão de services/api.js: VITE_API_URL); avisa no console se faltarem
const env = {
  OMDB_API_KEY: import.meta.env.VITE_OMDB_API_KEY,
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

const missing_env_keys = ENV_KEYS.filter((key) => !import.meta.env[key]);
if (missing_env_keys.length)
  console.warn("[poster_form] chaves ausentes no .env da raiz:", missing_env_keys.join(", "));

// Markup embutível: sem atributos name nos inputs para não poluir o FormData do form
// (os estilos aplicam via wrapper .poster-maker, mesmo escopo do #/poster)
export const poster_tool_markup = `
  <div id="poster-tool" class="poster-maker hidden border-t border-gray-800 mt-6">
    <div class="poster__container">
      <div class="form">
        <h2 class="form__title">Gerador de Pôster</h2>

        <div class="space-y-4">
          <div class="form__group">
            <label class="form__label" for="poster-input-search">Buscar Filme</label>
            <div class="flex gap-2">
              <input
                type="text"
                id="poster-input-search"
                placeholder="Digite o título do filme"
                class="form__input"
              />
              <select id="poster-search-type" class="form__input search-type">
                <option value="series">Série</option>
                <option value="movie">Filme</option>
                <option value="episode">Episódio</option>
                <option value="all">Todos</option>
              </select>
              <button
                type="button"
                id="poster-btn-search"
                class="form__button form__button--primary px-3"
              >
                Buscar
              </button>
            </div>
          </div>

          <div id="poster-search-results" class="form__group hidden">
            <label class="form__label" for="poster-select-movie">Resultados</label>
            <select id="poster-select-movie" class="form__input">
              <option value="">Selecione um filme...</option>
            </select>
          </div>

          <hr class="my-4" />

          <div class="form__group">
            <label class="form__label" for="poster-input-image">
              Imagem
              <span id="poster-image-source" class="text-xs font-normal text-gray-500 ml-1"></span>
            </label>
            <input
              type="file"
              id="poster-input-image"
              accept="image/*"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="poster-input-title">Título</label>
            <input
              type="text"
              id="poster-input-title"
              placeholder="Título do Filme/Evento"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="poster-input-year">Ano</label>
            <input
              type="text"
              id="poster-input-year"
              placeholder="2024"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="poster-input-names">Nomes (separados por vírgula)</label>
            <input
              type="text"
              id="poster-input-names"
              placeholder="Nome 1, Nome 2, Nome 3"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="poster-input-genre">Gênero</label>
            <input
              type="text"
              id="poster-input-genre"
              placeholder="Ação, Drama, Comédia"
              class="form__input"
            />
          </div>

          <div class="form__group">
            <label class="form__label" for="poster-input-director">Criado por</label>
            <input
              type="text"
              id="poster-input-director"
              placeholder="Nome do diretor"
              class="form__input"
            />
          </div>
        </div>

        <div class="flex gap-4 mt-6 form__buttons">
          <button type="button" id="poster-btn-preview" class="form__button form__button--primary">
            Pré-visualizar
          </button>
          <button type="button" id="poster-btn-download" class="form__button form__button--secondary">
            Baixar
          </button>
          <button type="button" id="poster-btn-upload" class="form__button form__button--primary">
            Enviar
          </button>
        </div>
      </div>

      <div>
        <div class="poster">
          <div id="poster-preview" class="poster__preview">
            <div id="poster-tool-image" class="poster__image">
              <img src="" alt="Pôster" />
            </div>

            <div class="poster__info">
              <div class="poster__header">
                <h2 id="poster-tool-title" class="poster__title">Título</h2>
                <span id="poster-tool-year" class="poster__year">Ano</span>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">Gênero</p>
                <p id="poster-tool-genre" class="poster__section-value">Gênero</p>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">Elenco</p>
                <p id="poster-tool-names" class="poster__section-value">Nomes</p>
              </div>

              <div class="poster__section">
                <p class="poster__section-label">criado por</p>
                <p id="poster-tool-creator" class="poster__section-value">criador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="poster-tool-toast" class="toast" role="status" aria-live="polite"></div>
  </div>
`;

// Inicializa a ferramenta embutida e devolve open(query) para revelar com o Nome como input
// on_upload recebe a secure_url do Cloudinary para preencher a capa do form
// on_details recebe o objeto completo da OMDB (ex.: Plot) para preencher campos do form
export function init_poster_tool(on_upload, on_details) {
  const tool = document.getElementById("poster-tool");
  if (!tool) return { open: () => {} };

  const input_image = tool.querySelector("#poster-input-image");
  const input_title = tool.querySelector("#poster-input-title");
  const input_year = tool.querySelector("#poster-input-year");
  const input_names = tool.querySelector("#poster-input-names");
  const input_genre = tool.querySelector("#poster-input-genre");
  const input_director = tool.querySelector("#poster-input-director");
  const image_source = tool.querySelector("#poster-image-source");

  const input_search = tool.querySelector("#poster-input-search");
  const search_type = tool.querySelector("#poster-search-type");
  const btn_search = tool.querySelector("#poster-btn-search");
  const search_results = tool.querySelector("#poster-search-results");
  const select_movie = tool.querySelector("#poster-select-movie");

  const poster_image = tool.querySelector("#poster-tool-image");
  const poster_title = tool.querySelector("#poster-tool-title");
  const poster_year = tool.querySelector("#poster-tool-year");
  const poster_names = tool.querySelector("#poster-tool-names");
  const poster_genre = tool.querySelector("#poster-tool-genre");
  const poster_creator = tool.querySelector("#poster-tool-creator");

  const btn_preview = tool.querySelector("#poster-btn-preview");
  const btn_download = tool.querySelector("#poster-btn-download");
  const btn_upload = tool.querySelector("#poster-btn-upload");

  let current_image = null;

  const toast_el = tool.querySelector("#poster-tool-toast");
  let toast_timeout = null;
  const show_toast = (message) => {
    if (!toast_el) return;
    toast_el.textContent = message;
    toast_el.classList.add("toast--visible");
    clearTimeout(toast_timeout);
    toast_timeout = setTimeout(() => {
      toast_el.classList.remove("toast--visible");
    }, 3000);
  };

  // Enter dentro da ferramenta não deve submeter o form principal
  tool.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "file") {
      e.preventDefault();
    }
  });

  // Upload de imagem local: carrega o arquivo como base64 para o preview
  input_image.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    image_source.textContent = "(local)";
    const reader = new FileReader();
    reader.onload = function (e) {
      current_image = e.target.result;
      const img = poster_image.querySelector("img");
      if (img) {
        img.src = current_image;
        img.className = "poster__image-img";
      } else {
        poster_image.innerHTML = `<img src="${current_image}" class="poster__image-img" alt="Pôster">`;
      }
    };
    reader.readAsDataURL(file);
  });

  // Sincroniza campos com o preview e esconde seções vazias
  function update_poster() {
    poster_title.textContent = input_title.value || "Título";
    const img = poster_image.querySelector("img");
    if (img)
      img.alt = input_title.value ? `${input_title.value} pôster` : "Pôster";

    if (input_year.value) {
      poster_year.parentElement.style.display = "";
      poster_year.textContent = input_year.value;
    } else {
      poster_year.parentElement.style.display = "none";
    }

    if (input_genre.value) {
      poster_genre.style.display = "";
      poster_genre.textContent = input_genre.value;
    } else {
      poster_genre.style.display = "none";
    }

    const names_section = poster_names.closest(".poster__section");
    if (input_names.value) {
      names_section.style.display = "";
      poster_names.textContent = input_names.value;
    } else {
      names_section.style.display = "none";
    }

    const director_section = poster_creator.closest(".poster__section");
    if (input_director.value) {
      director_section.style.display = "";
      poster_creator.textContent = input_director.value;
    } else {
      director_section.style.display = "none";
    }
  }

  input_title.addEventListener("input", update_poster);
  input_year.addEventListener("input", update_poster);
  input_names.addEventListener("input", update_poster);
  input_genre.addEventListener("input", update_poster);
  input_director.addEventListener("input", update_poster);
  btn_preview.addEventListener("click", update_poster);

  // Busca OMDB com debounce e filtro por tipo
  let search_timeout = null;
  let all_results = [];

  function search_movies() {
    if (!env.OMDB_API_KEY) {
      show_toast("Chave OMDB não configurada (.env)");
      return;
    }

    const query = input_search.value.trim();
    if (!query) return;

    search_results.classList.add("hidden");
    select_movie.innerHTML = '<option value="">Selecione...</option>';

    clearTimeout(search_timeout);
    search_timeout = setTimeout(async () => {
      const selected_type = search_type.value;
      const types =
        selected_type === "all"
          ? ["movie", "series", "episode"]
          : [selected_type];
      all_results = [];

      try {
        const requests = types.map(async (type) => {
          const response = await fetch(
            `https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=${type}`,
          );
          return response.json();
        });

        const results = await Promise.all(requests);
        results.forEach((data) => {
          if (data.Response === "True" && data.Search) {
            all_results = all_results.concat(data.Search);
          }
        });

        if (all_results.length > 0) {
          all_results.sort((a, b) => a.Title.localeCompare(b.Title));
          select_movie.innerHTML = '<option value="">Selecione...</option>';
          all_results.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.imdbID;
            const type_label =
              item.Type === "series"
                ? "📺"
                : item.Type === "episode"
                  ? "📡"
                  : "🎬";
            option.textContent = `${type_label} ${item.Title} (${item.Year})`;
            select_movie.appendChild(option);
          });
          search_results.classList.remove("hidden");
        } else {
          show_toast("Nenhum resultado encontrado");
          search_results.classList.add("hidden");
        }
      } catch (error) {
        console.error("Search error:", error);
        show_toast("Erro na busca");
      }
    }, 300);
  }

  btn_search.addEventListener("click", search_movies);
  input_search.addEventListener("keydown", function (e) {
    if (e.key === "Enter") search_movies();
  });

  // Preenche os campos com os detalhes do filme selecionado
  select_movie.addEventListener("change", function () {
    if (this.value) fetch_movie_details(this.value);
  });

  async function fetch_movie_details(imdb_id) {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&i=${imdb_id}&plot=full`,
      );
      const data = await response.json();

      if (data.Response === "True") {
        input_title.value = data.Title && data.Title !== "N/A" ? data.Title : "";
        input_year.value =
          data.Year && data.Year !== "N/A" ? data.Year.split("–")[0] : "";
        input_genre.value = data.Genre && data.Genre !== "N/A" ? data.Genre : "";

        let director_value =
          data.Director && data.Director !== "N/A" ? data.Director : "";
        if (!director_value && data.Writer && data.Writer !== "N/A") {
          director_value = data.Writer;
        }
        input_director.value = director_value;
        input_names.value =
          data.Actors && data.Actors !== "N/A" ? data.Actors : "";

        if (data.Poster && data.Poster !== "N/A") load_poster_image(data.Poster);
        update_poster();

        // Entrega os detalhes brutos ao form (Plot etc.); quem decide o que usar é o chamador
        if (typeof on_details === "function") on_details(data);
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      show_toast("Erro ao carregar detalhes do filme");
    }
  }

  // Carrega imagem externa via canvas para evitar problemas de CORS
  function load_poster_image(url) {
    image_source.textContent = "(API)";
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      current_image = canvas.toDataURL("image/jpeg");

      const img_element = poster_image.querySelector("img");
      if (img_element) {
        img_element.src = current_image;
        img_element.className = "poster__image-img";
      } else {
        poster_image.innerHTML = `<img src="${current_image}" class="poster__image-img" alt="Pôster">`;
      }
    };
    img.onerror = function () {
      console.error("Failed to load image:", url);
    };
    img.src = url;
  }

  function is_html2canvas_ready() {
    return typeof html2canvas === "function";
  }

  // Download do poster como PNG em 2x via html2canvas
  btn_download.addEventListener("click", function () {
    if (!is_html2canvas_ready()) {
      show_toast("html2canvas não carregado");
      return;
    }

    const poster_element = tool.querySelector("#poster-preview");
    const original_text = btn_download.textContent;
    btn_download.disabled = true;
    btn_download.textContent = "Gerando...";

    html2canvas(poster_element, {
      backgroundColor: "#D9D9D9",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = `${input_title.value || "poster"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((err) => {
        console.error("Error generating poster:", err);
        show_toast("Erro ao gerar o pôster. Tente novamente.");
      })
      .finally(() => {
        btn_download.disabled = false;
        btn_download.textContent = original_text;
      });
  });

  // Upload para Cloudinary: ao sucesso, entrega a URL para o form preencher a capa
  btn_upload.addEventListener("click", async function () {
    if (!is_html2canvas_ready()) {
      show_toast("html2canvas não carregado");
      return;
    }

    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_UPLOAD_PRESET) {
      show_toast("Cloudinary não configurado (.env)");
      return;
    }

    btn_upload.disabled = true;
    btn_upload.textContent = "Enviando...";

    try {
      const canvas = await html2canvas(
        tool.querySelector("#poster-preview"),
        {
          backgroundColor: "#D9D9D9",
          scale: 2,
          useCORS: true,
          allowTaint: true,
        },
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );

      const form_data = new FormData();
      form_data.append("file", blob);
      form_data.append("upload_preset", env.CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: form_data },
      );
      const data = await res.json();

      if (data.secure_url) {
        if (typeof on_upload === "function") on_upload(data.secure_url);
        show_toast("Pôster enviado! Capa preenchida.");
      } else {
        show_toast("Falha no envio: " + (data.error?.message || "Erro desconhecido"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      show_toast("Falha no envio. Verifique o console para detalhes.");
    } finally {
      btn_upload.disabled = false;
      btn_upload.textContent = "Enviar";
    }
  });

  // Revela a ferramenta usando a query (Nome do form) como busca e título inicial
  function open(query) {
    tool.classList.remove("hidden");
    if (query) {
      input_search.value = query;
      if (!input_title.value) input_title.value = query;
      update_poster();
      search_movies();
    }
    tool.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return { open };
}
