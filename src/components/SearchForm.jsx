import { useState } from "react";
import { translations } from "../translations.js";

function SearchForm({ searchTerm, setSearchTerm, selectedType, setSelectedType, lang }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputVal, setInputVal] = useState(searchTerm);
  const t = translations[lang];

  const types = [
    { name: "all", label: "All" },
    { name: "normal", label: "Normal" },
    { name: "fire", label: "Fire" },
    { name: "water", label: "Water" },
    { name: "grass", label: "Grass" },
    { name: "electric", label: "Electric" },
    { name: "ice", label: "Ice" },
    { name: "fighting", label: "Fighting" },
    { name: "poison", label: "Poison" },
    { name: "ground", label: "Ground" },
    { name: "flying", label: "Flying" },
    { name: "psychic", label: "Psychic" },
    { name: "bug", label: "Bug" },
    { name: "rock", label: "Rock" },
    { name: "ghost", label: "Ghost" },
    { name: "dragon", label: "Dragon" },
    { name: "steel", label: "Steel" },
    { name: "fairy", label: "Fairy" }
  ];

  const handleApply = (e) => {
    e.preventDefault();
    setSearchTerm(inputVal.trim().toLowerCase());
    setIsModalOpen(false);
  };

  return (
    <div className="search-wrapper">
      <div className="search-bar-trigger" onClick={() => setIsModalOpen(true)}>
        <span className="search-placeholder">
          {searchTerm ? `Search: "${searchTerm}"` : selectedType && selectedType !== "all" ? `Type: ${selectedType}` : t.searchPlaceholder}
        </span>
        <button type="button" className="search-icon-btn">🔍</button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-header-banner">
              <div className="modal-title-text">{t.searchModalTitle}</div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body-container">
              <form onSubmit={handleApply} className="modal-search-form">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="modal-input"
                />
                <button type="submit" className="modal-submit-btn">🔍</button>
              </form>

              <div className="modal-section-title">{t.typeTitle}</div>
              <div className="modal-type-grid">
                {types.map((tp) => (
                  <button
                    key={tp.name}
                    type="button"
                    className={`modal-type-chip type-${tp.name} ${selectedType === tp.name ? "active" : ""}`}
                    onClick={() => setSelectedType(tp.name)}
                  >
                    <span className="type-label-text">{tp.label}</span>
                  </button>
                ))}
              </div>

              <div className="modal-section-title">{t.regionTitle}</div>
              <div className="modal-region-grid">
                {["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Hisui", "Paldea"].map((region) => (
                  <button key={region} type="button" className="region-chip" disabled>
                    {region}
                  </button>
                ))}
              </div>

              <div className="modal-bottom-row">
                <div className="bottom-col">
                  <div className="modal-section-title">{t.abilityTitle}</div>
                  <div className="select-box-dummy">All ⌄</div>
                </div>
                <div className="bottom-col">
                  <div className="modal-section-title">{t.numberTitle}</div>
                  <div className="range-box-dummy">0001 - 1025</div>
                  <div className="range-slider-bar"></div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="reset-btn" 
                  onClick={() => { setSelectedType("all"); setSearchTerm(""); setInputVal(""); }}
                >
                  {t.resetBtn}
                </button>
                <button 
                  type="button" 
                  className="apply-btn" 
                  onClick={handleApply}
                >
                  {t.applyBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchForm;