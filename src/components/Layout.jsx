import { Outlet, Link, useLocation } from "react-router-dom";
import { translations } from "../translations.js";

function Layout({ lang, setLang }) {
  const t = translations[lang];
  const location = useLocation();
  const isArena = location.pathname.includes("/arena");

  return (
    <>
      <header className="official-header">
        <div className="header-spacer"></div>

        <Link to="/" className="official-logo-center">
          <span className="pokedex-text-logo">{t.logo}</span>
        </Link>

        <div className="header-right-actions">
          <Link to={isArena ? "/" : "/arena"} className="arena-nav-btn">
            {isArena ? t.backToDex : t.arenaBtn}
          </Link>
          <div className="lang-switcher">
            <button 
              type="button"
              className={`lang-btn ${lang === 'id' ? 'active' : ''}`} 
              onClick={() => setLang('id')}
            >
              ID
            </button>
            <button 
              type="button"
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`} 
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>
      </header>
      <div className="app">
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;