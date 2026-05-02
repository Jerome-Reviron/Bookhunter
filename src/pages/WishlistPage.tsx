import React, { useEffect, useState } from "react";
import { User, WishlistItem } from "../types";
import { Pencil, Trash2 } from "lucide-react";

const WishlistPage = ({ user }: { user: User }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [newWish, setNewWish] = useState({ title: "", author: "" });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: "", author: "" });

  useEffect(() => {
    fetch("/api/wishlist/get.php", {
      credentials: "include",
    })
      .then((res) =>
        res.ok && res.headers.get("content-type")?.includes("application/json")
          ? res.json()
          : [],
      )
      .then(setWishlist)
      .catch(console.error);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/wishlist/add.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newWish.title, author: newWish.author }),
    });

    if (res.ok) {
      const added = await res.json();
      setWishlist([...wishlist, { ...newWish, id: added.id }]);
      setNewWish({ title: "", author: "" });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/wishlist/delete.php?id=${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (res.ok) {
      setWishlist(wishlist.filter((item) => item.id !== id));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/wishlist/update.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        title: editData.title,
        author: editData.author,
      }),
    });

    if (res.ok) {
      setWishlist(
        wishlist.map((item) =>
          item.id === editingId ? { ...item, ...editData } : item,
        ),
      );
      setEditingId(null);
    }
  };

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-4xl mx-auto">
      <h2 className="text-5xl font-serif italic mb-12">Ma Wishlist</h2>

      {/* ADD FORM */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-6 rounded-3xl border border-black/5 mb-12 flex flex-col md:flex-row gap-4"
      >
        <input
          placeholder="Titre du livre"
          className="flex-1 p-4 bg-paper rounded-2xl border border-black/5"
          value={newWish.title}
          onChange={(e) => setNewWish({ ...newWish, title: e.target.value })}
          required
        />

        <input
          placeholder="Auteur"
          className="flex-1 p-4 bg-paper rounded-2xl border border-black/5"
          value={newWish.author}
          onChange={(e) => setNewWish({ ...newWish, author: e.target.value })}
          required
        />

        <button
          type="submit"
          className="bg-accent text-white px-8 py-4 rounded-2xl font-bold"
        >
          Ajouter
        </button>
      </form>

      {/* LIST */}
      <div className="space-y-4">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-2xl border border-black/5 group"
          >
            {editingId === item.id ? (
              // MODE EDIT
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  className="w-full p-3 bg-paper rounded-xl border border-black/10"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />

                <input
                  className="w-full p-3 bg-paper rounded-xl border border-black/10"
                  value={editData.author}
                  onChange={(e) =>
                    setEditData({ ...editData, author: e.target.value })
                  }
                />

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-accent text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Enregistrer
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-6 py-3 rounded-xl border border-black/10"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              // MODE NORMAL
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-serif">{item.title}</h4>
                  <p className="text-ink/60">{item.author}</p>
                </div>

                {/* ACTIONS AVEC ICÔNES */}
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditData({ title: item.title, author: item.author });
                    }}
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    <Pencil size={22} strokeWidth={2} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-ink hover:text-ink/70 transition-colors"
                  >
                    <Trash2 size={22} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {wishlist.length === 0 && (
          <p className="text-center text-ink/40 py-12">
            Votre wishlist est vide.
          </p>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
