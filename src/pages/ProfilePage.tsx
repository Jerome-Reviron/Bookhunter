import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User as UserIcon,
  Edit3,
  Coins,
  Award,
  Palette,
  Upload,
  Loader2,
} from "lucide-react";

import { User, Sticker } from "../types";

const ProfilePage = ({ user }: { user: User }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editedPseudo, setEditedPseudo] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [STICKERS, setSTICKERS] = useState<Sticker[]>([]);

  // Load stickers
  useEffect(() => {
    fetch("/api/stickers/get.php")
      .then((res) => res.json())
      .then((data) => setSTICKERS(data))
      .catch(() => setSTICKERS([]));
  }, []);

  // Load profile
  useEffect(() => {
    fetch("/api/user/get.php")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setEditedPseudo(data.pseudo);
        setEditedEmail(data.email);
        setAvatarUrl(data.avatar_url || "");
      });
  }, [user.id]);

  // Save profile (pseudo + email + avatar)
  const handleUpdateProfile = async () => {
    const res = await fetch("/api/user/update.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pseudo: editedPseudo,
        email: editedEmail,
        avatar_url: avatarUrl,
      }),
    });

    if (res.ok) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pseudo: editedPseudo,
              email: editedEmail,
              avatar_url: avatarUrl,
            }
          : null
      );
      setIsEditing(false);
    }
  };

  if (!profile)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );

  const stickers = Array.isArray(profile.unlocked_stickers)
    ? profile.unlocked_stickers
    : [];

  const fonts = Array.isArray(profile.unlocked_fonts)
    ? profile.unlocked_fonts
    : [];

  const bgs = Array.isArray(profile.unlocked_backgrounds)
    ? profile.unlocked_backgrounds
    : [];

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-serif italic mb-2">Mon Profil</h2>
          <p className="text-ink/40 uppercase tracking-widest text-xs font-bold">
            Membre depuis le {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={() => {
            setEditedPseudo(profile.pseudo);
            setEditedEmail(profile.email);
            setAvatarUrl(profile.avatar_url || "");
            setIsEditing(true);
          }}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Edit3 size={18} />
          Modifier
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* LEFT CARD */}
        <div className="md:col-span-1 flex flex-col items-center gap-6 bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent/10 bg-accent/5 flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={48} className="text-accent/20" />
              )}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-serif italic">{profile.pseudo}</h3>
            <p className="text-ink/40 text-sm">{profile.email}</p>
          </div>

          <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
            <Coins size={16} />
            <span className="font-bold">{profile.points} Points</span>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:col-span-2 space-y-8">
          {/* STICKERS */}
          <section className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-accent" size={20} />
              <h3 className="text-2xl font-serif">Ma Collection de Stickers</h3>
            </div>

            <div className="flex flex-wrap gap-4">
              {stickers.length === 0 && (
                <p className="text-ink/30 italic">Aucun sticker débloqué.</p>
              )}

              {stickers.map((id: string) => {
                const sticker = STICKERS.find((s) => s.id === id);
                return sticker ? (
                  <div
                    key={id}
                    className="p-4 bg-paper rounded-2xl border border-black/5 flex flex-col items-center gap-2 group hover:border-accent/30 transition-colors"
                  >
                    <img
                      src={sticker.url}
                      className="w-10 h-10 group-hover:scale-110 transition-transform"
                      alt={sticker.label}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {sticker.label}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </section>

          {/* CUSTOMIZATION */}
          <section className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-accent" size={20} />
              <h3 className="text-2xl font-serif">
                Personnalisation Débloquée
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* FONTS */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  Polices
                </p>
                <div className="flex flex-wrap gap-2">
                  {fonts.map((f: string) => (
                    <span
                      key={f}
                      className={`px-3 py-1 bg-paper rounded-lg border border-black/5 text-xs font-bold capitalize ${
                        f === "serif"
                          ? "font-serif"
                          : f === "sans"
                          ? "font-sans"
                          : "font-mono"
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* BACKGROUNDS */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  Arrière-plans
                </p>
                <div className="flex flex-wrap gap-2">
                  {bgs.map((bg: string) => (
                    <div
                      key={bg}
                      className={`w-8 h-8 rounded-lg border border-black/5 ${
                        bg === "white" ? "bg-white" : bg
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* MODAL EDIT PROFILE */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl"
            >
              <h3 className="text-2xl font-serif italic mb-6">
                Modifier mon profil
              </h3>

              <div className="space-y-6">
                {/* PSEUDO */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Pseudo
                  </label>
                  <input
                    type="text"
                    value={editedPseudo}
                    onChange={(e) => setEditedPseudo(e.target.value)}
                    className="mt-2 w-full p-3 rounded-xl border border-black/10 bg-paper"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="mt-2 w-full p-3 rounded-xl border border-black/10 bg-paper"
                  />
                </div>

                {/* AVATAR */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Avatar
                  </label>

                  <div className="mt-4 flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-black/5 bg-paper flex items-center justify-center relative group">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload size={24} className="text-ink/20" />
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setAvatarUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>

                    <p className="text-[10px] text-ink/40 uppercase tracking-widest font-bold">
                      Cliquez pour uploader
                    </p>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 p-4 rounded-2xl font-bold text-ink/40"
                  >
                    Annuler
                  </button>

                  <button
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-accent text-white p-4 rounded-2xl font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
