// Mapeia o campo Country da OMDB para uma opção do select de Nacionalidade
// O catálogo do Notion tem nomes próprios com flag (🇺🇸 USA, 🇧🇷 Brasil, 🇬🇧 Reino Unido)

// Apelidos comuns da OMDB → rótulo normalizado da opção do Notion
const country_aliases = {
  us: "usa",
  "united states": "usa",
  "united states of america": "usa",
  uk: "reino unido",
  "united kingdom": "reino unido",
  "great britain": "reino unido",
  brazil: "brasil",
  norway: "noruega",
};

// Minúsculas, sem acento e sem emoji/pontuação para comparar rótulos
function normalize_country(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

// Devolve o valor a selecionar e se ele já existe no catálogo; null sem Country válido
// Só o primeiro país conta: OMDB junta vários ("Japan, USA") e o select é de país único
export function match_country_option(country, option_values) {
  if (!country || country === "N/A") return null;

  const first = String(country)
    .split(",")[0]
    .trim();
  const normalized = normalize_country(first);
  if (!normalized) return null;

  const target = country_aliases[normalized] || normalized;
  const found = (option_values || []).find(
    (option) => normalize_country(option) === target,
  );

  return { value: found || first, matched: !!found };
}
