// Página Poster Maker: monta o template, resolve chaves de env (OMDB/Cloudinary) e inicia a ferramenta (busca, preview, download/upload em PNG via html2canvas)
import "../assets/poster/style.css";

import { isLoggedIn } from "../services/api.js";
import { posterMarkup, renderPoster } from "../views/poster.js";

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

const missingEnvKeys = ENV_KEYS.filter((key) => !import.meta.env[key]);
if (missingEnvKeys.length)
  console.warn("[poster] chaves ausentes no .env da raiz:", missingEnvKeys.join(", "));

// Inicializa a ferramenta: referencia os elementos do template e liga todos os eventos
// Busca OMDB e upload Cloudinary exigem usuário logado (guest apenas visualiza)
function initPoster(showToast, loggedIn) {
  const inputImage = document.getElementById("input-image");
  const inputTitle = document.getElementById("input-title");
  const inputYear = document.getElementById("input-year");
  const inputNames = document.getElementById("input-names");
  const inputGenre = document.getElementById("input-genre");
  const inputDirector = document.getElementById("input-director");
  const imageSource = document.getElementById("image-source");

  const inputSearch = document.getElementById("input-search");
  const searchType = document.getElementById("search-type");
  const btnSearch = document.getElementById("btn-search");
  const searchResults = document.getElementById("search-results");
  const selectMovie = document.getElementById("select-movie");

  const posterImage = document.getElementById("poster-image");
  const posterTitle = document.getElementById("poster-title");
  const posterYear = document.getElementById("poster-year");
  const posterNames = document.getElementById("poster-names");
  const posterGenre = document.getElementById("poster-genre");
  const posterCreator = document.getElementById("poster-creator");

  const btnPreview = document.getElementById("btn-preview");
  const btnDownload = document.getElementById("btn-download");
  const btnUpload = document.getElementById("btn-upload");
  const btnCopy = document.getElementById("btn-copy");
  const cloudinaryUrl = document.getElementById("cloudinary-url");
  const urlDisplay = document.querySelector(".url-display");

  let currentImage = null;

  // Upload de imagem local: carrega o arquivo como base64 para o preview
  inputImage.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    imageSource.textContent = "(local)";
    const reader = new FileReader();
    reader.onload = function (e) {
      currentImage = e.target.result;
      const img = posterImage.querySelector("img");
      if (img) {
        img.src = currentImage;
        img.className = "poster__image-img";
      } else {
        posterImage.innerHTML = `<img src="${currentImage}" class="poster__image-img" alt="Poster">`;
      }
    };
    reader.readAsDataURL(file);
  });

  // Sincroniza campos do form com o preview e esconde seções vazias
  function updatePoster() {
    posterTitle.textContent = inputTitle.value || "Title";
    const img = posterImage.querySelector("img");
    if (img)
      img.alt = inputTitle.value ? `${inputTitle.value} poster` : "Poster";

    if (inputYear.value) {
      posterYear.parentElement.style.display = "";
      posterYear.textContent = inputYear.value;
    } else {
      posterYear.parentElement.style.display = "none";
    }

    if (inputGenre.value) {
      posterGenre.style.display = "";
      posterGenre.textContent = inputGenre.value;
    } else {
      posterGenre.style.display = "none";
    }

    const namesSection = posterNames.closest(".poster__section");
    if (inputNames.value) {
      namesSection.style.display = "";
      posterNames.textContent = inputNames.value;
    } else {
      namesSection.style.display = "none";
    }

    const directorSection = posterCreator.closest(".poster__section");
    if (inputDirector.value) {
      directorSection.style.display = "";
      posterCreator.textContent = inputDirector.value;
    } else {
      directorSection.style.display = "none";
    }
  }

  inputTitle.addEventListener("input", updatePoster);
  inputYear.addEventListener("input", updatePoster);
  inputNames.addEventListener("input", updatePoster);
  inputGenre.addEventListener("input", updatePoster);
  inputDirector.addEventListener("input", updatePoster);
  btnPreview.addEventListener("click", updatePoster);

  // Busca OMDB com debounce e filtro por tipo
  let searchTimeout = null;
  let allResults = [];

  function searchMovies() {
    // Busca no OMDB restrita a usuários logados
    if (!loggedIn) {
      showToast("Faça login para usar a busca de filmes.");
      return;
    }

    if (!env.OMDB_API_KEY) {
      showToast("OMDB key not configured (.env)");
      return;
    }

    const query = inputSearch.value.trim();
    if (!query) return;

    searchResults.classList.add("hidden");
    selectMovie.innerHTML = '<option value="">Select...</option>';
    urlDisplay.classList.add("hidden");

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const selectedType = searchType.value;
      const types =
        selectedType === "all"
          ? ["movie", "series", "episode"]
          : [selectedType];
      allResults = [];

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
            allResults = allResults.concat(data.Search);
          }
        });

        if (allResults.length > 0) {
          allResults.sort((a, b) => a.Title.localeCompare(b.Title));
          selectMovie.innerHTML = '<option value="">Select...</option>';
          allResults.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.imdbID;
            const typeLabel =
              item.Type === "series"
                ? "📺"
                : item.Type === "episode"
                  ? "📡"
                  : "🎬";
            option.textContent = `${typeLabel} ${item.Title} (${item.Year})`;
            selectMovie.appendChild(option);
          });
          searchResults.classList.remove("hidden");
        } else {
          showToast("No results found");
          searchResults.classList.add("hidden");
        }
      } catch (error) {
        console.error("Search error:", error);
        showToast("Error searching");
      }
    }, 300);
  }

  btnSearch.addEventListener("click", searchMovies);
  inputSearch.addEventListener("keypress", function (e) {
    if (e.key === "Enter") searchMovies();
  });

  // Preenche o form com os detalhes do filme selecionado
  selectMovie.addEventListener("change", function () {
    if (this.value) fetchMovieDetails(this.value);
  });

  async function fetchMovieDetails(imdbId) {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&i=${imdbId}&plot=full`,
      );
      const data = await response.json();

      if (data.Response === "True") {
        inputTitle.value = data.Title && data.Title !== "N/A" ? data.Title : "";
        inputYear.value =
          data.Year && data.Year !== "N/A" ? data.Year.split("–")[0] : "";
        inputGenre.value = data.Genre && data.Genre !== "N/A" ? data.Genre : "";

        let directorValue =
          data.Director && data.Director !== "N/A" ? data.Director : "";
        if (!directorValue && data.Writer && data.Writer !== "N/A") {
          directorValue = data.Writer;
        }
        inputDirector.value = directorValue;
        inputNames.value =
          data.Actors && data.Actors !== "N/A" ? data.Actors : "";

        if (data.Poster && data.Poster !== "N/A") loadPosterImage(data.Poster);
        updatePoster();
      }
    } catch (error) {
      console.error("Error fetching movie:", error);
      showToast("Error loading movie details");
    }
  }

  // Carrega imagem externa via canvas para evitar problemas de CORS
  function loadPosterImage(url) {
    imageSource.textContent = "(API)";
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      currentImage = canvas.toDataURL("image/jpeg");

      const imgElement = posterImage.querySelector("img");
      if (imgElement) {
        imgElement.src = currentImage;
        imgElement.className = "poster__image-img";
      } else {
        posterImage.innerHTML = `<img src="${currentImage}" class="poster__image-img" alt="Poster">`;
      }
    };
    img.onerror = function () {
      console.error("Failed to load image:", url);
    };
    img.src = url;
  }

  function isHtml2canvasReady() {
    return typeof html2canvas === "function";
  }

  // Download do poster como PNG em 2x via html2canvas
  btnDownload.addEventListener("click", function () {
    if (!isHtml2canvasReady()) {
      showToast("html2canvas not loaded");
      return;
    }

    const posterElement = document.getElementById("poster-preview");
    const originalText = btnDownload.textContent;
    btnDownload.disabled = true;
    btnDownload.textContent = "Generating...";

    html2canvas(posterElement, {
      backgroundColor: "#D9D9D9",
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = `${inputTitle.value || "poster"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((err) => {
        console.error("Error generating poster:", err);
        showToast("Error generating poster. Please try again.");
      })
      .finally(() => {
        btnDownload.disabled = false;
        btnDownload.textContent = originalText;
      });
  });

  // Upload para Cloudinary e geração de URL compartilhável
  btnUpload.addEventListener("click", async function () {
    // Upload para Cloudinary restrito a usuários logados
    if (!loggedIn) {
      showToast("Faça login para fazer o upload do poster.");
      return;
    }

    if (!isHtml2canvasReady()) {
      showToast("html2canvas not loaded");
      return;
    }

    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_UPLOAD_PRESET) {
      showToast("Cloudinary not configured (.env)");
      return;
    }

    btnUpload.disabled = true;
    btnUpload.textContent = "Uploading...";

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

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", env.CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (data.secure_url) {
        cloudinaryUrl.value = data.secure_url;
        urlDisplay.classList.remove("hidden");
      } else {
        showToast("Upload failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Upload failed. Check console for details.");
    } finally {
      btnUpload.disabled = false;
      btnUpload.textContent = "Upload";
    }
  });

  // Copia a URL gerada para a área de transferência
  btnCopy.addEventListener("click", function () {
    navigator.clipboard.writeText(cloudinaryUrl.value);
    btnCopy.textContent = "Copied!";
    setTimeout(() => {
      btnCopy.textContent = "Copy";
    }, 2000);
  });
}

// Renderiza a página: layout + ferramenta, com chaves já resolvidas em build time
export function renderPosterPage() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = renderPoster(isLoggedIn());

  // Injeta a ferramenta no container criado pelo renderMain (padrão das outras páginas)
  const container = document.getElementById("poster-container");
  if (!container) return;
  container.innerHTML = posterMarkup;

  const loadingEl = document.getElementById("loading");
  if (loadingEl) loadingEl.classList.add("hidden");

  const toast = document.getElementById("toast");
  let toastTimeout = null;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("toast--visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("toast--visible");
    }, 3000);
  };

  initPoster(showToast, isLoggedIn());
}
