import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { capitalize, getIdFromUrl, getSpriteUrl } from "../utils.js";
import { translations } from "../translations.js";
import SearchForm from "../components/SearchForm.jsx";

const REGION_RANGES = {
  Kanto: { min: 1, max: 151 },
  Johto: { min: 152, max: 251 },
  Hoenn: { min: 252, max: 386 },
  Sinnoh: { min: 387, max: 493 },
  Unova: { min: 494, max: 649 },
  Kalos: { min: 650, max: 721 },
  Alola: { min: 722, max: 809 },
  Galar: { min: 810, max: 905 },
  Hisui: { min: 905, max: 905 },
  Paldea: { min: 906, max: 1025 },
};

function ListPage({ lang }) {
  const [allPokemon, setAllPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState("all");
  
  // State Filter dari Modal SearchForm
  const [filters, setFilters] = useState({ region: null, ability: "all", searchName: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/pokemon?limit=1025`);
        const data = await res.json();
        setAllPokemon(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const filteredPokemon = allPokemon.filter((p) => {
    const id = Number(getIdFromUrl(p.url));
    
    // Filter nama/nomor dari input modal atau search bar utama
    const nameMatch = filters.searchName 
      ? (p.name.toLowerCase().includes(filters.searchName.toLowerCase()) || String(id).includes(filters.searchName))
      : true;

    // Filter generasi dari chip atas
    let genMatch = true;
    if (selectedGen === "gen1") genMatch = id >= 1 && id <= 151;
    else if (selectedGen === "gen2") genMatch = id >= 152 && id <= 251;
    else if (selectedGen === "gen3") genMatch = id >= 252 && id <= 386;
    else if (selectedGen === "gen4") genMatch = id >= 387 && id <= 493;
    else if (selectedGen === "gen5") genMatch = id >= 494 && id <= 649;
    else if (selectedGen === "gen6") genMatch = id >= 650 && id <= 721;
    else if (selectedGen === "gen7") genMatch = id >= 722 && id <= 809;
    else if (selectedGen === "gen8") genMatch = id >= 810 && id <= 905;
    else if (selectedGen === "gen9") genMatch = id >= 906 && id <= 1025;

    // Filter Region dari modal SearchForm
    let regionMatch = true;
    if (filters.region && REGION_RANGES[filters.region]) {
      const range = REGION_RANGES[filters.region];
      regionMatch = id >= range.min && id <= range.max;
    }

    return nameMatch && genMatch && regionMatch;
  });

  return (
    <div className="app">
      <header className="official-header">
        <div className="header-spacer"></div>
        <Link to="/" className="official-logo-center">
          <span className="pokedex-text-logo">PokéDex</span>
        </Link>
        <div className="header-right-actions">
          <Link to="/arena" className="arena-nav-btn">⚔️ {lang === 'id' ? 'Masuk Arena 1v1' : 'Enter 1v1 Arena'}</Link>
          <div className="lang-switcher">
            <button className={`lang-btn ${lang === 'id' ? 'active' : ''}`} onClick={() => window.location.search = '?lang=id'}>ID</button>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => window.location.search = '?lang=en'}>EN</button>
          </div>
        </div>
      </header>

      {/* Trigger Search Bar */}
      <div className="search-wrapper">
        <div className="search-bar-trigger" onClick={() => setIsModalOpen(true)}>
          <span className="search-placeholder">
            {filters.searchName ? filters.searchName : (lang === 'id' ? 'Cari berdasarkan nama atau nomor...' : 'Search by name or number...')}
          </span>
          <button className="search-icon-btn">🔍</button>
        </div>
      </div>

      {/* Generation Chips */}
      <div className="gen-filter-container">
        <button className={`gen-chip ${selectedGen === 'all' ? 'active' : ''}`} onClick={() => setSelectedGen('all')}>All Gen</button>
        <button className={`gen-chip ${selectedGen === 'gen1' ? 'active' : ''}`} onClick={() => setSelectedGen('gen1')}>Gen 1</button>
        <button className={`gen-chip ${selectedGen === 'gen2' ? 'active' : ''}`} onClick={() => setSelectedGen('gen2')}>Gen 2</button>
        <button className={`gen-chip ${selectedGen === 'gen3' ? 'active' : ''}`} onClick={() => setSelectedGen('gen3')}>Gen 3</button>
        <button className={`gen-chip ${selectedGen === 'gen4' ? 'active' : ''}`} onClick={() => setSelectedGen('gen4')}>Gen 4</button>
        <button className={`gen-chip ${selectedGen === 'gen5' ? 'active' : ''}`} onClick={() => setSelectedGen('gen5')}>Gen 5</button>
        <button className={`gen-chip ${selectedGen === 'gen6' ? 'active' : ''}`} onClick={() => setSelectedGen('gen6')}>Gen 6</button>
        <button className={`gen-chip ${selectedGen === 'gen7' ? 'active' : ''}`} onClick={() => setSelectedGen('gen7')}>Gen 7</button>
        <button className={`gen-chip ${selectedGen === 'gen8' ? 'active' : ''}`} onClick={() => setSelectedGen('gen8')}>Gen 8</button>
        <button className={`gen-chip ${selectedGen === 'gen9' ? 'active' : ''}`} onClick={() => setSelectedGen('gen9')}>Gen 9</button>
      </div>

      {/* Modal SearchForm */}
      {isModalOpen && (
        <SearchForm 
          onClose={() => setIsModalOpen(false)} 
          onApplyFilter={(newFilters) => setFilters(newFilters)}
          currentFilters={filters}
        />
      )}

      {loading ? (
        <p className="status">{t.loading}</p>
      ) : (
        <ul className="pokemon-list">
          {filteredPokemon.map(p => {
            const id = getIdFromUrl(p.url);
            const sprite = getSpriteUrl(id);
            return (
              <li key={p.name} className="pokemon-list-item">
                <Link to={`/pokemon/${p.name}`} className="pokemon-link">
                  <div className="pokemon-card-header">
                    <span className="pokemon-id">#{String(id).padStart(4, '0')}</span>
                  </div>
                  <div className="pokemon-sprite-container">
                    <img src={sprite} alt={p.name} className="pokemon-sprite float-anim" loading="lazy" />
                  </div>
                  <span className="pokemon-name">{capitalize(p.name)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ListPage;