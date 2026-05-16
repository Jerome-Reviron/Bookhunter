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

function normalizeCategory(rawCategory: string): string {
  if (!rawCategory) return "Autre";

  const match = BOOK_CATEGORIES.find((cat) =>
    rawCategory.toLowerCase().includes(cat.toLowerCase()),
  );

  return match || "Autre";
}

function extractCategoryFromSubjects(subjects: string[]): string {
  if (!subjects || subjects.length === 0) return "Autre";

  // Normalisation des catégories Bookhunter
  const normalizedCategories = BOOK_CATEGORIES.map((cat) =>
    cat
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  );

  for (const subject of subjects) {
    const cleanSubject = subject
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, " ");

    // On teste chaque catégorie
    for (let i = 0; i < normalizedCategories.length; i++) {
      const cat = normalizedCategories[i];

      if (cleanSubject.includes(cat)) {
        return BOOK_CATEGORIES[i]; // On renvoie la catégorie originale
      }
    }
  }

  return "Autre";
}

// Nettoie les descriptions OpenLibrary (supprime les lignes de type [1]: https://... et [Source][1])
function cleanOpenLibraryDescription(raw: string | undefined | null): string {
  if (!raw) return "";

  return raw
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      // Supprime les lignes de source ou de référence
      return (
        !/^\s*\[\d+\]:\s*https?:\/\//i.test(trimmed) && // [1]: http...
        !/^\[Source\]/i.test(trimmed) && // [Source]
        !/^\[Source\]\[\d+\]/i.test(trimmed) // [Source][1]
      );
    })
    .join("\n")
    .trim();
}

// Traduction gratuite FR via Google Translate public endpoint
async function translateToFrench(text: string): Promise<string> {
  if (!text) return "";

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(
        text,
      )}`,
    );
    const data = await res.json();
    return data[0]?.map((t: any) => t[0]).join("") || text;
  } catch (e) {
    console.error("Erreur traduction:", e);
    return text; // fallback : texte original
  }
}

// --- OpenLibrary FULL SCRAPER ---
// Récupère : titre, auteur, couverture HD, pages, éditeur, année, résumé, catégories
async function fetchFromOpenLibraryFull(isbn: string) {
  try {
    // 1) ISBN → Edition
    const editionRes = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!editionRes.ok) return null;

    const edition = await editionRes.json();

    // 2) WORK
    const workKey = edition.works?.[0]?.key;
    let work = null;

    if (workKey) {
      const workRes = await fetch(`https://openlibrary.org${workKey}.json`);
      if (workRes.ok) work = await workRes.json();
    }

    // 3) AUTHOR
    const authorKey = edition.authors?.[0]?.key;
    let authorName = "";

    if (authorKey) {
      const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
      if (authorRes.ok) {
        const authorData = await authorRes.json();
        authorName = authorData.name || "";
      }
    }

    // 4) COVER HD
    const coverId = edition.covers?.[0] || work?.covers?.[0];
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : "";

    // 5) DESCRIPTION BRUTE
    const rawDescription =
      typeof work?.description === "string"
        ? work.description
        : work?.description?.value || "";

    // 5bis) DESCRIPTION NETTOYÉE
    const description = cleanOpenLibraryDescription(rawDescription);

    // 6) CATÉGORIE
    const category = extractCategoryFromSubjects(work?.subjects || []);

    // 7) Traduction FR automatique
    const titleFr = await translateToFrench(work?.title || edition.title || "");
    const descriptionFr = await translateToFrench(description);

    return {
      title: titleFr,
      author: authorName,
      cover_url: coverUrl,
      total_pages: edition.number_of_pages || 0,
      edition: edition.publishers?.[0] || "",
      category,
      description: descriptionFr,
    };
  } catch (e) {
    console.error("Erreur OpenLibrary Full:", e);
    return null;
  }
}

