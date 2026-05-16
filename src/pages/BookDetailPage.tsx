import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import {
  ArrowLeft,
  Book,
  Star,
  Edit3,
  Trash2,
  Library,
  Calendar,
  FileText,
  Clock,
  Upload,
  Plus,
  Loader2,
} from "lucide-react";

import { User, BookEntry, Sticker } from "../types";
import { BOOK_CATEGORIES } from "../constants/bookCategories";
import StickerDisplay from "../components/StickerDisplay";

const BookDetailPage = ({ user }: { user: User }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState<BookEntry | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<User | null>(null);

  const [STICKERS, setSTICKERS] = useState<Sticker[]>([]);
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [fonts, setFonts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [localPage, setLocalPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load stickers from DB
  useEffect(() => {
    fetch("/api/stickers/user.php", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSTICKERS(data))
      .catch(() => setSTICKERS([]));
  }, []);

  // Load backgrounds from DB
  useEffect(() => {
    fetch("/api/backgrounds/user.php", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setBackgrounds(data))
      .catch(() => setBackgrounds([]));
  }, []);

  // Load fonts from DB
  useEffect(() => {
    fetch("/api/fonts/user.php", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setFonts(data))
      .catch(() => setFonts([]));
  }, []);

  const fetchBookData = useCallback(async () => {
    if (!id) return;
    try {
      const [bookRes, sessionsRes, profileRes] = await Promise.all([
        fetch(`/api/books/get.php?id=${id}`),
        fetch(`/api/sessions/get.php?id=${id}`),
        fetch(`/api/user/get.php?id=${user.id}`),
      ]);

      if (bookRes.ok) {
        const contentType = bookRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const bookData = await bookRes.json();
          setBook(bookData);
          setEditData(bookData);
          setLocalPage(bookData.current_page);
        } else {
          setError("Erreur lors du chargement des données du livre");
        }
      } else if (bookRes.status === 404) {
        setBook(null);
      } else {
        setError("Erreur serveur lors du chargement du livre");
      }

      if (sessionsRes.ok) {
        const contentType = sessionsRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          setSessions(await sessionsRes.json());
        }
      }

      if (profileRes.ok) {
        const contentType = profileRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          setProfile(await profileRes.json());
        }
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }, [id, user.id]);

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPage(parseInt(e.target.value));
  };

  const handleSliderRelease = async () => {
    if (book && localPage !== book.current_page) {
      try {
        const res = await fetch(`/api/books/update.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book_id: id,
            current_page: localPage,
          }),
        });

        if (res.ok) fetchBookData();
      } catch {
        // silencieux comme dans le reste du projet
      }
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditData((prev: any) => ({
        ...prev,
        cover_url: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/books/update.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: id,
        ...editData,
      }),
    });

    if (res.ok) {
      setIsEditing(false);
      fetchBookData();
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) navigate("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-64">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );

  const safeJsonArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center md:pl-64 p-6 text-center">
        <h2 className="text-3xl font-serif italic mb-4 text-red-500">
          {error}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="text-accent font-bold uppercase tracking-widest text-xs"
        >
          Retour au journal
        </button>
      </div>
    );

  if (!book)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center md:pl-64 p-6 text-center">
        <h2 className="text-3xl font-serif italic mb-4">Livre non trouvé</h2>
        <button
          onClick={() => navigate("/")}
          className="text-accent font-bold uppercase tracking-widest text-xs"
        >
          Retour au journal
        </button>
      </div>
    );

  const progress = Math.min(
    100,
    Math.round((book.current_page / (book.total_pages || 1)) * 100),
  );

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-ink/40 hover:text-accent transition-colors mb-8 group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-xs font-bold uppercase tracking-widest">
          Retour
        </span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Sidebar */}
        <div className="space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="aspect-[3/4] bg-accent/5 rounded-[40px] overflow-hidden shadow-2xl relative group"
          >
            {book.cover_url ? (
              <img
                src={book.cover_url}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Book size={64} className="text-accent/20" />
              </div>
            )}
            <StickerDisplay
              stickersJson={book.stickers}
              size="md"
              STICKERS={STICKERS}
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent shadow-sm">
              {book.status === "reading"
                ? "En cours"
                : book.status === "finished"
                  ? "Terminé"
                  : "À lire"}
            </div>
          </motion.div>

          <div className="bg-white p-6 rounded-3xl border border-black/5 space-y-6">
            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <div className="relative w-full h-6 flex items-center group/slider">
                <div className="absolute inset-0 bg-accent/5 h-2 my-auto rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-accent h-full"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={book.total_pages || 100}
                  value={localPage}
                  onChange={handleSliderChange}
                  onMouseUp={handleSliderRelease}
                  onTouchEnd={handleSliderRelease}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute h-4 w-4 bg-white border-2 border-accent rounded-full shadow-md pointer-events-none transition-transform group-hover/slider:scale-125"
                  style={{
                    left: `calc(${progress}% - 8px)`,
                  }}
                />
              </div>
              <p className="text-center text-xs mt-2 text-ink/40">
                {localPage} sur {book.total_pages} pages
              </p>
            </div>

            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={async () => {
                    const newRating = star;

                    // Mise à jour locale immédiate
                    setBook((prev) => {
                      if (!prev) return prev;
                      return { ...prev, rating: newRating };
                    });

                    // Mise à jour backend
                    await fetch(`/api/books/update.php`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        book_id: id,
                        rating: newRating,
                      }),
                    });

                    // Recharge propre depuis backend
                    fetchBookData();
                  }}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    size={24}
                    className={
                      star <= (book.rating || 0)
                        ? "fill-accent text-accent"
                        : "text-black/10"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditData(book);
                setIsEditing(true);
              }}
              className="flex-1 bg-white border border-black/5 p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-paper transition-colors"
            >
              <Edit3 size={18} />
              <span className="text-sm font-bold">Modifier</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-4 rounded-2xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-12">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-accent mb-2">
              {book.category}
            </p>
            <h1 className="text-6xl font-serif italic mb-4 leading-tight">
              {book.title}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-2xl text-ink/60 font-serif">{book.author}</p>
              {book.edition && (
                <>
                  <span className="w-1 h-1 bg-ink/20 rounded-full" />
                  <p className="text-sm font-bold uppercase tracking-widest text-ink/40">
                    {book.edition}
                  </p>
                </>
              )}
            </div>
          </header>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-black/5 flex items-center gap-4">
              <div className="bg-accent/5 p-3 rounded-2xl text-accent">
                <Library size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  Support
                </p>
                <p className="font-medium capitalize">
                  {book.support === "physical" ? "Physique" : book.support}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-black/5 flex items-center gap-4">
              <div className="bg-accent/5 p-3 rounded-2xl text-accent">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  Commencé le
                </p>
                <p className="font-medium">
                  {book.start_date
                    ? new Date(book.start_date).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-accent" size={20} />
              <h3 className="text-2xl font-serif">Notes & Pensées</h3>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-black/5 min-h-[200px]">
              {book.notes ? (
                <p className="text-ink/70 leading-relaxed whitespace-pre-wrap italic font-serif text-lg">
                  "{book.notes}"
                </p>
              ) : (
                <p className="text-ink/30 italic text-center py-12">
                  Aucune note pour le moment. Cliquez sur modifier pour en
                  ajouter.
                </p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-accent" size={20} />
              <h3 className="text-2xl font-serif">Historique de lecture</h3>
            </div>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-ink/30 italic text-center py-8">
                  Aucune session enregistrée.
                </p>
              ) : (
                sessions.map((session, index) => (
                  <div
                    key={session.id ?? `session-${index}`}
                    className="bg-white p-6 rounded-3xl border border-black/5 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/5 p-2 rounded-xl text-accent text-xs font-bold">
                        +{session.pages_read}p
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Session de lecture
                        </p>
                        <p className="text-[10px] text-ink/40 uppercase tracking-widest">
                          {new Date(session.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-accent">
                      {session.duration_minutes} min
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-2xl p-8 rounded-[40px] relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 text-ink/40 hover:text-ink"
              >
                <Plus className="rotate-45" />
              </button>
              <h2 className="text-3xl font-serif italic mb-8">
                Modifier le livre
              </h2>
              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2 flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Titre
                    </label>
                    <input
                      className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="w-24 aspect-[3/4] bg-paper rounded-xl border border-dashed border-black/20 flex flex-col items-center justify-center relative overflow-hidden group">
                    {editData.cover_url ? (
                      <img
                        src={editData.cover_url}
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
                      onChange={handleEditImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Auteur
                  </label>
                  <input
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={editData.author}
                    onChange={(e) =>
                      setEditData({ ...editData, author: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Catégorie
                  </label>
                  <select
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                  >
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Statut
                  </label>
                  <select
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                  >
                    <option value="to-read">À lire</option>
                    <option value="reading">En cours</option>
                    <option value="finished">Terminé</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Édition
                  </label>
                  <input
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={editData.edition || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, edition: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Note (1-5)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditData({
                          ...editData,
                          rating: Math.max(0, (editData.rating || 0) - 1),
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-paper border border-black/10 hover:border-accent/30"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="1"
                      readOnly
                      inputMode="numeric"
                      pattern="[0-5]"
                      className="w-full p-4 bg-paper rounded-2xl border border-black/5 text-center"
                      value={editData.rating ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 0 && val <= 5) {
                          setEditData({ ...editData, rating: val });
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setEditData({
                          ...editData,
                          rating: Math.min(5, (editData.rating || 0) + 1),
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-paper border border-black/10 hover:border-accent/30"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Pages totales
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={editData.total_pages}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        total_pages: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Notes personnelles
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={editData.notes || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, notes: e.target.value })
                    }
                    placeholder="Qu'avez-vous pensé de ce livre ?"
                  />
                </div>

                <div className="md:col-span-2 pt-6 border-t border-black/5 space-y-8">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-4">
                      Personnalisation (Stickers - Max 5)
                    </label>

                    <div className="flex flex-wrap gap-4 mb-2">
                      {STICKERS.map((sticker) => {
                        const currentStickers = safeJsonArray(
                          editData.stickers,
                        );
                        const unlockedStickers = safeJsonArray(
                          profile?.unlocked_stickers,
                        );

                        const isSelected = currentStickers.includes(sticker.id);
                        const isUnlocked = unlockedStickers.includes(
                          sticker.id,
                        );

                        const isDefault = [
                          "heart",
                          "star",
                          "coffee",
                          "cat",
                          "bookmark",
                          "glasses",
                          "moon",
                          "cactus",
                        ].includes(sticker.id);

                        if (!isDefault && !isUnlocked) return null;

                        return (
                          <button
                            key={sticker.id}
                            type="button"
                            onClick={() => {
                              let newStickers = [...currentStickers];

                              if (isSelected) {
                                newStickers = newStickers.filter(
                                  (id) => id !== sticker.id,
                                );
                              } else if (newStickers.length < 5) {
                                newStickers.push(sticker.id);
                              }

                              setEditData({
                                ...editData,
                                stickers: JSON.stringify(newStickers),
                              });
                            }}
                            className={`p-3 rounded-2xl border transition-all ${
                              isSelected
                                ? "bg-accent/10 border-accent"
                                : "bg-paper border-black/5 hover:border-accent/30"
                            }`}
                          >
                            <img
                              src={sticker.url}
                              className="w-8 h-8"
                              alt={sticker.label}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-ink/40 italic">
                      Cliquez sur un sticker pour l'ajouter ou le retirer.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Police */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-4">
                        Police de la carte
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {fonts.map((font) => (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() =>
                              setEditData({
                                ...editData,
                                card_font: font.css_class,
                              })
                            }
                            className={`px-4 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${font.css_class} ${
                              editData.card_font === font.css_class
                                ? "bg-accent text-white border-accent"
                                : "bg-paper border-black/5 hover:border-accent/30"
                            }`}
                          >
                            {font.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-4">
                        Arrière-plan de la carte
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {backgrounds.map((bg) => (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() =>
                              setEditData({
                                ...editData,
                                card_bg: bg.css_class,
                              })
                            }
                            className={`w-10 h-10 rounded-xl border transition-all ${
                              editData.card_bg === bg.css_class
                                ? "ring-2 ring-accent ring-offset-2"
                                : "border-black/5 hover:border-accent/30"
                            } ${bg.css_class}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 p-4 rounded-2xl font-bold text-ink/40"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-accent text-white p-4 rounded-2xl font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookDetailPage;
