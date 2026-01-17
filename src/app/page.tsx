import { SearchSection } from "./components/search-section";
import "./home.scss";

export default function Home() {
  return (
    <main>
      <div id="contents">
        <div id="home-title">
          <h1>MathSoc Archive</h1>
        </div>
        <SearchSection />
      </div>
    </main>
  );
}
