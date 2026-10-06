import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { capitalize, getSpriteUrl } from "../utils.js";
import { translations } from "../translations.js";

// Fungsi helper untuk menentukan nama region berdasarkan ID Pokémon
function getRegionName(id) {
  const num = Number(id);
  if (num >= 1 && num <= 151) return "Kanto (Gen 1)";
  if (num >= 152 && num <= 251) return "Johto (Gen 2)";
  if (num >= 252 && num <= 386) return "Hoenn (Gen 3)";
  if (num >= 387 && num <= 493) return "Sinnoh (Gen 4)";
  if (num >= 494 && num <= 649) return "Unova (Gen 5)";
  if (num >= 650 && num <= 721) return "Kalos (Gen 6)";
  if (num >= 722 && num <= 809) return "Alola (Gen 7)";
  if (num >= 810 && num <= 905) return "Galar (Gen 8)";
  if (num >= 906 && num <= 1025) return "Paldea (Gen 9)";
  return "Unknown Region";
}

function DetailPage({ lang }) {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    async function fetchPokemonDetail() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
        if (!res.ok) throw new Error("Pokemon not found");
        const data = await res.json();
        setPokemon(data);

        const speciesRes = await fetch(`${API_BASE_URL}/pokemon-species/${data.id}`);
        const speciesData = await speciesRes.json();
        setSpecies(speciesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPokemonDetail();
  }, [name]);

  if (loading) return <p className="status">{t.loading}</p>;
  if (!pokemon) return <p className="status status-error">Pokémon not found!</p>;

  let flavorText = "";
  if (species && species.flavor_text_entries) {
    const targetEntry = species.flavor_text_entries.find(
      entry => entry.language.name === (lang === 'id' ? 'id' : 'en')
    ) || species.flavor_text_entries.find(entry => entry.language.name === 'en');
    
    if (targetEntry) {
      flavorText = targetEntry.flavor_text.replace(/[\n\f]/g, ' ');
    }
  }

  const regionName = getRegionName(pokemon.id);

  return (
    <div className="official-detail-container">
      <Link to="/" className="back-link">← {t.backToDex}</Link>

      <div className="official-detail-card">
        <div className="card-top-header">
          <span className="detail-id">#{String(pokemon.id).padStart(4, '0')}</span>
          <h2>{capitalize(pokemon.name)}</h2>
        </div>

        <div className="main-content-grid">
          <div className="info-block">
            <span className="block-title">{t.type}</span>
            <div className="type-badges">
              {pokemon.types.map(tInfo => (
                <span key={tInfo.type.name} className={`badge type-${tInfo.type.name}`}>
                  {capitalize(tInfo.type.name)}
                </span>
              ))}
            </div>

            {/* Kotak Informasi Region */}
            <div className="specs-row" style={{ marginBottom: '16px' }}>
              <div className="spec-box" style={{ flex: 'none', width: '100%' }}>
                <span className="spec-label">Region</span>
                <span className="spec-val">{regionName}</span>
              </div>
            </div>

            <div className="specs-row">
              <div className="spec-box">
                <span className="spec-label">{t.height}</span>
                <span className="spec-val">{pokemon.height / 10} m</span>
              </div>
              <div className="spec-box">
                <span className="spec-label">{t.weight}</span>
                <span className="spec-val">{pokemon.weight / 10} kg</span>
              </div>
            </div>

            <button 
              className="cry-button"
              onClick={() => {
                if (pokemon.cries && pokemon.cries.latest) {
                  const audio = new Audio(pokemon.cries.latest);
                  audio.play().catch(e => console.log(e));
                }
              }}
            >
              🔊 {t.playAudio}
            </button>

            <p className="pokemon-desc">{flavorText}</p>
          </div>

          <div className="image-block">
            <div className="circle-image-bg">
              <img 
                src={getSpriteUrl(pokemon.id)} 
                alt={pokemon.name} 
                className="pokemon-animated-sprite float-anim" 
              />
            </div>
          </div>
        </div>

        <div className="stats-container">
          <h3>{t.stats}</h3>
          <div className="stats-grid">
            {pokemon.stats.map(s => {
              const statNameFormatted = s.stat.name.replace('-', ' ');
              const percentage = Math.min(100, (s.base_stat / 255) * 100);
              return (
                <div key={s.stat.name} className="stat-item">
                  <span className="stat-name">{capitalize(statNameFormatted)}</span>
                  <div className="stat-bar-container">
                    <div className="stat-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="stat-num">{s.base_stat}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;