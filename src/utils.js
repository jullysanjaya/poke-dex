export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getIdFromUrl(url) {
  if (!url) return 1;
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function getSpriteUrl(id) {
  const numericId = Number(id);
  // Sprite animasi GIF PokéAPI hanya tersedia sampai Gen 5 (ID <= 649)
  if (numericId <= 649) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${numericId}.gif`;
  }
  // Untuk Pokémon Gen 6 ke atas, gunakan official artwork atau default sprite
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png`;
}