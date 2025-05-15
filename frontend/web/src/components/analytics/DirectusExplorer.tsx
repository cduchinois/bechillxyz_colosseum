"use client";

import { useEffect, useState } from "react";
import JsonViewer from "../analytics/JsonViewer";

type HistoricalEntry = { [key: string]: any };

export default function DirectusExplorer() {
  const [filterType, setFilterType] = useState("slug");
  const [filterValue, setFilterValue] = useState("solana");
  const [tag, setTag] = useState("solana-ecosystem");
  const [sortOrder, setSortOrder] = useState("-datetime");
  const [data, setData] = useState<HistoricalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = "/api/directus-historical";

  const buildUrl = () => {
    const params = new URLSearchParams();
    params.append("filterType", filterType);
    params.append("filterValue", filterValue);
    if (tag) params.append("tag", tag);
    params.append("sort", sortOrder);
    return `/api/directus-historical?${params.toString()}`;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(buildUrl());
      const json = await res.json();

      if (!json.data) throw new Error("Aucune donnée reçue");
      const sorted = json.data.sort((a: any, b: any) => {
        const dateA = new Date(a.datetime || a.timestamp || a.date).getTime();
        const dateB = new Date(b.datetime || b.timestamp || b.date).getTime();
        return dateB - dateA;
      });

      setData(sorted);
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // chargement initial

  return (
    <div className="p-4 bg-white rounded shadow mb-10 font-poppins">
      <h2 className="text-xl font-bold text-purple-700 mb-4">
        🧪 Directus Explorer
      </h2>
      <p className="text-sm text-gray-600 mb-4">
  This tool lets you explore historical token price data directly from a Directus backend.
  You can filter results by <strong>slug</strong> (e.g. <code>solana</code>, <code>bitcoin</code>, <code>defi-land</code>), 
  <strong>symbol</strong> (e.g. <code>SOL</code>, <code>DFL</code>), or <strong>idCMC</strong> (e.g. <code>1</code> for Bitcoin), 
  and optionally limit results to the <code>solana-ecosystem</code> tag.
  You can also sort data by <strong>datetime</strong> in ascending or descending order.
</p>


      {/* Formulaire de filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          className="p-2 border rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="slug">Slug</option>
          <option value="symbol">Symbol</option>
          <option value="idCMC">idCMC</option>
        </select>

        <input
          type="text"
          placeholder="Valeur (ex: solana, DFL, 1)"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Tag (facultatif)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="p-2 border rounded"
        />

        <select
          className="p-2 border rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="-datetime">Date ↓</option>
          <option value="datetime">Date ↑</option>
        </select>
      </div>

      <button
        onClick={fetchData}
        className="mb-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        🔍 Lancer la recherche
      </button>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && data.length > 0 && (
        <>
          <table className="min-w-full text-sm text-left mb-6">
            <thead className="bg-purple-100 text-purple-700">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Prix</th>
                <th className="px-4 py-2">Symbole</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((entry, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">
                    {new Date(
                      entry.datetime || entry.timestamp || entry.date
                    ).toLocaleDateString() || "?"}
                  </td>
                  <td className="px-4 py-2">
  {typeof entry.price_usd === "number" ? entry.price_usd.toFixed(6) : "N/A"}
</td>

                  <td className="px-4 py-2">{entry.symbol || "?"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <JsonViewer data={data.slice(0, 5)} expandedDepth={2} />
        </>
      )}
    </div>
  );
}
