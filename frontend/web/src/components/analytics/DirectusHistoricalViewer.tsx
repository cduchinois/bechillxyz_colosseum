"use client";

import { useEffect, useState } from "react";
import JsonViewer from "../analytics/JsonViewer"; // Si tu veux une vue json propre (facultatif)

type HistoricalEntry = {
  [key: string]: any; // pour pouvoir afficher dynamiquement sans fail
};

export default function DirectusHistoricalViewer({ slug = "bitcoin" }: { slug?: string }) {
  const [data, setData] = useState<HistoricalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = `/api/directus-historical?slug=${slug}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(endpoint);
        const json = await res.json();

        if (!json.data) throw new Error("No data received");

        // Tentative auto-détection de champ date
        const sorted = json.data.sort((a: any, b: any) => {
          const dateA = new Date(a.timestamp || a.date || a.created_at).getTime();
          const dateB = new Date(b.timestamp || b.date || b.created_at).getTime();
          return dateB - dateA;
        });

        setData(sorted);
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <div className="p-4 bg-white rounded shadow-md mb-10">
      <h2 className="text-xl font-bold text-purple-700 mb-4">
        Prix Historique : {slug}
      </h2>

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
              {data.map((entry, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">
                    {new Date(entry.timestamp || entry.date || entry.created_at).toLocaleDateString() || "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {typeof entry.price === "number" ? entry.price.toFixed(4) : "N/A"}
                  </td>
                  <td className="px-4 py-2">{entry.symbol || "?"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bonus : Vue JSON propre */}
          <JsonViewer data={data.slice(0, 5)} expandedDepth={2} />
        </>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-gray-500">Aucune donnée disponible.</p>
      )}
    </div>
  );
}
