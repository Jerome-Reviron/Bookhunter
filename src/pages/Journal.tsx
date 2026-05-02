import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Book,
  Plus,
  Clock,
  CheckCircle2,
  Camera,
  Upload,
  Loader2,
} from "lucide-react";

// 👉 AJOUTE LA FONCTION ICI, juste après les imports
const safeJsonArray = (value: any) => {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

import { User, BookEntry, BookForm, Sticker } from "../types";
import { BOOK_CATEGORIES } from "../constants/bookCategories";

import BookCard from "../components/BookCard";
import ScannerModal from "../components/ScannerModal";

const Journal = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const navigate = useNavigate();

  const [books, setBooks] = useState<BookEntry[]>([]);
  const [profile, setProfile] = useState<User | null>(null);

  const [STICKERS, setSTICKERS] = useState<Sticker[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [newBook, setNewBook] = useState<BookForm>({
    title: "",
    author: "",
    category: "Fiction",
    support: "physical",
    edition: "",
    status: "reading",
    total_pages: 0,
    cover_url: "",
    stickers: [],
  });

  // Load stickers from DB
  useEffect(() => {
    fetch("/api/stickers/get.php")
      .then((res) => res.json())
      .then((data) => setSTICKERS(data))
      .catch(() => setSTICKERS([]));
  }, []);

  // Load books + profile
  const fetchBooks = async () => {
    try {
      const [booksRes, profileRes] = await Promise.all([
        fetch(`/api/users/books.php?user_id=${user.id}`),
        fetch(`/api/user/get.php?user_id=${user.id}`),
      ]);

      if (booksRes.status === 401) {
        onLogout();
        return;
      }

      if (booksRes.ok) {
        const contentType = booksRes.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          setBooks(await booksRes.json());
        }
      }

      if (profileRes.ok) {
        const contentType = profileRes.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          setProfile(await profileRes.json());
        }
      }
    } catch (err) {
      console.error("Failed to fetch books:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [user.id]);

  const closeScanner = useCallback(() => setShowScanner(false), []);

  // Handle ISBN scan
  const handleScan = useCallback(async (isbn: string) => {
    if (!isbn) return;

    setIsFetching(true);

    try {
      const cleanIsbn = isbn.trim().replace(/[^0-9X]/gi, "");
      const queries = cleanIsbn ? [`isbn:${cleanIsbn}`, cleanIsbn] : [isbn];

      let bookFound = false;

      for (const q of queries) {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();

        if (data.items?.length > 0) {
          const info = data.items[0].volumeInfo;
          const saleInfo = data.items[0].saleInfo;

          let coverUrl = "";
          if (info.imageLinks) {
            coverUrl = (
              info.imageLinks.extraLarge ||
              info.imageLinks.large ||
              info.imageLinks.medium ||
              info.imageLinks.small ||
              info.imageLinks.thumbnail ||
              info.imageLinks.smallThumbnail ||
              ""
            ).replace("http:", "https:");
          }

          if ((!coverUrl || coverUrl === "") && cleanIsbn) {
            coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
          }

          if (!coverUrl) coverUrl = "";

          // Category detection
          let category = "Fiction";
          if (info.categories?.length > 0) {
            const rawCat = info.categories.join(" ").toLowerCase();

            if (
              rawCat.includes("fantasy") ||
              rawCat.includes("fantastique") ||
              rawCat.includes("magic")
            )
              category = "Fantaisie";
            else if (rawCat.includes("science fiction"))
              category = "Science-Fiction";
            else if (rawCat.includes("romance")) category = "Romance";
            else if (rawCat.includes("thriller")) category = "Thriller";
            else if (rawCat.includes("mystery") || rawCat.includes("policier"))
              category = "Policier";
            else if (rawCat.includes("history")) category = "Historique";
            else if (rawCat.includes("biography")) category = "Biographie";
            else if (rawCat.includes("juvenile")) category = "Jeunesse";
            else if (rawCat.includes("manga")) category = "Manga";
            else if (rawCat.includes("essay")) category = "Essai";
            else if (rawCat.includes("self-help"))
              category = "Développement Personnel";
            else category = "Fiction";
          }

          let support: "physical" | "ebook" | "audio" = "physical";
          if (saleInfo?.isEbook) support = "ebook";

          setNewBook((prev) => ({
            ...prev,
            title: info.title || "",
            author: info.authors?.join(", ") || "",
            category,
            total_pages: info.pageCount || info.printedPageCount || 0,
            cover_url: coverUrl,
            support,
            edition: info.publisher || "",
          }));

          bookFound = true;
          break;
        }
      }

      if (!bookFound) {
        alert(
          "Livre non trouvé. Vous pouvez saisir les informations manuellement.",
        );
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la récupération des informations.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Upload cover
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBook((prev) => ({ ...prev, cover_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Add book
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBook, userId: user.id }),
      });

      if (res.ok) {
        fetchBooks();
        setShowAdd(false);
        setNewBook({
          title: "",
          author: "",
          category: "Fiction",
          support: "physical",
          edition: "",
          status: "reading",
          total_pages: 0,
          cover_url: "",
          stickers: [],
        });
      } else {
        const errorData = await res.json();
        if (res.status === 401) onLogout();
        alert(`Erreur lors de l'ajout : ${errorData.error || res.statusText}`);
      }
    } catch {
      alert("Erreur de connexion au serveur.");
    }
  };

  // Update progress
  const updateProgress = async (id: number, pages: number) => {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: id,
        pagesRead: pages,
        duration_minutes: 30,
      }),
    });
    fetchBooks();
  };

  // Update book
  const updateBook = async (id: number, data: any) => {
    await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchBooks();
  };

  // Delete book
  const deleteBook = async (id: number) => {
    if (!confirm("Supprimer ce livre ?")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    fetchBooks();
  };

  const reading = books.filter((b) => b.status === "reading");
  const finished = books.filter((b) => b.status === "finished");

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold opacity-40 mb-2">
            Bienvenue {user.pseudo}
          </p>
          <h2 className="text-5xl font-serif italic">Mon Journal de Lecture</h2>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-accent text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* READING */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="text-accent" size={20} />
          <h3 className="text-2xl font-serif">Lectures en cours</h3>
          <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-bold">
            {reading.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reading.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onUpdateProgress={(p) => updateProgress(book.id, p)}
              onUpdateBook={updateBook}
              STICKERS={STICKERS}
            />
          ))}
        </div>
      </section>

      {/* FINISHED */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 className="text-accent" size={20} />
          <h3 className="text-2xl font-serif">Terminées récemment</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {finished.slice(0, 6).map((book) => {
            const progress = Math.min(
              100,
              Math.round((book.current_page / (book.total_pages || 1)) * 100),
            );

            return (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="cursor-pointer group"
              >
                <div className="aspect-[3/4] bg-white rounded-xl border border-black/5 mb-2 overflow-hidden shadow-sm group-hover:-translate-y-1 transition-transform">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/5">
                      <Book className="text-accent/20" />
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold line-clamp-1">{book.title}</h4>

                <div className="mt-2">
                  <div className="w-full bg-accent/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-accent h-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODALS */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xl p-8 rounded-3xl my-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-serif italic">Ajouter un livre</h3>

                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                >
                  <Camera size={16} />
                  Scanner
                </button>
              </div>

              {isFetching && (
                <div className="mb-6 p-4 bg-accent/5 rounded-2xl flex items-center gap-3 text-accent animate-pulse">
                  <Loader2 className="animate-spin" size={20} />
                  <p className="text-sm font-medium">
                    Récupération des informations...
                  </p>
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleAddBook}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* TITLE + COVER */}
                <div className="md:col-span-2 flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Titre
                    </label>
                    <input
                      className="w-full p-3 bg-paper rounded-xl border border-black/5"
                      value={newBook.title}
                      onChange={(e) =>
                        setNewBook({ ...newBook, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="w-24 aspect-[3/4] bg-paper rounded-xl border border-dashed border-black/20 flex flex-col items-center justify-center relative overflow-hidden group">
                    {newBook.cover_url ? (
                      <img
                        src={newBook.cover_url}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Upload size={20} className="text-black/20" />
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-[8px] text-white font-bold uppercase tracking-widest">
                        Changer
                      </p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>

                {/* AUTHOR */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Auteur
                  </label>
                  <input
                    className="w-full p-3 bg-paper rounded-xl border border-black/5"
                    value={newBook.author}
                    onChange={(e) =>
                      setNewBook({ ...newBook, author: e.target.value })
                    }
                    required
                  />
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Catégorie
                  </label>
                  <select
                    className="w-full p-3 bg-paper rounded-xl border border-black/5"
                    value={newBook.category}
                    onChange={(e) =>
                      setNewBook({ ...newBook, category: e.target.value })
                    }
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUPPORT */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Support
                  </label>
                  <select
                    className="w-full p-3 bg-paper rounded-xl border border-black/5"
                    value={newBook.support}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        support: e.target.value as any,
                      })
                    }
                  >
                    <option value="physical">Physique</option>
                    <option value="ebook">E-book</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>

                {/* EDITION */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Édition
                  </label>
                  <input
                    className="w-full p-3 bg-paper rounded-xl border border-black/5"
                    value={newBook.edition}
                    onChange={(e) =>
                      setNewBook({ ...newBook, edition: e.target.value })
                    }
                  />
                </div>

                {/* TOTAL PAGES */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Pages totales
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-paper rounded-xl border border-black/5"
                    value={newBook.total_pages || ""}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        total_pages: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* CARD FONT */}
                <div className="md:col-span-2 space-y-6 pt-4 border-t border-black/5">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-3 block">
                      Police de la carte
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "sans",
                        "serif",
                        "mono",
                        ...safeJsonArray(profile?.unlocked_fonts),
                      ].map((font) => (
                        <button
                          key={font}
                          type="button"
                          onClick={() =>
                            setNewBook({ ...newBook, card_font: font } as any)
                          }
                          className={`px-4 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                            (newBook as any).card_font === font
                              ? "bg-accent text-white border-accent"
                              : "bg-paper border-black/5 hover:border-accent/30"
                          }`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CARD BACKGROUND */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-3 block">
                      Arrière-plan de la carte
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "bg-white",
                        ...safeJsonArray(profile?.unlocked_backgrounds),
                      ].map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() =>
                            setNewBook({ ...newBook, card_bg: bg } as any)
                          }
                          className={`w-10 h-10 rounded-xl border transition-all ${
                            (newBook as any).card_bg === bg
                              ? "ring-2 ring-accent ring-offset-2"
                              : "border-black/5 hover:border-accent/30"
                          } ${bg === "bg-white" ? "bg-white" : bg}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* CARD STICKERS */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-3 block">
                    Stickers débloqués
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {safeJsonArray(profile?.unlocked_stickers).map(
                      (stickerId) => {
                        const sticker = STICKERS.find(
                          (s) => s.id === stickerId,
                        );
                        if (!sticker) return null;

                        return (
                          <button
                            key={sticker.id}
                            type="button"
                            onClick={() =>
                              setNewBook({
                                ...newBook,
                                stickers: [
                                  ...(newBook.stickers || []),
                                  sticker.id,
                                ],
                              })
                            }
                            className="w-10 h-10 rounded-xl border border-black/10 hover:border-accent/40 transition-all flex items-center justify-center bg-white"
                          >
                            <img
                              src={sticker.url}
                              alt={sticker.label}
                              className="w-6 h-6 object-contain"
                            />
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 p-4 rounded-xl font-medium text-ink/60"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-accent text-white p-4 rounded-xl font-medium"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* SCANNER MODAL */}
        {showScanner && (
          <ScannerModal onScan={handleScan} onClose={closeScanner} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journal;
