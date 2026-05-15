import React, { useEffect, useState } from "react";
import {
  Plus,
  Gift,
  Users,
  User as UserIcon,
  ChevronLeft,
  Award,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { User, Club, Message, ClubVote, ClubEvent } from "../types";

const BookClubPage = ({ user }: { user: User }) => {
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [votes, setVotes] = useState<ClubVote[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "chat" | "votes" | "events" | "members"
  >("chat");

  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestData, setSuggestData] = useState({ title: "", author: "" });

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    description: "",
  });

  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [clubData, setClubData] = useState({
    name: "",
    description: "",
    type: "open" as "open" | "invite",
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "open" | "invite">(
    "all",
  );
  const [filterMember, setFilterMember] = useState<"all" | "mine">("all");

  const [invitations, setInvitations] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  const fetchClubs = async () => {
    try {
      const res = await fetch(`/api/clubs/list.php?userId=${user.id}`, {
        credentials: "include",
      });

      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await res.json();
        setClubs(data);
      } else {
        console.error("Invalid response from server:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`/api/clubs/invitations/list.php`, {
        credentials: "include",
      });

      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await res.json();
        setInvitations(data);
      } else {
        console.error("Invalid response from server:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchInvitations();
  }, []);

  const fetchData = async () => {
    if (!selectedClubId) return;

    const [msgRes, voteRes, eventRes, suggestRes, memberRes] =
      await Promise.all([
        fetch(`/api/club/messages/${selectedClubId}`),
        fetch(`/api/club/votes/${selectedClubId}`),
        fetch(`/api/club/events/${selectedClubId}?userId=${user.id}`),
        fetch(`/api/club/suggestions/${selectedClubId}`),
        fetch(`/api/club/members/${selectedClubId}`),
      ]);

    setMessages(await msgRes.json());
    setVotes(await voteRes.json());
    setEvents(await eventRes.json());
    setSuggestions(await suggestRes.json());
    setMembers(await memberRes.json());
  };

  useEffect(() => {
    if (selectedClubId) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedClubId]);

  const handleRSVP = async (eventId: number) => {
    try {
      const res = await fetch(`/api/club/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to RSVP:", err);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...clubData, ownerId: user.id }),
      });

      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await res.json();
        if (data.success) {
          setShowCreateClubModal(false);
          setClubData({ name: "", description: "", type: "open" });
          fetchClubs();
          setSelectedClubId(data.clubId);
        } else {
          alert(data.error || "Erreur lors de la création du club");
        }
      } else {
        alert("Erreur serveur lors de la création du club");
      }
    } catch (err) {
      console.error("Failed to create club:", err);
      alert("Erreur de connexion au serveur");
    }
  };

  const handleInviteUser = async (toUserId: number) => {
    if (!selectedClubId) return;
    try {
      const res = await fetch(`/api/clubs/${selectedClubId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: user.id, toUserId }),
      });
      if (res.ok) {
        alert("Invitation envoyée !");
        setUserSearch("");
        setSearchResults([]);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'invitation");
      }
    } catch (err) {
      console.error("Failed to invite user:", err);
    }
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        fetchInvitations();
        fetchClubs();
      }
    } catch (err) {
      console.error("Failed to accept invitation:", err);
    }
  };

  const handleDeclineInvitation = async (invitationId: number) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/decline`, {
        method: "POST",
      });
      if (res.ok) fetchInvitations();
    } catch (err) {
      console.error("Failed to decline invitation:", err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (userSearch.length > 2) {
        const res = await fetch(`/api/users/search?q=${userSearch}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.filter((u: any) => u.id !== user.id));
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [userSearch]);

  const handleJoinClub = async (clubId: number) => {
    try {
      const res = await fetch(`/api/clubs/${clubId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        fetchClubs();
        setSelectedClubId(clubId);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'adhésion");
      }
    } catch (err) {
      console.error("Failed to join club:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClubId) return;

    await fetch("/api/club/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId: selectedClubId,
        pseudo: user.pseudo,
        message: newMessage,
      }),
    });

    setNewMessage("");
    fetchData();
  };

  const handleVote = async (title: string) => {
    if (!selectedClubId) return;
    await fetch("/api/club/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId: selectedClubId,
        userId: user.id,
        bookTitle: title,
      }),
    });
    fetchData();
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubId) return;

    await fetch("/api/club/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId: selectedClubId,
        userId: user.id,
        ...suggestData,
      }),
    });

    setShowSuggestModal(false);
    setSuggestData({ title: "", author: "" });
    fetchData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubId) return;

    await fetch("/api/club/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId: selectedClubId, ...eventData }),
    });

    setShowEventModal(false);
    setEventData({ title: "", date: "", description: "" });
    fetchData();
  };

  // ---------------------------
  // CLUB LIST VIEW
  // ---------------------------

  if (!selectedClubId) {
    const filteredClubs = clubs.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || c.type === filterType;
      const matchesMember = filterMember === "all" || c.is_member;
      return matchesSearch && matchesType && matchesMember;
    });

    return (
      <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-5xl font-serif italic mb-2">
              Clubs de Lecture
            </h2>
            <p className="text-ink/40">
              Rejoignez une communauté ou créez la vôtre.
            </p>
          </div>

          <button
            onClick={() => setShowCreateClubModal(true)}
            className="bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Créer un Club
          </button>
        </div>

        {/* Invitations */}
        {invitations.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-serif italic mb-6 flex items-center gap-2">
              <Gift size={20} className="text-accent" /> Invitations en attente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white p-6 rounded-3xl border border-accent/20 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold">{inv.club_name}</p>
                    <p className="text-[10px] text-ink/40 uppercase tracking-widest">
                      Invité par {inv.from_username}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeclineInvitation(inv.id)}
                      className="p-2 text-ink/40 hover:text-red-500 transition-colors"
                    >
                      Refuser
                    </button>

                    <button
                      onClick={() => handleAcceptInvitation(inv.id)}
                      className="bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Accepter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/20"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher un club par nom ou description..."
              className="w-full pl-16 pr-6 py-5 bg-white rounded-[32px] border border-black/5 shadow-sm focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Type filter */}
            <div className="flex bg-white p-1 rounded-full border border-black/5 shadow-sm">
              <button
                onClick={() => setFilterType("all")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterType === "all"
                    ? "bg-accent text-white shadow-md"
                    : "text-ink/40 hover:text-ink/60"
                }`}
              >
                Tous
              </button>

              <button
                onClick={() => setFilterType("open")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterType === "open"
                    ? "bg-accent text-white shadow-md"
                    : "text-ink/40 hover:text-ink/60"
                }`}
              >
                Accès Libre
              </button>

              <button
                onClick={() => setFilterType("invite")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterType === "invite"
                    ? "bg-accent text-white shadow-md"
                    : "text-ink/40 hover:text-ink/60"
                }`}
              >
                Sur Invitation
              </button>
            </div>

            {/* Membership filter */}
            <div className="flex bg-white p-1 rounded-full border border-black/5 shadow-sm">
              <button
                onClick={() => setFilterMember("all")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterMember === "all"
                    ? "bg-accent text-white shadow-md"
                    : "text-ink/40 hover:text-ink/60"
                }`}
              >
                Tous les clubs
              </button>

              <button
                onClick={() => setFilterMember("mine")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterMember === "mine"
                    ? "bg-accent text-white shadow-md"
                    : "text-ink/40 hover:text-ink/60"
                }`}
              >
                Mes clubs
              </button>
            </div>
          </div>
        </div>

        {/* Club cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredClubs.length > 0 ? (
            filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-serif italic group-hover:text-accent transition-colors">
                    {club.name}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      club.type === "open"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {club.type === "open" ? "Public" : "Privé"}
                  </span>
                </div>

                <p className="text-ink/60 mb-6 flex-1 line-clamp-3">
                  {club.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-paper border-2 border-white flex items-center justify-center text-[10px] font-bold"
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                    <span className="text-ink/40 text-sm">
                      {club.member_count || 0} membres
                    </span>
                  </div>

                  {club.is_member ? (
                    <button
                      onClick={() => setSelectedClubId(club.id)}
                      className="bg-accent text-white px-6 py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform"
                    >
                      Accéder
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinClub(club.id)}
                      className="bg-accent/10 text-accent px-6 py-3 rounded-full text-sm font-bold hover:bg-accent/20 transition-colors"
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-ink/40">Aucun club trouvé</p>
            </div>
          )}
        </div>

        {/* Create Club Modal */}
        <AnimatePresence>
          {showCreateClubModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateClubModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-serif italic mb-6">
                  Créer un Club
                </h3>
                <form onSubmit={handleCreateClub} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom du club"
                    value={clubData.name}
                    onChange={(e) =>
                      setClubData({ ...clubData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={clubData.description}
                    onChange={(e) =>
                      setClubData({ ...clubData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                    required
                  />
                  <select
                    value={clubData.type}
                    onChange={(e) =>
                      setClubData({
                        ...clubData,
                        type: e.target.value as "open" | "invite",
                      })
                    }
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="open">Accès libre</option>
                    <option value="invite">Sur invitation</option>
                  </select>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateClubModal(false)}
                      className="flex-1 px-4 py-3 border border-black/10 rounded-xl hover:bg-black/5 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-accent text-white rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ---------------------------
  // CLUB DETAIL VIEW
  // ---------------------------

  const selectedClub = clubs.find((c) => c.id === selectedClubId);

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-5xl mx-auto">
      <button
        onClick={() => setSelectedClubId(null)}
        className="flex items-center gap-2 text-ink/60 hover:text-ink mb-8 transition-colors"
      >
        <ChevronLeft size={20} /> Retour aux clubs
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-5xl font-serif italic mb-2">
            {selectedClub?.name}
          </h2>
          <p className="text-ink/40">{selectedClub?.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSuggestModal(true)}
            className="bg-accent/10 text-accent px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent/20 transition-colors"
          >
            <Plus size={20} /> Suggérer
          </button>
          {selectedClub?.owner_id === user.id && (
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-accent text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Award size={20} /> Créer Événement
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-black/5">
        {["chat", "votes", "events", "members"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 font-bold text-sm uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? "text-accent border-b-2 border-accent"
                : "text-ink/40 hover:text-ink/60"
            }`}
          >
            {tab === "chat" && "Chat"}
            {tab === "votes" && "Votes"}
            {tab === "events" && "Événements"}
            {tab === "members" && "Membres"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "chat" && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl space-y-4 h-96 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">
                      {msg.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{msg.username}</p>
                      <p className="text-sm text-ink/60">{msg.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-ink/40 text-center py-12">Aucun message</p>
              )}
            </div>
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message..."
                className="flex-1 px-6 py-3 border border-black/10 rounded-full focus:ring-2 focus:ring-accent outline-none"
              />
              <button
                type="submit"
                className="bg-accent text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Envoyer
              </button>
            </form>
          </div>
        )}

        {activeTab === "votes" && (
          <div className="space-y-4">
            {votes.length > 0 ? (
              votes.map((vote) => (
                <div
                  key={vote.book_title}
                  className="bg-white p-6 rounded-3xl flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold">{vote.book_title}</h4>
                    <p className="text-sm text-ink/40">{vote.count} votes</p>
                  </div>
                  <button
                    onClick={() => handleVote(vote.book_title)}
                    className="bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold hover:bg-accent/20 transition-colors"
                  >
                    Voter
                  </button>
                </div>
              ))
            ) : (
              <p className="text-ink/40 text-center py-12">
                Aucun vote en cours
              </p>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="bg-white p-6 rounded-3xl">
                  <h4 className="font-bold mb-2">{event.title}</h4>
                  <p className="text-sm text-ink/40 mb-4">
                    {event.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink/60">{event.date}</span>
                    <button
                      onClick={() => handleRSVP(event.id)}
                      className="bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold hover:bg-accent/20 transition-colors"
                    >
                      RSVP
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-ink/40 text-center py-12">Aucun événement</p>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            {selectedClub?.owner_id === user.id && (
              <div className="bg-white p-6 rounded-3xl">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Rechercher un utilisateur à inviter..."
                  className="w-full px-4 py-3 border border-black/10 rounded-full focus:ring-2 focus:ring-accent outline-none mb-4"
                />
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex justify-between items-center p-3 hover:bg-black/5 rounded-lg"
                      >
                        <span className="font-bold">{result.username}</span>
                        <button
                          onClick={() => handleInviteUser(result.id)}
                          disabled={isInviting}
                          className="bg-accent text-white px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
                        >
                          Inviter
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              {members.length > 0 ? (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white p-4 rounded-2xl flex items-center gap-3"
                  >
                    <UserIcon size={20} className="text-accent" />
                    <div>
                      <p className="font-bold">{member.username}</p>
                      {member.id === selectedClub?.owner_id && (
                        <p className="text-xs text-ink/40">Propriétaire</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-ink/40 text-center py-12">Aucun membre</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSuggestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuggestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-serif italic mb-6">
                Suggérer un livre
              </h3>
              <form onSubmit={handleSuggest} className="space-y-4">
                <input
                  type="text"
                  placeholder="Titre"
                  value={suggestData.title}
                  onChange={(e) =>
                    setSuggestData({ ...suggestData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Auteur"
                  value={suggestData.author}
                  onChange={(e) =>
                    setSuggestData({ ...suggestData, author: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  required
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSuggestModal(false)}
                    className="flex-1 px-4 py-3 border border-black/10 rounded-xl hover:bg-black/5 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-accent text-white rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    Suggérer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-serif italic mb-6">
                Créer un événement
              </h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <input
                  type="text"
                  placeholder="Titre de l'événement"
                  value={eventData.title}
                  onChange={(e) =>
                    setEventData({ ...eventData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  required
                />
                <input
                  type="datetime-local"
                  value={eventData.date}
                  onChange={(e) =>
                    setEventData({ ...eventData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={eventData.description}
                  onChange={(e) =>
                    setEventData({ ...eventData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-black/10 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                  required
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 px-4 py-3 border border-black/10 rounded-xl hover:bg-black/5 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-accent text-white rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookClubPage;
