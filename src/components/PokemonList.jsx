import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { getIdFromUrl, capitalize, getSpriteUrl } from "../utils.js";
import SearchForm from "./SearchForm.jsx";
import { translations } from "../translations.js";

function PokemonList({ lang }) {
  const [allPokemons, setAllPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedGen, setSelectedGen] = useState("all");
  const t = translations[lang];

  const generations = [
    { id: "all", name: t.allGen },
    { id: "gen1", name: "Gen 1", start: 1, end: 151 },
    { id: "gen2", name: "Gen 2", start: 152, end: 251 },
    { id: "gen3", name: "Gen 3", start: 252, end: 386 },
    { id: "gen4", name: "Gen 4", start: 387, end: 493 },
    { id: "gen5", name: "Gen 5", start: 494, end: 649 },
    { id: "gen6", name: "Gen 6", start: 650, end: 721 },
    { id: "gen7", name: "Gen 7", start: 722, end: 809 },
    { id: "gen8", name: "Gen 8", start: 810, end: 905 },
    { id: "gen9", name: "Gen 9", start: 906, end: 1025 },
  ];

  useEffect(() => {
    async function loadAllPokemons() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=1025`);
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        
        const detailedPokemons = await Promise.all(
          data.results.map(async (p) => {
            const res = await fetch(p.url);
            const details = await res.json();
            return {
              name: p.name,
              url: p.url,
              types: details.types.map((tp) => tp.type.name),
            };
          })
        );

        setAllPokemons(detailedPokemons);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllPokemons();
  }, []);

  if (isLoading) {
    return <p className="status">{t.loading}</p>;
  }

  if (error) {
    return <p className="status status-error">Gagal memuat data: {error}</p>;
  }

  const filteredPokemons = allPokemons.filter((pokemon) => {
    const id = Number(getIdFromUrl(pokemon.url));
    const matchesSearch =
      pokemon.name.toLowerCase().includes(searchTerm) ||
      String(id).includes(searchTerm);

    const matchesType =
      selectedType === "all" || pokemon.types.includes(selectedType);

    let matchesGen = true;
    if (selectedGen !== "all") {
      const genObj = generations.find(g => g.id === selectedGen);
      if (genObj) {
        matchesGen = id >= genObj.start && id <= genObj.end;
      }
    }

    return matchesSearch && matchesType && matchesGen;
  });

  return (
    <div>
      <SearchForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        lang={lang}
      />

      <div className="gen-filter-container">
        {generations.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`gen-chip ${selectedGen === g.id ? "active" : ""}`}
            onClick={() => setSelectedGen(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {filteredPokemons.length === 0 ? (
        <p className="status">{t.notFound}</p>
      ) : (
        <ul className="pokemon-list">
          {filteredPokemons.map((pokemon) => {
            const id = getIdFromUrl(pokemon.url);
            return (
              <li key={pokemon.name} className="pokemon-list-item">
                <Link to={`/pokemon/${pokemon.name}`} className="pokemon-link">
                  <div className="pokemon-card-header">
                    <span className="pokemon-id">#{id.padStart(4, "0")}</span>
                  </div>
                  <div className="pokemon-sprite-container">
                    <img
                      className="pokemon-sprite"
                      src={getSpriteUrl(id)}
                      alt={pokemon.name}
                    />
                  </div>
                  <span className="pokemon-name">{capitalize(pokemon.name)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default PokemonList;