import React, { useEffect, useState } from "react";
import { User } from "../types";

// Recharts
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const StatsPage = ({ user }: { user: User }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/stats/get.php", { credentials: "include" })
      .then((res) =>
        res.ok && res.headers.get("content-type")?.includes("application/json")
          ? res.json()
          : null,
      )
      .then(setStats)
      .catch(console.error);
  }, [user.id]);

  if (!stats) {
    return (
      <div className="md:pl-72 p-6 text-ink/60 italic">
        Aucune statistique enregistrée.
      </div>
    );
  }

  const COLORS = ["#5a5a40", "#8e8e6b", "#c2c2a3", "#d9d9c2", "#ecece0"];

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      <h2 className="text-5xl font-serif italic mb-12"> Mes Statistiques</h2>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-black/5 text-center">
          <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2">
            Livres lus
          </p>
          <p className="text-6xl font-serif italic text-accent">
            {stats.totalFinished}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-black/5 text-center">
          <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2">
            Pages lues
          </p>
          <p className="text-6xl font-serif italic text-accent">
            {stats.totalPages}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-black/5 text-center">
          <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2">
            Objectif annuel
          </p>
          <p className="text-6xl font-serif italic text-accent">12</p>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-2">
            {Math.round((stats.totalFinished / 12) * 100)}% complété
          </p>
        </div>
      </div>

      {/* GRAPHS + ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PIE CHART */}
        <div className="bg-white p-8 rounded-3xl border border-black/5 h-[400px]">
          <h3 className="text-2xl font-serif mb-8">Genres favoris</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.topGenres}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="count"
                nameKey="category"
              >
                {stats.topGenres.map((_: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* READING ANALYSIS */}
        <div className="bg-white p-8 rounded-3xl border border-black/5">
          <h3 className="text-2xl font-serif mb-8">Analyse de lecture</h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-ink/60">Vitesse moyenne</span>
              <span className="font-bold">1.2 pages/min</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-ink/60">Temps moyen par session</span>
              <span className="font-bold">34 minutes</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-ink/60">Jour le plus actif</span>
              <span className="font-bold">Dimanche</span>
            </div>

            {/* HEATMAP */}
            <div className="pt-6 border-t border-black/5">
              <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">
                Heatmap d'activité
              </p>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${
                      i % 5 === 0
                        ? "bg-accent"
                        : i % 3 === 0
                          ? "bg-accent/40"
                          : "bg-accent/5"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PWA INSTALL
        <div className="bg-white p-8 rounded-3xl border border-black/5">
          <h3 className="text-2xl font-serif mb-6">Installation PWA</h3>

          <p className="text-sm text-ink/60 mb-6">
            Pour utiliser Bookhunter comme une application native sur votre appareil :
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">1</div>
              <div>
                <p className="font-bold text-sm">Ouvrez dans un nouvel onglet</p>
                <p className="text-xs text-ink/40">
                  Cliquez sur l'icône "Open in new tab" en haut à droite d'AI Studio.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">2</div>
              <div>
                <p className="font-bold text-sm">Installer</p>
                <p className="text-xs text-ink/40">
                  Sur Chrome : Cliquez sur "Installer" dans la barre d'adresse.
                  Sur iOS : "Sur l'écran d'accueil".
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default StatsPage;
