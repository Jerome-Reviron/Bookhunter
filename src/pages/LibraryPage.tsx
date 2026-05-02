import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Book } from "lucide-react";

import { User, BookEntry, Sticker } from "../types";
import StickerDisplay from "../components/StickerDisplay";

const LibraryPage = ({ user }: { user: User }) => {
  const navigate = useNavigate();

  const [books, setBooks] = useState<BookEntry[]>([]);
  const [STICKERS, setSTICKERS] = useState<Sticker[]>([]);

  const [filter, setFilter] = useState<
    "all" | "finished" | "reading" | "to-read"
  >("all");

  const [search, setSearch] = useState("");

  // Load books
  useEffect(() => {
    fetch(`/api/users/books.php?user_id=${user.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setBooks)
      .catch(console.error);
  }, [user.id]);

  // Load stickers from DB
  useEffect(() => {
    fetch("/api/stickers/get.php")
      .then((res) => res.json())
      .then((data) => setSTICKERS(data))
      .catch(() => setSTICKERS([]));
  }, []);

  const filtered = books.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <h2 className="text-5xl font-serif italic">Ma Bibliothèque</h2>

        <div className="relative w-full md:w-64">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30"
            size={18}
          />
          <input
            placeholder="Rechercher..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-black/5 focus:outline-none focus:border-accent/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {["all", "reading", "finished", "to-read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-accent text-white"
                : "bg-white border border-black/5 text-ink/60"
            }`}
          >
            {f === "all"
              ? "Tous"
              : f === "reading"
                ? "En cours"
                : f === "finished"
                  ? "Terminés"
                  : "À lire"}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filtered.map((book) => {
          const progress = Math.min(
            100,
            Math.round((book.current_page / (book.total_pages || 1)) * 100),
          );

          return (
            <div
              key={book.id}
              onClick={() => navigate(`/book/${book.id}`)}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] bg-white rounded-2xl border border-black/5 mb-4 overflow-hidden shadow-sm transition-transform group-hover:-translate-y-2 relative">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/5">
                    <Book size={32} className="text-accent/20" />
                  </div>
                )}

                <StickerDisplay
                  stickersJson={book.stickers}
                  STICKERS={STICKERS}
                  size="sm"
                />
              </div>

              <h4 className="font-bold text-sm line-clamp-1">{book.title}</h4>
              <p className="text-xs text-ink/40">{book.author}</p>

              <div className="mt-3">
                <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">
                  <span>{book.category}</span>
                  <span>{progress}%</span>
                </div>

                <div className="w-full bg-accent/10 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryPage;
