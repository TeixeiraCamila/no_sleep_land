// Página Poster Maker: monta o template, resolve chaves de env (OMDB/Cloudinary) e inicia a ferramenta (busca, preview, download/upload em PNG via html2canvas)
import "../assets/poster/style.css";

import { is_logged_in } from "../services/api.js";
import { poster_markup, render_poster } from "../views/poster.js";

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
  console.warn("[poster] chaves ausentes no .env da raiz:", missing_env_keys.join(", "));

// Inicializa a ferramenta: referencia os elementos do template e liga todos os eventos
// Busca OMDB e upload Cloudinary exigem usuário logado (guest apenas visualiza)
function init_poster(show_toast, logged_in) {
  const input_image = document.getElementById("input-image");
  const input_title = document.getElementById("input-title");
  const input_year = document.getElementById("input-year");
  const input_names = document.getElementById("input-names");
  const input_genre = document.getElementById("input-genre");
  const input_director = document.getElementById("input-director");
  const image_source = document.getElementById("image-source");

  const input_search = document.getElementById("input-search");
  const search_type = document.getElementById("search-type");
  const btn_search = document.getElementById("btn-search");
  const search_results = document.getElementById("search-results");
  const select_movie = document.getElementById("select-movie");

  const poster_image = document.getElementById("poster-image");
  const poster_title = document.getElementById("poster-title");
  const poster_year = document.getElementById("poster-year");
  const poster_names = document.getElementById("poster-names");
  const poster_genre = document.getElementById("poster-genre");
  const poster_creator = document.getElementById("poster-creator");

  const btn_preview = document.getElementById("btn-preview");
  const btn_download = document.getElementById("btn-download");
  const btn_upload = document.getElementById("btn-upload");
  const btn_copy = document.getElementById("btn-copy");
  const cloudinary_url = document.getElementById("cloudinary-url");
  const url_display = document.querySelector(".url-display");

  let current_image = null;

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
        poster_image.innerHTML = `<img src="${current_image}" class="poster__image-img" alt="Poster">`;
      }
    };
    reader.readAsDataURL(file);
  });

  // Sincroniza campos do form com o preview e esconde seções vazias
  function update_poster() {
    poster_title.textContent = input_title.value || "Title";
    const img = poster_image.querySelector("img");
    if (img)
      img.alt = input_title.value ? `${input_title.value} poster` : "Poster";

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
    // Busca no OMDB restrita a usuários logados
    if (!logged_in) {
      show_toast("Faça login para usar a busca de filmes.");
      return;
    }

    if (!env.OMDB_API_KEY) {
      show_toast("OMDB key not configured (.env)");
      return;
    }

    const query = input_search.value.trim();
    if (!query) return;

    search_results.classList.add("hidden");
    select_movie.innerHTML = '<option value="">Select...</option>';
    url_display.classList.add("hidden");

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
          select_movie.innerHTML = '<option value="">Select...</option>';
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
          show_toast("No results found");
          search_results.classList.add("hidden");
        }
      } catch (error) {
        console.error("Search error:", error);
        show_toast("Error searching");
      }
    }, 300);
  }

  btn_search.addEventListener("click", search_movies);
  input_search.addEventListener("keypress", function (e) {
    if (e.key === "Enter") search_movies();
  });

  // Preenche o form com os detalhes do filme selecionado
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
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      show_toast("Error loading movie details");
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
        poster_image.innerHTML = `<img src="${current_image}" class="poster__image-img" alt="Poster">`;
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
      show_toast("html2canvas not loaded");
      return;
    }

    const poster_element = document.getElementById("poster-preview");
    const original_text = btn_download.textContent;
    btn_download.disabled = true;
    btn_download.textContent = "Generating...";

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
        show_toast("Error generating poster. Please try again.");
      })
      .finally(() => {
        btn_download.disabled = false;
        btn_download.textContent = original_text;
      });
  });

  // Upload para Cloudinary e geração de URL compartilhável
  btn_upload.addEventListener("click", async function () {
    // Upload para Cloudinary restrito a usuários logados
    if (!logged_in) {
      show_toast("Faça login para fazer o upload do poster.");
      return;
    }

    if (!is_html2canvas_ready()) {
      show_toast("html2canvas not loaded");
      return;
    }

    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_UPLOAD_PRESET) {
      show_toast("Cloudinary not configured (.env)");
      return;
    }

    btn_upload.disabled = true;
    btn_upload.textContent = "Uploading...";

    try {
      const canvas = await html2canvas(
        document.getElementById("poster-preview"),
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
        cloudinary_url.value = data.secure_url;
        url_display.classList.remove("hidden");
      } else {
        show_toast("Upload failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      show_toast("Upload failed. Check console for details.");
    } finally {
      btn_upload.disabled = false;
      btn_upload.textContent = "Upload";
    }
  });

  // Copia a URL gerada para a área de transferência
  btn_copy.addEventListener("click", function () {
    navigator.clipboard.writeText(cloudinary_url.value);
    btn_copy.textContent = "Copied!";
    setTimeout(() => {
      btn_copy.textContent = "Copy";
    }, 2000);
  });
}

// Renderiza a página: layout + ferramenta, com chaves já resolvidas em build time
export function render_poster_page() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = render_poster(is_logged_in());

  // Injeta a ferramenta no container criado pelo render_main (padrão das outras páginas)
  const container = document.getElementById("poster-container");
  if (!container) return;
  container.innerHTML = poster_markup;

  const loading_el = document.getElementById("loading");
  if (loading_el) loading_el.classList.add("hidden");

  const toast = document.getElementById("toast");
  let toast_timeout = null;
  const show_toast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("toast--visible");
    clearTimeout(toast_timeout);
    toast_timeout = setTimeout(() => {
      toast.classList.remove("toast--visible");
    }, 3000);
  };

  init_poster(show_toast, is_logged_in());
}
