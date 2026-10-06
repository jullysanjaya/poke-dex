import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import PokemonList from "./components/PokemonList.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import ArenaPage from "./pages/ArenaPage.jsx";

function App() {
  const [lang, setLang] = useState("id");

  return (
    <Routes>
      <Route path="/" element={<Layout lang={lang} setLang={setLang} />}>
        <Route index element={<PokemonList lang={lang} />} />
        <Route path="pokemon/:name" element={<DetailPage lang={lang} />} />
        <Route path="arena" element={<ArenaPage lang={lang} />} />
      </Route>
    </Routes>
  );
}

export default App;