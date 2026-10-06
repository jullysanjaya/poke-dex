import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { capitalize, getSpriteUrl } from "../utils.js";
import { translations } from "../translations.js";

function ArenaPage({ lang }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  
  const [p1Id, setP1Id] = useState(25); // Pikachu
  const [p2Id, setP2Id] = useState(6);  // Charizard
  
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");

  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState("");
  const [animating, setAnimating] = useState(null);
  const [winner, setWinner] = useState(null);
  
  const [damagePopup, setDamagePopup] = useState({ target: null, text: "" });

  const t = translations[lang];

  useEffect(() => {
    async function fetchPokemonNames() {
      try {
        const res = await fetch(`${API_BASE_URL}/pokemon?limit=1025`);
        const data = await res.json();
        const formatted = data.results.map((p, idx) => ({
          id: idx + 1,
          name: p.name,
        }));
        setPokemonList(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    }
    fetchPokemonNames();
  }, []);

  const filteredList1 = pokemonList.filter(p => 
    p.name.toLowerCase().includes(search1.toLowerCase()) || String(p.id).includes(search1)
  );

  const filteredList2 = pokemonList.filter(p => 
    p.name.toLowerCase().includes(search2.toLowerCase()) || String(p.id).includes(search2)
  );

  const handleSearchKeyDown1 = (e) => {
    if (e.key === 'Enter' && filteredList1.length > 0) {
      setP1Id(filteredList1[0].id);
      setSearch1("");
    }
  };

  const handleSearchKeyDown2 = (e) => {
    if (e.key === 'Enter' && filteredList2.length > 0) {
      setP2Id(filteredList2[0].id);
      setSearch2("");
    }
  };

  async function initBattle() {
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE_URL}/pokemon/${p1Id}`),
        fetch(`${API_BASE_URL}/pokemon/${p2Id}`)
      ]);
      const data1 = await res1.json();
      const data2 = await res2.json();

      const maxHp1 = data1.stats.find(s => s.stat.name === 'hp').base_stat * 3;
      const maxHp2 = data2.stats.find(s => s.stat.name === 'hp').base_stat * 3;

      setP1({
        name: data1.name,
        sprite: getSpriteUrl(p1Id),
        types: data1.types.map(t => t.type.name),
        maxHp: maxHp1,
        hp: maxHp1,
        attack: data1.stats.find(s => s.stat.name === 'attack').base_stat,
        defense: data1.stats.find(s => s.stat.name === 'defense').base_stat,
      });

      setP2({
        name: data2.name,
        sprite: getSpriteUrl(p2Id),
        types: data2.types.map(t => t.type.name),
        maxHp: maxHp2,
        hp: maxHp2,
        attack: data2.stats.find(s => s.stat.name === 'attack').base_stat,
        defense: data2.stats.find(s => s.stat.name === 'defense').base_stat,
      });

      setBattleStarted(true);
      setWinner(null);
      setTurn(1);
      setLog(lang === 'id' ? `Pertarungan dimulai! ${capitalize(data1.name)} siap bertarung!` : `Battle started! ${capitalize(data1.name)} is ready!`);
    } catch (err) {
      console.error(err);
    }
  }

  function handleAttack(moveName, powerMultiplier) {
    if (animating || turn !== 1 || !p1 || !p2 || p1.hp <= 0 || p2.hp <= 0 || winner) return;

    setAnimating('p1-attack');
    const damage = Math.max(12, Math.floor((p1.attack / p2.defense) * 18 * powerMultiplier));
    const newHp2 = Math.max(0, p2.hp - damage);
    
    setLog(lang === 'id' ? `${capitalize(p1.name)} menggunakan ${moveName}! Menghasilkan ${damage} DMG!` : `${capitalize(p1.name)} used ${moveName}! Dealt ${damage} DMG!`);
    
    setTimeout(() => {
      setDamagePopup({ target: 'p2', text: `-${damage}` });
      setP2(prev => ({ ...prev, hp: newHp2 }));
      setAnimating(null);

      setTimeout(() => setDamagePopup({ target: null, text: "" }), 900);

      if (newHp2 <= 0) {
        setWinner(p1.name);
        setLog(lang === 'id' ? `${capitalize(p1.name)} memenangkan pertarungan!` : `${capitalize(p1.name)} won the battle!`);
      } else {
        setTurn(2);
        setTimeout(() => aiTurn(newHp2), 1200);
      }
    }, 600);
  }

  function aiTurn(currentP2Hp) {
    if (currentP2Hp <= 0 || !p1 || !p2 || winner) return;
    setAnimating('p2-attack');

    const damage = Math.max(10, Math.floor((p2.attack / p1.defense) * 16));
    const newHp1 = Math.max(0, p1.hp - damage);

    setLog(lang === 'id' ? `${capitalize(p2.name)} menyerang balik dan menghasilkan ${damage} DMG!` : `${capitalize(p2.name)} counter-attacked and dealt ${damage} DMG!`);

    setTimeout(() => {
      setDamagePopup({ target: 'p1', text: `-${damage}` });
      setP1(prev => ({ ...prev, hp: newHp1 }));
      setAnimating(null);

      setTimeout(() => setDamagePopup({ target: null, text: "" }), 900);

      if (newHp1 <= 0) {
        setWinner(p2.name);
        setLog(lang === 'id' ? `${capitalize(p2.name)} memenangkan pertarungan!` : `${capitalize(p2.name)} won the battle!`);
      } else {
        setTurn(1);
        setLog(lang === 'id' ? `Giliran ${capitalize(p1.name)} menyerang!` : `${capitalize(p1.name)}'s turn to attack!`);
      }
    }, 600);
  }

  if (loadingList) return <p className="status">{t.loading}</p>;

  return (
    <div className="arena-container">
      <Link to="/" className="back-link">{t.backToDex}</Link>
      
      {!battleStarted ? (
        <div className="arena-setup-box">
          <h2>{t.arenaTitle}</h2>
          <p>{t.arenaSubtitle}</p>

          <div className="setup-grid">
            <div className="setup-card">
              <h3>{lang === 'id' ? 'Pemain 1' : 'Player 1'}</h3>
              
              <div className="setup-preview-box">
                <img src={getSpriteUrl(p1Id)} alt="Player 1" className="setup-preview-sprite float-anim flip-sprite" />
              </div>

              <div className="arena-search-box">
                <input 
                  type="text" 
                  className="arena-search-input" 
                  placeholder={lang === 'id' ? 'Cari nama / nomor...' : 'Search name / id...'} 
                  value={search1}
                  onChange={(e) => setSearch1(e.target.value)}
                  onKeyDown={handleSearchKeyDown1}
                />
                {search1 && filteredList1.length > 0 && (
                  <div className="search-dropdown-results">
                    {filteredList1.slice(0, 5).map(p => (
                      <div 
                        key={p.id} 
                        className="dropdown-result-item"
                        onClick={() => {
                          setP1Id(p.id);
                          setSearch1("");
                        }}
                      >
                        #{String(p.id).padStart(4, '0')} - {capitalize(p.name)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select className="arena-select" value={p1Id} onChange={(e) => setP1Id(e.target.value)}>
                {filteredList1.map(p => (
                  <option key={p.id} value={p.id}>#{String(p.id).padStart(4, '0')} - {capitalize(p.name)}</option>
                ))}
              </select>
            </div>

            <div className="setup-vs">VS</div>

            <div className="setup-card">
              <h3>{lang === 'id' ? 'Lawan / AI' : 'Opponent / AI'}</h3>

              <div className="setup-preview-box">
                <img src={getSpriteUrl(p2Id)} alt="Opponent" className="setup-preview-sprite float-anim" />
              </div>

              <div className="arena-search-box">
                <input 
                  type="text" 
                  className="arena-search-input" 
                  placeholder={lang === 'id' ? 'Cari nama / nomor...' : 'Search name / id...'} 
                  value={search2}
                  onChange={(e) => setSearch2(e.target.value)}
                  onKeyDown={handleSearchKeyDown2}
                />
                {search2 && filteredList2.length > 0 && (
                  <div className="search-dropdown-results">
                    {filteredList2.slice(0, 5).map(p => (
                      <div 
                        key={p.id} 
                        className="dropdown-result-item"
                        onClick={() => {
                          setP2Id(p.id);
                          setSearch2("");
                        }}
                      >
                        #{String(p.id).padStart(4, '0')} - {capitalize(p.name)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select className="arena-select" value={p2Id} onChange={(e) => setP2Id(e.target.value)}>
                {filteredList2.map(p => (
                  <option key={p.id} value={p.id}>#{String(p.id).padStart(4, '0')} - {capitalize(p.name)}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="start-battle-btn" onClick={initBattle}>
            {lang === 'id' ? 'MULAI PERTARUNGAN ARENA' : 'START BATTLE ARENA'}
          </button>
        </div>
      ) : (
        <div className="battle-screen">
          <div className="tekken-hud-header">
            <div className="hud-player">
              <div className="hud-name-lvl">
                <span>{capitalize(p1.name)}</span>
                <span>Lv.50</span>
              </div>
              <div className="hud-hp-bar-outer">
                <div className="hud-hp-fill" style={{ width: `${(p1.hp / p1.maxHp) * 100}%` }}></div>
              </div>
              <span className="hud-hp-num">{p1.hp} / {p1.maxHp} HP</span>
            </div>

            <div className="hud-vs-badge">VS</div>

            <div className="hud-player opponent-hud">
              <div className="hud-name-lvl">
                <span>{capitalize(p2.name)}</span>
                <span>Lv.50</span>
              </div>
              <div className="hud-hp-bar-outer">
                <div className="hud-hp-fill opponent-fill" style={{ width: `${(p2.hp / p2.maxHp) * 100}%` }}></div>
              </div>
              <span className="hud-hp-num">{p2.hp} / {p2.maxHp} HP</span>
            </div>
          </div>

          <div className="battle-field">
            {winner && (
              <div className="arena-victory-overlay">
                <div className="victory-banner-card">
                  <h2 className="victory-title">VICTORY</h2>
                  <p className="victory-name">{capitalize(winner)} {lang === 'id' ? 'Memenangkan Pertarungan!' : 'Wins the Battle!'}</p>
                </div>
              </div>
            )}

            <div className={`fighter-side player1-side ${animating === 'p1-attack' ? 'attack-anim-right' : ''} ${winner === p2.name ? 'faint-sprite' : ''}`}>
              <img src={p1.sprite} alt={p1.name} className={`battle-sprite flip-sprite ${winner === p1.name ? 'winner-glow float-anim' : 'float-anim'}`} />
              {animating === 'p1-attack' && (
                <div className={`attack-element-aura element-${p1.types[0] || 'normal'}`}></div>
              )}
              {damagePopup.target === 'p1' && (
                <div className="damage-popup-text left-popup">{damagePopup.text}</div>
              )}
            </div>

            <div className={`fighter-side player2-side ${animating === 'p2-attack' ? 'attack-anim-left' : ''} ${winner === p1.name ? 'faint-sprite' : ''}`}>
              <img src={p2.sprite} alt={p2.name} className={`battle-sprite ${winner === p2.name ? 'winner-glow float-anim' : 'float-anim'}`} />
              {animating === 'p2-attack' && (
                <div className={`attack-element-aura element-${p2.types[0] || 'normal'}`}></div>
              )}
              {damagePopup.target === 'p2' && (
                <div className="damage-popup-text right-popup">{damagePopup.text}</div>
              )}
            </div>
          </div>

          <div className="battle-control-panel">
            <div className="battle-log-box">
              <p>{log}</p>
            </div>

            <div className="battle-actions-box">
              {!winner ? (
                <div className="action-buttons-grid">
                  <button 
                    className="skill-btn" 
                    disabled={turn !== 1 || animating !== null}
                    onClick={() => handleAttack('Quick Attack', 1.0)}
                  >
                    Quick Attack
                  </button>
                  <button 
                    className="skill-btn" 
                    disabled={turn !== 1 || animating !== null}
                    onClick={() => handleAttack('Heavy Smash', 1.4)}
                  >
                    Heavy Smash
                  </button>
                  <button 
                    className="skill-btn skill-special" 
                    disabled={turn !== 1 || animating !== null}
                    onClick={() => handleAttack('Ultimate Blast', 1.9)}
                  >
                    Ultimate Move
                  </button>
                  <button className="skill-btn skill-reset" onClick={() => setBattleStarted(false)}>
                    {lang === 'id' ? 'Keluar Arena' : 'Exit Arena'}
                  </button>
                </div>
              ) : (
                <div className="action-buttons-grid">
                  <button className="skill-btn skill-special" onClick={() => setBattleStarted(false)} style={{ gridColumn: 'span 2' }}>
                    {lang === 'id' ? 'Pilih Pokémon Lain' : 'Choose Another Pokémon'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArenaPage;