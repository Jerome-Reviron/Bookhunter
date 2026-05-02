import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Coins,
  Trophy,
  Tag,
  CheckCircle2,
  Gift,
  ShoppingBag,
  ExternalLink,
  Loader2,
  Type as TypeIcon,
  Palette,
} from "lucide-react";

import { User, Challenge, ShopItem } from "../types";

const ShopPage = ({ user }: { user: User }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [points, setPoints] = useState(user.points);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [cRes, sRes, uRes] = await Promise.all([
      fetch(`/api/challenges/list.php?userId=${user.id}`, {
        credentials: "include",
      }),
      fetch("/api/shop/list.php", {
        credentials: "include",
      }),
      fetch(`/api/user/get.php?id=${user.id}`, {
        credentials: "include",
      }),
    ]);

    setChallenges(await cRes.json());
    setShopItems(await sRes.json());

    const userData = await uRes.json();
    setPoints(userData.points);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleClaim = async (id: number) => {
    const res = await fetch("/api/challenges/update.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        challengeId: id,
        action: "claim",
      }),
    });

    if (res.ok) fetchData();
  };

  const handleBuy = async (id: number) => {
    const res = await fetch("/api/shop/buy.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, itemId: id }),
    });

    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json();
      console.error(data.error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-serif italic mb-2">Défis & Boutique</h2>
          <p className="text-ink/40 uppercase tracking-widest text-xs font-bold">
            Relevez des défis et personnalisez votre journal
          </p>
        </div>

        <div className="flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-accent/20">
          <Coins size={20} className="text-white" />
          <span className="text-base font-bold">{points} Points</span>
        </div>
      </header>

      {/* CHALLENGES */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="text-accent" size={24} />
          <h3 className="text-3xl font-serif italic">Défis en cours</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className={`bg-white p-8 rounded-[40px] border border-black/5 shadow-sm flex flex-col justify-between ${
                c.completed && !c.claimed
                  ? "ring-2 ring-accent ring-offset-4"
                  : ""
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-serif italic">{c.title}</h4>

                  <div className="flex items-center gap-1.5 text-accent bg-accent/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {c.reward_type === "points" ? (
                      <Coins size={12} />
                    ) : (
                      <Tag size={12} />
                    )}
                    {c.reward_value} {c.reward_type === "points" ? "Pts" : ""}
                  </div>
                </div>

                <p className="text-ink/60 text-sm mb-6">{c.description}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">
                    <span>Progression</span>
                    <span>
                      {c.currentProgress} / {c.requirement_value}
                    </span>
                  </div>

                  <div className="w-full bg-paper h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          100,
                          (c.currentProgress / c.requirement_value) * 100,
                        )}%`,
                      }}
                      className="bg-accent h-full"
                    />
                  </div>
                </div>
              </div>

              {c.claimed ? (
                <div className="flex items-center justify-center gap-2 text-green-500 font-bold text-xs uppercase tracking-widest py-3 bg-green-50 rounded-2xl">
                  <CheckCircle2 size={16} /> Récompense récupérée
                </div>
              ) : c.completed ? (
                <button
                  onClick={() => handleClaim(c.id)}
                  className="w-full bg-accent text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <Gift size={16} /> Récupérer ma récompense
                </button>
              ) : (
                <div className="text-center py-3 bg-paper rounded-2xl text-ink/30 text-xs font-bold uppercase tracking-widest">
                  En cours...
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SHOP */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="text-accent" size={24} />
          <h3 className="text-3xl font-serif italic">
            Boutique de Personnalisation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* STICKERS */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold opacity-40 flex items-center gap-2">
              <Tag size={14} /> Stickers Uniques
            </h4>

            <div className="space-y-4">
              {shopItems
                .filter((i) => i.type === "sticker")
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <img
                          src={item.image_url}
                          className="w-10 h-10"
                          alt={item.name}
                        />
                      </div>

                      <div>
                        <h5 className="font-serif italic text-lg">
                          {item.name}
                        </h5>
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">
                          Sticker
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBuy(item.id)}
                        className="flex-1 bg-accent/10 text-accent font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Coins size={12} /> {item.price_points} Pts
                      </button>

                      <a
                        href={item.stripe_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-paper rounded-xl border border-black/5 text-ink/40 hover:text-accent transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* FONTS */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold opacity-40 flex items-center gap-2">
              <TypeIcon size={14} /> Polices Élégantes
            </h4>

            <div className="space-y-4">
              {shopItems
                .filter((i) => i.type === "font")
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm"
                  >
                    <div className="mb-4">
                      <h5 className="font-serif italic text-lg">{item.name}</h5>

                      <p
                        className={`text-xl mt-2 ${
                          item.value === "serif"
                            ? "font-serif"
                            : item.value === "sans"
                              ? "font-sans"
                              : "font-mono"
                        }`}
                      >
                        Exemple de texte
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBuy(item.id)}
                        className="flex-1 bg-accent/10 text-accent font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Coins size={12} /> {item.price_points} Pts
                      </button>

                      <a
                        href={item.stripe_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-paper rounded-xl border border-black/5 text-ink/40 hover:text-accent transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* BACKGROUNDS */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold opacity-40 flex items-center gap-2">
              <Palette size={14} /> Arrière-plans
            </h4>

            <div className="space-y-4">
              {shopItems
                .filter((i) => i.type === "background")
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl border border-black/5 ${item.value}`}
                      ></div>

                      <h5 className="font-serif italic text-lg">{item.name}</h5>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBuy(item.id)}
                        className="flex-1 bg-accent/10 text-accent font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Coins size={12} /> {item.price_points} Pts
                      </button>

                      <a
                        href={item.stripe_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-paper rounded-xl border border-black/5 text-ink/40 hover:text-accent transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
