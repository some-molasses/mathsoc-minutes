import { Suspense } from "react";
import { SearchSection } from "./components/search/search-section";
import "./home.scss";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <main>
      <div id="contents">
        <div id="home-title">
          <h1>MathSoc Archive</h1>
          <p id="page-description">
            This archive contains approximately 60% of all MathSoc Council and
            Board meeting minutes since 2022.
          </p>
        </div>
        <Suspense fallback={null}>
          <SearchSection query={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