const Journal = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const navigate = useNavigate();

  const [books, setBooks] = useState<BookEntry[]>([]);
  const [profile, setProfile] = useState<User | null>(null);

  const [STICKERS, setSTICKERS] = useState<Sticker[]>([]);
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);

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
    card_font: "",
    card_bg: "",
  });

  // Load stickers from DB
  useEffect(() => {
    fetch("/api/stickers/user.php", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSTICKERS(data))
      .catch(() => setSTICKERS([]));
  }, []);

  useEffect(() => {
    fetch("/api/backgrounds/user.php", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setBackgrounds(data))
      .catch(() => setBackgrounds([]));
  }, []);

  useEffect(() => {
    fetch("/api/fonts/user.php", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setFonts(data))
      .catch(() => setFonts([]));
  }, []);

  // Load books + profile
  const fetchBooks = async () => {
    try {
      const [booksRes, profileRes] = await Promise.all([
        fetch(`/api/users/books.php?user_id=${user.id}`, {
          credentials: "include",
        }),
        fetch(`/api/user/get.php?user_id=${user.id}`, {
          credentials: "include",
        }),
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

      // 🔥 OpenLibrary FULL (ISBN → Edition → Work → Author)
      const book = await fetchFromOpenLibraryFull(cleanIsbn);

      if (!book) {
        alert(
          "Livre introuvable. Vous pouvez remplir les informations manuellement.",
        );
        return;
      }

      setNewBook((prev) => ({
        ...prev,
        title: book.title,
        author: book.author,
        category: normalizeCategory(book.category),
        total_pages: book.total_pages || 0,
        cover_url: book.cover_url || "",
        support: "physical",
        edition: book.edition || "",
        notes: book.description || "",
      }));
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
      const res = await fetch("/api/books/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...newBook,
          userId: user.id,
          notes: newBook.notes ?? "",
          card_font: newBook.card_font,
          card_bg: newBook.card_bg,
          stickers: newBook.stickers ?? [],
        }),
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
          card_font: "",
          card_bg: "",
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
      credentials: "include",
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
    await fetch(`/api/books/update.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: id,
        ...data,
      }),
    });
    fetchBooks();
  };

  // Delete book
  const deleteBook = async (id: number) => {
    if (!confirm("Supprimer ce livre ?")) return;

    await fetch(`/api/books/delete.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: id }),
    });

    fetchBooks();
  };

  const reading = books.filter((b) => b.status === "reading");
  const finished = books.filter((b) => b.status === "finished");
  const availableBackgrounds = backgrounds;

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold opacity-70 mb-2">
            Bienvenue{" "}
            <span className="font-serif italic text-accent">
              {user?.pseudo}
            </span>
          </p>

          <h2 className="text-5xl font-serif italic">Mon Journal de Lecture</h2>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Ajouter
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {reading.map((book, index) => (
            <BookCard
              key={book.id || `reading-${index}`}
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
          {finished.slice(0, 6).map((book, index) => {
            const progress = Math.min(
              100,
              Math.round((book.current_page / (book.total_pages || 1)) * 100),
            );

            return (
              <div
                key={book.id || `finished-${index}`}
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
              {/* 🔥 OVERLAY PREMIUM AJOUTÉ ICI */}
              {isFetching && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-50">
                  <Loader2 className="animate-spin text-accent" size={32} />
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-serif italic">Ajouter un livre</h3>

                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Camera size={18} />
                  Scanner
                </button>
              </div>

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

                {/* NOTES / RÉSUMÉ */}
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Résumé / Notes
                  </label>
                  <textarea
                    className="w-full p-3 bg-paper rounded-xl border border-black/5 h-32 resize-none"
                    value={newBook.notes || ""}
                    onChange={(e) =>
                      setNewBook({ ...newBook, notes: e.target.value })
                    }
                    placeholder="Résumé du livre, notes personnelles, impressions..."
                  />
                </div>

                {/* CARD FONT */}
                <div className="md:col-span-2 space-y-6 pt-4 border-t border-black/5">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-3 block">
                      Police de la carte
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {fonts.map((font, index) => (
                        <button
                          key={font.id ? `font-${font.id}` : `font-${index}`}
                          type="button"
                          onClick={
                            () =>
                              setNewBook({
                                ...newBook,
                                card_font: font.css_class,
                              }) // ✅ stocke la classe CSS
                          }
                          className={`px-4 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${font.css_class} ${
                            newBook.card_font === font.css_class
                              ? "bg-accent text-white border-accent"
                              : "bg-paper border-black/5 hover:border-accent/30"
                          }`}
                        >
                          {font.label}
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
                      {availableBackgrounds.map((bg, index) => (
                        <button
                          key={bg.id ? `bg-${bg.id}` : `bg-${index}`}
                          type="button"
                          onClick={() =>
                            setNewBook({
                              ...newBook,
                              card_bg: bg.css_class, // ✅ on stocke la classe CSS
                            })
                          }
                          className={`w-10 h-10 rounded-xl border transition-all
                            ${
                              newBook.card_bg === bg.css_class
                                ? "ring-2 ring-accent ring-offset-2"
                                : "border-black/5 hover:border-accent/30"
                            }
                            ${bg.css_class}
                          `}
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
                    {STICKERS.map((sticker, index) => (
                      <button
                        key={
                          sticker.id
                            ? `sticker-${sticker.id}`
                            : `sticker-${index}`
                        }
                        type="button"
                        onClick={() =>
                          setNewBook({
                            ...newBook,
                            stickers: newBook.stickers.includes(sticker.id)
                              ? newBook.stickers.filter((s) => s !== sticker.id)
                              : [...newBook.stickers, sticker.id],
                          })
                        }
                        className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center bg-white
                        ${
                          newBook.stickers.includes(sticker.id)
                            ? "border-accent ring-2 ring-accent ring-offset-2"
                            : "border-black/10 hover:border-accent/40"
                        }
                      `}
                      >
                        <img
                          src={sticker.url}
                          alt={sticker.label}
                          className="w-6 h-6 object-contain"
                        />
                      </button>
                    ))}
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
          <ScannerModal
            onScan={(isbn) => {
              closeScanner(); // 👈 ferme immédiatement la modal Scanner
              handleScan(isbn); // 👈 lance Google Books ensuite
            }}
            onClose={closeScanner}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journal;
