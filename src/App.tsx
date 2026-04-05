import React, { useState, useEffect, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  BookOpen,
  Library,
  Heart,
  BarChart2,
  Users,
  LogOut,
  Plus,
  Search,
  Book,
  CheckCircle2,
  Clock,
  Star,
  Camera,
  Loader2,
  Upload,
  ArrowLeft,
  Calendar,
  Tag,
  FileText,
  Trash2,
  Edit3,
  Trophy,
  ShoppingBag,
  User as UserIcon,
  Coins,
  Palette,
  Type as TypeIcon,
  Gift,
  ExternalLink,
  Award,
  ChevronLeft,
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const BOOK_CATEGORIES = [
  "Fiction",
  "Fantaisie",
  "Science-Fiction",
  "Policier",
  "Thriller",
  "Romance",
  "Historique",
  "Biographie",
  "Développement Personnel",
  "Essai",
  "Non-fiction",
  "Jeunesse",
  "Bande Dessinée",
  "Manga",
  "Classique",
  "Poésie",
  "Théâtre",
  "Autre",
];

const STICKERS = [
  {
    id: "heart",
    url: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
    label: "Cœur",
  },
  {
    id: "star",
    url: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    label: "Étoile",
  },
  {
    id: "coffee",
    url: "https://cdn-icons-png.flaticon.com/512/3054/3054889.png",
    label: "Café",
  },
  {
    id: "cat",
    url: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    label: "Chat",
  },
  {
    id: "bookmark",
    url: "https://cdn-icons-png.flaticon.com/512/566/566412.png",
    label: "Marque-page",
  },
  {
    id: "glasses",
    url: "https://cdn-icons-png.flaticon.com/512/3050/3050525.png",
    label: "Lunettes",
  },
  {
    id: "moon",
    url: "https://cdn-icons-png.flaticon.com/512/1828/1828961.png",
    label: "Lune",
  },
  {
    id: "cactus",
    url: "https://cdn-icons-png.flaticon.com/512/3062/3062130.png",
    label: "Cactus",
  },
  {
    id: "owl",
    url: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png",
    label: "Chouette",
  },
  {
    id: "crown",
    url: "https://cdn-icons-png.flaticon.com/512/6941/6941697.png",
    label: "Couronne",
  },
  {
    id: "dragon",
    url: "https://cdn-icons-png.flaticon.com/512/616/616542.png",
    label: "Dragon",
  },
];
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Types ---
interface User {
  id: number;
  username: string;
  email: string;
  points: number;
  role: "user" | "admin";
  is_premium: boolean;
  avatar_url?: string;
  unlocked_stickers: string; // JSON array
  unlocked_fonts: string; // JSON array
  unlocked_backgrounds: string; // JSON array
  created_at: string;
}

interface Club {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  owner_name: string;
  type: "open" | "invite";
  member_count: number;
  created_at: string;
}

interface BookEntry {
  id: number;
  title: string;
  author: string;
  category: string;
  support: "physical" | "ebook" | "audio";
  edition: string;
  status: "to-read" | "reading" | "finished";
  rating?: number;
  start_date?: string;
  end_date?: string;
  cover_url?: string;
  total_pages: number;
  current_page: number;
  notes?: string;
  tags?: string;
  stickers?: string;
  card_font: string;
  card_bg: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  reward_type: "sticker" | "points";
  reward_value: string;
  requirement_type: "books_finished" | "pages_read" | "sessions_count";
  requirement_value: number;
  currentProgress: number;
  completed: boolean;
  claimed: boolean;
}

interface ShopItem {
  id: number;
  type: "sticker" | "font" | "background";
  name: string;
  price_points: number;
  stripe_url: string;
  image_url: string;
  value: string;
}

interface ReadingSession {
  id: number;
  book_id: number;
  pages_read: number;
  duration_minutes: number;
  timestamp: string;
}

interface ClubVote {
  book_title: string;
  count: number;
}

interface ClubEvent {
  id: number;
  club_id: number;
  title: string;
  date: string;
  description: string;
  attendee_count: number;
  is_attending?: boolean;
}

interface WishlistItem {
  id: number;
  title: string;
  author: string;
}

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

// --- Components ---

const StickerDisplay = ({
  stickersJson,
  size = "sm",
}: {
  stickersJson?: string;
  size?: "sm" | "md";
}) => {
  if (!stickersJson) return null;
  try {
    const stickerIds: string[] = JSON.parse(stickersJson);
    const stickerList = stickerIds
      .map((id) => STICKERS.find((s) => s.id === id))
      .filter(Boolean);

    // Simple hash to seed random positions based on stickers string
    let hash = 0;
    for (let i = 0; i < stickersJson.length; i++) {
      hash = (hash << 5) - hash + stickersJson.charCodeAt(i);
      hash |= 0;
    }

    const getSeededPos = (index: number) => {
      const xSeed = Math.sin(hash + index * 100) * 10000;
      const ySeed = Math.cos(hash + index * 200) * 10000;
      const sizeSeed = Math.sin(hash + index * 300) * 10000;

      const rx = xSeed - Math.floor(xSeed);
      const ry = ySeed - Math.floor(ySeed);

      let x, y;
      const quadrant = index % 4;
      if (quadrant === 0) {
        // Left strip
        x = rx * 20;
        y = ry * 85;
      } else if (quadrant === 1) {
        // Right strip
        x = 75 + rx * 15;
        y = ry * 85;
      } else if (quadrant === 2) {
        // Top strip
        x = 20 + rx * 55;
        y = ry * 20;
      } else {
        // Bottom strip
        x = 20 + rx * 55;
        y = 75 + ry * 15;
      }

      const scale = 0.7 + (sizeSeed - Math.floor(sizeSeed)) * 0.7; // 0.7 to 1.4 scale

      return { x, y, scale };
    };

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stickerList.slice(0, 5).map((sticker, idx) => {
          const { x, y, scale } = getSeededPos(idx);
          const baseSize = size === "sm" ? 24 : 40;
          const finalSize = baseSize * scale;

          return (
            <motion.img
              key={`${sticker?.id}-${idx}`}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: idx % 2 === 0 ? 15 : -15 }}
              src={sticker?.url}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${finalSize}px`,
                height: `${finalSize}px`,
                zIndex: 10 + idx, // Different positive z-index
              }}
              className="absolute drop-shadow-lg"
              alt={sticker?.label}
            />
          );
        })}
      </div>
    );
  } catch (e) {
    return null;
  }
};

const Navbar = ({
  user,
  onLogout,
  onInstall,
  showInstall,
}: {
  user: User | null;
  onLogout: () => void;
  onInstall: () => void;
  showInstall: boolean;
}) => {
  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-6 py-3 z-50 md:top-0 md:bottom-auto md:flex-col md:w-64 md:h-screen md:border-r md:border-t-0">
      <div className="hidden md:block mb-12 mt-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-serif italic text-accent">Lumina</h1>
          {window.matchMedia("(display-mode: standalone)").matches && (
            <span className="bg-accent/10 text-accent text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
              PWA
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-around items-center md:flex-col md:items-start md:gap-6">
        <NavLink to="/" icon={<BookOpen size={24} />} label="Journal" />
        <NavLink
          to="/library"
          icon={<Library size={24} />}
          label="Bibliothèque"
        />
        <NavLink to="/wishlist" icon={<Heart size={24} />} label="Wishlist" />
        <NavLink to="/stats" icon={<BarChart2 size={24} />} label="Stats" />
        <NavLink to="/shop" icon={<ShoppingBag size={24} />} label="Boutique" />
        <NavLink to="/club" icon={<Users size={24} />} label="Club" />
        <NavLink to="/profile" icon={<UserIcon size={24} />} label="Profil" />

        {showInstall && (
          <button
            onClick={onInstall}
            className="hidden md:flex items-center gap-4 text-accent hover:opacity-80 transition-opacity w-full mt-4"
          >
            <Plus size={24} className="bg-accent/10 p-1 rounded" />
            <span className="text-sm font-medium">Installer l'App</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-ink/60 hover:text-accent transition-colors md:flex-row md:gap-4 md:w-full md:mt-auto"
        >
          <LogOut size={24} />
          <span className="text-[10px] uppercase tracking-widest font-medium md:text-sm md:normal-case md:tracking-normal">
            Déconnexion
          </span>
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-1 text-ink/60 hover:text-accent transition-colors md:flex-row md:gap-4 md:w-full"
  >
    {icon}
    <span className="text-[10px] uppercase tracking-widest font-medium md:text-sm md:normal-case md:tracking-normal">
      {label}
    </span>
  </Link>
);

// --- Pages ---

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    if (res.ok) {
      const user = await res.json();
      onLogin(user);
      navigate("/");
    } else {
      setError("Identifiants invalides");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-black/5"
      >
        <h2 className="text-4xl font-serif italic mb-8 text-center">
          Connexion
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-2 opacity-60">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-paper rounded-2xl border border-black/5 focus:outline-none focus:border-accent/30 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-2 opacity-60">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-paper rounded-2xl border border-black/5 focus:outline-none focus:border-accent/30 transition-colors"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-accent text-white p-4 rounded-2xl font-medium hover:opacity-90 transition-opacity"
          >
            Se connecter
          </button>
        </form>
        <div className="mt-8 text-center space-y-2">
          <Link
            to="/register"
            className="block text-sm text-accent hover:underline"
          >
            Créer un compte
          </Link>
          <Link
            to="/forgot-password"
            className="block text-sm text-ink/40 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const Register = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, pseudo }),
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok && data.success) {
      navigate("/login");
    } else {
      setError(data.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-black/5"
      >
        <h2 className="text-4xl font-serif italic mb-8 text-center">
          Inscription
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-2 opacity-60">
              Pseudo
            </label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full p-4 bg-paper rounded-2xl border border-black/5 focus:outline-none focus:border-accent/30 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-2 opacity-60">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-paper rounded-2xl border border-black/5 focus:outline-none focus:border-accent/30 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-2 opacity-60">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-paper rounded-2xl border border-black/5 focus:outline-none focus:border-accent/30 transition-colors"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-accent text-white p-4 rounded-2xl font-medium hover:opacity-90 transition-opacity"
          >
            S'inscrire
          </button>
        </form>

        <p className="mt-8 text-center text-sm">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

const ScannerModal = React.memo(
  ({
    onScan,
    onClose,
  }: {
    onScan: (isbn: string) => void;
    onClose: () => void;
  }) => {
    const [error, setError] = useState<string | null>(null);
    const [manualIsbn, setManualIsbn] = useState("");
    const [cameras, setCameras] = useState<any[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string | null>(
      null,
    );
    const scanningRef = React.useRef(false);
    const html5QrCodeRef = React.useRef<Html5Qrcode | null>(null);

    useEffect(() => {
      // Récupérer les caméras disponibles
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Préférer la caméra arrière par défaut
            const backCamera = devices.find(
              (d) =>
                d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("arrière"),
            );
            setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération des caméras:", err);
        });

      return () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      };
    }, []);

    useEffect(() => {
      if (!selectedCameraId) return;

      // Petit délai pour s'assurer que le DOM est prêt
      const timer = setTimeout(() => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => startScanner())
            .catch(() => startScanner());
        } else {
          startScanner();
        }
      }, 500);

      const startScanner = () => {
        const html5QrCode = new Html5Qrcode("reader", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
          verbose: false,
        });
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 15, // Augmenté pour plus de réactivité
          qrbox: { width: 240, height: 130 }, // Taille fixe plus standard pour les codes-barres
          aspectRatio: 1.333333,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        };

        html5QrCode
          .start(
            selectedCameraId,
            config,
            (decodedText) => {
              if (scanningRef.current) return;
              scanningRef.current = true;

              if (window.navigator.vibrate) window.navigator.vibrate(100);

              html5QrCode
                .stop()
                .then(() => {
                  onScan(decodedText);
                  onClose();
                })
                .catch(() => {
                  onScan(decodedText);
                  onClose();
                });
            },
            () => {
              // Ignore noise
            },
          )
          .catch((err) => {
            setError(
              "Impossible d'accéder à la caméra. Vérifiez les permissions ou essayez une autre caméra.",
            );
            console.error(err);
          });
      };

      return () => {
        clearTimeout(timer);
      };
    }, [selectedCameraId]);

    const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (manualIsbn.trim()) {
        onScan(manualIsbn.trim());
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden relative shadow-2xl">
          <div className="p-5 border-b border-black/5 flex justify-between items-center bg-paper/50">
            <div>
              <h3 className="text-xl font-serif italic">Scanner un livre</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                Placez le code-barres dans le cadre
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <Plus className="rotate-45" size={20} />
            </button>
          </div>

          <div className="p-5">
            <div
              id="reader"
              className="w-full aspect-[4/3] bg-black rounded-[32px] overflow-hidden shadow-inner relative"
            >
              <div className="absolute inset-0 border-2 border-accent/30 rounded-[32px] pointer-events-none z-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[130px] border-2 border-accent rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.5)]"></div>
              </div>
            </div>

            {cameras.length > 1 && (
              <div className="mt-3">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1 block">
                  Changer de caméra
                </label>
                <select
                  className="w-full p-2 bg-paper rounded-xl border border-black/5 text-xs"
                  value={selectedCameraId || ""}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                >
                  {cameras.map((camera, index) => (
                    <option key={camera.id || index} value={camera.id}>
                      {camera.label || `Caméra ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 text-[11px] text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-black/5">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 text-center">
                Ou saisissez le code manuellement
              </p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ISBN"
                  className="flex-1 p-3 bg-paper rounded-xl border border-black/5 focus:outline-none focus:border-accent/30 text-xs"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!manualIsbn.trim()}
                  className="bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30 transition-opacity"
                >
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const Journal = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    category: "Fiction",
    support: "physical" as const,
    edition: "",
    status: "reading" as const,
    total_pages: 0,
    cover_url: "",
  });

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
        if (contentType && contentType.includes("application/json")) {
          setBooks(await booksRes.json());
        }
      }
      if (profileRes.ok) {
        const contentType = profileRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          setProfile(await profileRes.json());
        }
      }
    } catch (err) {
      console.error("Failed to fetch books:", err);
    }
  };

  const closeScanner = useCallback(() => setShowScanner(false), []);

  useEffect(() => {
    fetchBooks();
  }, [user.id]);

  const handleScan = useCallback(async (isbn: string) => {
    if (!isbn) return;

    setIsFetching(true);
    try {
      // Nettoyage léger
      const cleanIsbn = isbn.trim().replace(/[^0-9X]/gi, "");

      // On essaie plusieurs variantes de requêtes
      const queries = cleanIsbn ? [`isbn:${cleanIsbn}`, cleanIsbn] : [isbn];
      let bookFound = false;

      for (const q of queries) {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();

        if (data.items && data.items.length > 0) {
          const info = data.items[0].volumeInfo;
          const saleInfo = data.items[0].saleInfo;

          // Amélioration de la récupération de la couverture
          let coverUrl = "";
          if (info.imageLinks) {
            // On essaie de prendre la meilleure qualité possible
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

          // Si pas de couverture Google ou URL vide, on tente OpenLibrary avec l'ISBN
          if ((!coverUrl || coverUrl === "") && cleanIsbn) {
            coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
          }

          // Fallback final si l'URL semble invalide ou vide
          if (!coverUrl) {
            coverUrl = "";
          }

          // Amélioration de la détection de catégorie
          let category = "Fiction";
          if (info.categories && info.categories.length > 0) {
            const rawCat = info.categories.join(" ").toLowerCase();
            // Mapping plus large vers nos catégories
            if (
              rawCat.includes("fantasy") ||
              rawCat.includes("fantaisie") ||
              rawCat.includes("fantastique") ||
              rawCat.includes("magic") ||
              rawCat.includes("sorcellerie") ||
              rawCat.includes("paranormal") ||
              rawCat.includes("vampire")
            )
              category = "Fantaisie";
            else if (
              rawCat.includes("science fiction") ||
              rawCat.includes("dystopia") ||
              rawCat.includes("space") ||
              rawCat.includes("cyberpunk")
            )
              category = "Science-Fiction";
            else if (
              rawCat.includes("romance") ||
              rawCat.includes("love") ||
              rawCat.includes("sentiment")
            )
              category = "Romance";
            else if (
              rawCat.includes("thriller") ||
              rawCat.includes("suspense") ||
              rawCat.includes("horror") ||
              rawCat.includes("épouvante")
            )
              category = "Thriller";
            else if (
              rawCat.includes("mystery") ||
              rawCat.includes("policier") ||
              rawCat.includes("crime") ||
              rawCat.includes("enquête")
            )
              category = "Policier";
            else if (
              rawCat.includes("history") ||
              rawCat.includes("historique") ||
              rawCat.includes("war") ||
              rawCat.includes("guerre")
            )
              category = "Historique";
            else if (
              rawCat.includes("biography") ||
              rawCat.includes("biographie") ||
              rawCat.includes("memoir") ||
              rawCat.includes("autobiographie")
            )
              category = "Biographie";
            else if (
              rawCat.includes("juvenile") ||
              rawCat.includes("jeunesse") ||
              rawCat.includes("enfant") ||
              rawCat.includes("young adult")
            )
              category = "Jeunesse";
            else if (
              rawCat.includes("comics") ||
              rawCat.includes("manga") ||
              rawCat.includes("graphic novel") ||
              rawCat.includes("bd")
            )
              category = "Manga";
            else if (
              rawCat.includes("essay") ||
              rawCat.includes("essai") ||
              rawCat.includes("philosophy") ||
              rawCat.includes("sociologie")
            )
              category = "Essai";
            else if (
              rawCat.includes("self-help") ||
              rawCat.includes("psychology") ||
              rawCat.includes("bien-être")
            )
              category = "Développement Personnel";
            else category = "Fiction"; // Par défaut
          } else if (info.mainCategory) {
            category = info.mainCategory;
          }

          // Tentative de détection du support (par défaut physique si on scanne un code-barres)
          let support: "physical" | "ebook" | "audio" = "physical";
          if (saleInfo?.isEbook) {
            support = "ebook";
          }
          // Note: Google Books n'indique pas vraiment si c'est un audiobook via cette API facilement

          setNewBook((prev) => ({
            ...prev,
            title: info.title || "",
            author: info.authors ? info.authors.join(", ") : "",
            category: category,
            total_pages: info.pageCount || info.printedPageCount || 0,
            cover_url: coverUrl,
            support: support,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBook((prev) => ({ ...prev, cover_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

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
        });
      } else {
        const errorData = await res.json();
        if (res.status === 401) {
          onLogout();
        }
        alert(`Erreur lors de l'ajout : ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur.");
    }
  };

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

  const updateBook = async (id: number, data: any) => {
    await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchBooks();
  };

  const deleteBook = async (id: number) => {
    if (!confirm("Supprimer ce livre ?")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    fetchBooks();
  };

  const reading = books.filter((b) => b.status === "reading");
  const finished = books.filter((b) => b.status === "finished");

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold opacity-40 mb-2">
            Bienvenue, {user.username}
          </p>
          <h2 className="text-5xl font-serif italic">Journal de Lecture</h2>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-accent text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

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
              onUpdateProgress={(p: number) => updateProgress(book.id, p)}
              onUpdateBook={updateBook}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 className="text-accent" size={20} />
          <h3 className="text-2xl font-serif">Terminés récemment</h3>
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

      {/* Modals */}
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

              <form
                onSubmit={handleAddBook}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
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
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Support
                  </label>
                  <select
                    className="w-full p-3 bg-paper rounded-xl border border-black/5"
                    value={newBook.support}
                    onChange={(e) =>
                      setNewBook({ ...newBook, support: e.target.value as any })
                    }
                  >
                    <option value="physical">Physique</option>
                    <option value="ebook">E-book</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
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
                        ...JSON.parse(profile?.unlocked_fonts || "[]"),
                      ].map((font) => (
                        <button
                          key={font}
                          type="button"
                          onClick={() =>
                            setNewBook({ ...newBook, card_font: font } as any)
                          }
                          className={`px-4 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${(newBook as any).card_font === font ? "bg-accent text-white border-accent" : "bg-paper border-black/5 hover:border-accent/30"}`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-3 block">
                      Arrière-plan de la carte
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "bg-white",
                        ...JSON.parse(profile?.unlocked_backgrounds || "[]"),
                      ].map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() =>
                            setNewBook({ ...newBook, card_bg: bg } as any)
                          }
                          className={`w-10 h-10 rounded-xl border transition-all ${(newBook as any).card_bg === bg ? "ring-2 ring-accent ring-offset-2" : "border-black/5 hover:border-accent/30"} ${bg === "bg-white" ? "bg-white" : bg}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

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

        {showScanner && (
          <ScannerModal onScan={handleScan} onClose={closeScanner} />
        )}
      </AnimatePresence>
    </div>
  );
};

const BookCard = ({ book, onUpdateProgress, onUpdateBook }: any) => {
  const navigate = useNavigate();
  const [localPage, setLocalPage] = useState(book.current_page);
  const progress = Math.min(
    100,
    Math.round((localPage / (book.total_pages || 1)) * 100),
  );
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setLocalPage(book.current_page);
  }, [book.current_page]);

  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const stopSession = () => {
    setIsTimerActive(false);
    const pages = Math.max(1, Math.floor(seconds / 60)); // Simulate 1 page per minute
    onUpdateProgress(pages);
    setSeconds(0);
    // Removed alert as per guidelines
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPage(parseInt(e.target.value));
  };

  const handleSliderRelease = async () => {
    if (localPage !== book.current_page) {
      await onUpdateBook(book.id, { current_page: localPage });
    }
  };

  return (
    <motion.div
      layout
      className={`p-6 rounded-3xl border border-black/5 shadow-sm group transition-all ${book.card_bg || "bg-white"} ${book.card_font === "serif" ? "font-serif" : book.card_font === "mono" ? "font-mono" : "font-sans"}`}
    >
      <div className="flex gap-6">
        <div
          onClick={() => navigate(`/book/${book.id}`)}
          className="w-24 aspect-[3/4] bg-accent/5 rounded-xl overflow-hidden shadow-sm cursor-pointer flex-shrink-0 relative"
        >
          {book.cover_url ? (
            <img
              src={book.cover_url}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book size={24} className="text-accent/20" />
            </div>
          )}
          <StickerDisplay stickersJson={book.stickers} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4
              onClick={() => navigate(`/book/${book.id}`)}
              className="text-lg font-serif italic line-clamp-1 cursor-pointer hover:text-accent transition-colors"
            >
              {book.title}
            </h4>
          </div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-ink/60 text-xs">{book.author}</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateBook(book.id, { rating: star });
                  }}
                >
                  <Star
                    size={10}
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

          <div className="mb-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">
              <span>Progression</span>
              <span>
                {localPage} / {book.total_pages} p. ({progress}%)
              </span>
            </div>
            <div className="relative w-full h-4 flex items-center group/slider">
              <div className="absolute inset-0 bg-accent/10 h-1.5 my-auto rounded-full overflow-hidden">
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
                className="absolute h-3 w-3 bg-white border-2 border-accent rounded-full shadow-sm pointer-events-none transition-transform group-hover/slider:scale-125"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!isTimerActive ? (
              <button
                onClick={() => setIsTimerActive(true)}
                className="w-full bg-accent text-white text-[10px] font-bold py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Clock size={12} /> Lancer une session
              </button>
            ) : (
              <button
                onClick={stopSession}
                className="w-full bg-red-500 text-white text-[10px] font-bold py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />{" "}
                {formatTime(seconds)} - Terminer
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateProgress(10)}
                className="flex-1 bg-accent/5 text-accent text-[10px] font-bold py-2 rounded-lg hover:bg-accent hover:text-white transition-colors"
              >
                +10 p.
              </button>
              <button
                onClick={() => onUpdateProgress(25)}
                className="flex-1 bg-accent/5 text-accent text-[10px] font-bold py-2 rounded-lg hover:bg-accent hover:text-white transition-colors"
              >
                +25 p.
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LibraryPage = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [filter, setFilter] = useState<
    "all" | "finished" | "reading" | "to-read"
  >("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/users/books.php?user_id=${user.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setBooks)
      .catch(console.error);
  }, [user.id]);

  const filtered = books.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
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
                <StickerDisplay stickersJson={book.stickers} size="sm" />
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

const WishlistPage = ({ user }: { user: User }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [newWish, setNewWish] = useState({ title: "", author: "" });

  useEffect(() => {
    fetch(`/api/wishlist/${user.id}`)
      .then((res) =>
        res.ok && res.headers.get("content-type")?.includes("application/json")
          ? res.json()
          : [],
      )
      .then(setWishlist)
      .catch(console.error);
  }, [user.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newWish, userId: user.id }),
    });
    if (res.ok) {
      const added = await res.json();
      setWishlist([...wishlist, { ...newWish, id: added.id }]);
      setNewWish({ title: "", author: "" });
    }
  };

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-4xl mx-auto">
      <h2 className="text-5xl font-serif italic mb-12">Ma Wishlist</h2>

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

      <div className="space-y-4">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-2xl border border-black/5 flex justify-between items-center group"
          >
            <div>
              <h4 className="text-xl font-serif">{item.title}</h4>
              <p className="text-ink/60">{item.author}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-accent font-bold text-sm uppercase tracking-widest">
              Acheter
            </button>
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

const StatsPage = ({ user }: { user: User }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/stats/${user.id}`)
      .then((res) =>
        res.ok && res.headers.get("content-type")?.includes("application/json")
          ? res.json()
          : null,
      )
      .then(setStats)
      .catch(console.error);
  }, [user.id]);

  if (!stats) return <div className="md:pl-72 p-6">Chargement...</div>;

  const COLORS = ["#5a5a40", "#8e8e6b", "#c2c2a3", "#d9d9c2", "#ecece0"];

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      <h2 className="text-5xl font-serif italic mb-12">Statistiques</h2>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-black/5 h-[400px]">
          <h3 className="text-2xl font-serif mb-8">Genres favoris</h3>
          <ResponsiveContainer width="100%" height="100%">
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
            <div className="pt-6 border-t border-black/5">
              <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">
                Heatmap d'activité
              </p>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${i % 5 === 0 ? "bg-accent" : i % 3 === 0 ? "bg-accent/40" : "bg-accent/5"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-black/5">
          <h3 className="text-2xl font-serif mb-6">Installation PWA</h3>
          <p className="text-sm text-ink/60 mb-6">
            Pour utiliser Lumina comme une application native sur votre appareil
            :
          </p>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">1</div>
              <div>
                <p className="font-bold text-sm">
                  Ouvrez dans un nouvel onglet
                </p>
                <p className="text-xs text-ink/40">
                  Cliquez sur l'icône "Open in new tab" en haut à droite d'AI
                  Studio.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">2</div>
              <div>
                <p className="font-bold text-sm">Installer</p>
                <p className="text-xs text-ink/40">
                  Sur Chrome : Cliquez sur "Installer" dans la barre d'adresse
                  ou le menu. Sur iOS : "Sur l'écran d'accueil".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      const res = await fetch(`/api/clubs?userId=${user.id}`);
      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await res.json();
        setClubs(data);
      }
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`/api/users/${user.id}/invitations`);
      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/json")
      ) {
        const data = await res.json();
        setInvitations(data);
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

  const handleRSVP = async (eventId: number) => {
    try {
      const res = await fetch(`/api/club/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to RSVP:", err);
    }
  };

  useEffect(() => {
    if (selectedClubId) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedClubId]);

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
        const errorText = await res.text();
        console.error("Server error:", errorText);
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
      if (res.ok) {
        fetchInvitations();
      }
    } catch (err) {
      console.error("Failed to decline invitation:", err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
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

    return () => clearTimeout(delayDebounceFn);
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
        username: user.username,
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
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateClubModal(true)}
              className="bg-accent text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-accent/20"
            >
              <Plus size={20} /> Créer un Club
            </button>
          </div>
        </div>

        {/* Invitations Section */}
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

        {/* Search & Filters */}
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
            <div className="flex bg-white p-1 rounded-full border border-black/5 shadow-sm">
              <button
                onClick={() => setFilterType("all")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterType === "all" ? "bg-accent text-white shadow-md" : "text-ink/40 hover:text-ink/60"}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterType("open")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterType === "open" ? "bg-accent text-white shadow-md" : "text-ink/40 hover:text-ink/60"}`}
              >
                Accès Libre
              </button>
              <button
                onClick={() => setFilterType("invite")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterType === "invite" ? "bg-accent text-white shadow-md" : "text-ink/40 hover:text-ink/60"}`}
              >
                Sur Invitation
              </button>
            </div>

            <div className="flex bg-white p-1 rounded-full border border-black/5 shadow-sm">
              <button
                onClick={() => setFilterMember("all")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterMember === "all" ? "bg-accent text-white shadow-md" : "text-ink/40 hover:text-ink/60"}`}
              >
                Tous les clubs
              </button>
              <button
                onClick={() => setFilterMember("mine")}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterMember === "mine" ? "bg-accent text-white shadow-md" : "text-ink/40 hover:text-ink/60"}`}
              >
                Mes clubs
              </button>
            </div>
          </div>
        </div>

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
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${club.type === "open" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
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
                          className="w-8 h-8 rounded-full bg-paper border-2 border-white flex items-center justify-center"
                        >
                          <UserIcon size={14} className="text-ink/20" />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold opacity-40">
                      {club.member_count} membres
                    </span>
                  </div>
                  {club.is_member ? (
                    <button
                      onClick={() => setSelectedClubId(club.id)}
                      className="bg-accent/10 text-accent px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                    >
                      Ouvrir
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinClub(club.id)}
                      className="bg-accent text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-accent/10"
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-black/10">
              <Users size={48} className="mx-auto text-ink/10 mb-4" />
              <p className="text-ink/40 font-serif italic text-xl">
                Aucun club trouvé pour votre recherche.
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showCreateClubModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl"
              >
                <h3 className="text-2xl font-serif italic mb-6">
                  Créer un nouveau club
                </h3>
                <form onSubmit={handleCreateClub} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Nom du club
                    </label>
                    <input
                      className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                      value={clubData.name}
                      onChange={(e) =>
                        setClubData({ ...clubData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                      value={clubData.description}
                      onChange={(e) =>
                        setClubData({
                          ...clubData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      Type d'accès
                    </label>
                    <select
                      className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                      value={clubData.type}
                      onChange={(e) =>
                        setClubData({
                          ...clubData,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="open">Public (Entrée libre)</option>
                      <option value="invite">Privé (Sur invitation)</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateClubModal(false)}
                      className="flex-1 p-4 rounded-2xl font-bold text-ink/40"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-accent text-white p-4 rounded-2xl font-bold"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const currentClub = clubs.find((c) => c.id === selectedClubId);
  const isOwner = currentClub?.owner_id === user.id;

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-5xl mx-auto h-screen flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <button
            onClick={() => setSelectedClubId(null)}
            className="text-accent text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 hover:underline"
          >
            <ChevronLeft size={14} /> Retour aux clubs
          </button>
          <h2 className="text-5xl font-serif italic">{currentClub?.name}</h2>
        </div>
        <div className="flex bg-white p-1 rounded-full border border-black/5 overflow-x-auto no-scrollbar max-w-full">
          {["chat", "votes", "events", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? "bg-accent text-white" : "text-ink/40"}`}
            >
              {tab === "chat"
                ? "Discussion"
                : tab === "votes"
                  ? "Votes"
                  : tab === "events"
                    ? "Événements"
                    : "Membres"}
            </button>
          ))}
          {isOwner && (
            <button
              onClick={() => setIsInviting(!isInviting)}
              className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${isInviting ? "bg-emerald-500 text-white" : "text-emerald-500 hover:bg-emerald-50"}`}
            >
              Inviter
            </button>
          )}
        </div>
      </div>

      {isInviting && isOwner && (
        <div className="mb-8 bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">
              Inviter des membres
            </h4>
            <button
              onClick={() => setIsInviting(false)}
              className="text-xs text-ink/40"
            >
              Fermer
            </button>
          </div>
          <div className="relative mb-4">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20"
              size={16}
            />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-12 pr-4 py-3 bg-paper rounded-2xl border border-black/5 outline-none focus:ring-2 focus:ring-accent/20"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {searchResults.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 hover:bg-paper rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={14} className="text-accent" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{u.username}</span>
                </div>
                <button
                  onClick={() => handleInviteUser(u.id)}
                  className="text-accent text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  Inviter
                </button>
              </div>
            ))}
            {userSearch.length > 2 && searchResults.length === 0 && (
              <p className="text-center text-xs text-ink/40 py-2">
                Aucun utilisateur trouvé
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.username === user.username ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-3xl ${msg.username === user.username ? "bg-accent text-white rounded-tr-none" : "bg-white border border-black/5 rounded-tl-none"}`}
                  >
                    <p className="text-xs font-bold opacity-60 mb-1">
                      {msg.username}
                    </p>
                    <p>{msg.message}</p>
                  </div>
                  <p className="text-[10px] opacity-40 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <form
              onSubmit={handleSend}
              className="bg-white p-2 rounded-full border border-black/5 flex gap-2"
            >
              <input
                placeholder="Partagez vos impressions..."
                className="flex-1 px-6 py-3 bg-transparent focus:outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="bg-accent text-white px-8 py-3 rounded-full font-bold"
              >
                Envoyer
              </button>
            </form>
          </>
        )}

        {activeTab === "votes" && (
          <div className="space-y-4 overflow-y-auto flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-serif">Prochaine lecture commune</h3>
              <button
                onClick={() => setShowSuggestModal(true)}
                className="bg-accent text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-accent/10 flex items-center gap-2"
              >
                <Plus size={14} /> Suggérer un livre
              </button>
            </div>
            {suggestions.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-black/5 text-center">
                <p className="text-ink/40 italic">
                  Aucune suggestion pour le moment.
                </p>
              </div>
            ) : (
              suggestions.map((suggestion) => {
                const vote = votes.find(
                  (v) => v.book_title === suggestion.title,
                );
                return (
                  <div
                    key={suggestion.id}
                    className="bg-white p-6 rounded-3xl border border-black/5 flex items-center gap-6"
                  >
                    <div className="bg-accent/5 p-4 rounded-2xl text-center min-w-[100px]">
                      <p className="text-2xl font-serif italic text-accent">
                        {vote?.count || 0}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                        Votes
                      </p>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-serif mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-ink/60 italic">
                        {suggestion.author}
                      </p>
                    </div>
                    <button
                      onClick={() => handleVote(suggestion.title)}
                      className="bg-accent text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-accent/10"
                    >
                      Voter
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4 overflow-y-auto flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-serif">Événements à venir</h3>
              {(isOwner || user.role === "admin") && (
                <button
                  onClick={() => setShowEventModal(true)}
                  className="bg-accent text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md shadow-accent/10 flex items-center gap-2"
                >
                  <Plus size={14} /> Créer un événement
                </button>
              )}
            </div>
            {events.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-black/5 text-center">
                <p className="text-ink/40 italic">
                  Aucun événement prévu pour le moment.
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-6 rounded-3xl border border-black/5 flex items-center gap-6"
                >
                  <div className="bg-accent/5 p-4 rounded-2xl text-center min-w-[100px]">
                    <p className="text-2xl font-serif italic text-accent">
                      {new Date(event.date).getDate()}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      {new Date(event.date).toLocaleString("default", {
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-serif mb-1">{event.title}</h4>
                    <p className="text-sm text-ink/60 mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-accent" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
                        {event.attendee_count || 0} participants
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRSVP(event.id)}
                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-md ${event.is_attending ? "bg-emerald-500 text-white shadow-emerald-500/10" : "bg-accent text-white shadow-accent/10 hover:scale-105"}`}
                  >
                    {event.is_attending ? "Je participe" : "Participer"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white p-8 rounded-3xl border border-black/5 overflow-y-auto flex-1">
            <h3 className="text-2xl font-serif mb-6">Membres du club</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-paper rounded-2xl border border-black/5"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent/10 bg-accent/5 flex items-center justify-center">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon size={20} className="text-accent/20" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold flex items-center gap-2">
                      {member.username}
                      {(member.global_role === "admin" ||
                        member.club_role === "owner") && (
                        <Award size={12} className="text-accent" />
                      )}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                      {member.points} Points
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-accent">
                      {member.club_role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSuggestModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl"
            >
              <h3 className="text-2xl font-serif italic mb-6">
                Suggérer un livre
              </h3>
              <form onSubmit={handleSuggest} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Titre
                  </label>
                  <input
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={suggestData.title}
                    onChange={(e) =>
                      setSuggestData({ ...suggestData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Auteur
                  </label>
                  <input
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={suggestData.author}
                    onChange={(e) =>
                      setSuggestData({ ...suggestData, author: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSuggestModal(false)}
                    className="flex-1 p-4 rounded-2xl font-bold text-ink/40"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-accent text-white p-4 rounded-2xl font-bold"
                  >
                    Suggérer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showEventModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl"
            >
              <h3 className="text-2xl font-serif italic mb-6">
                Créer un événement
              </h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Titre
                  </label>
                  <input
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={eventData.title}
                    onChange={(e) =>
                      setEventData({ ...eventData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Date
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={eventData.date}
                    onChange={(e) =>
                      setEventData({ ...eventData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={eventData.description}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 p-4 rounded-2xl font-bold text-ink/40"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-accent text-white p-4 rounded-2xl font-bold"
                  >
                    Créer
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

const BookDetailPage = ({ user }: { user: User }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookEntry | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [localPage, setLocalPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchBookData = useCallback(async () => {
    if (!id) return;
    try {
      const [bookRes, sessionsRes, profileRes] = await Promise.all([
        fetch(`/api/books/${id}`),
        fetch(`/api/sessions/${id}`),
        fetch(`/api/user/${user.id}`),
      ]);

      if (bookRes.ok) {
        const contentType = bookRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const bookData = await bookRes.json();
          setBook(bookData);
          setEditData(bookData);
          setLocalPage(bookData.current_page);
        } else {
          console.error("Book API returned non-JSON response");
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
      console.error("Fetch error in BookDetailPage:", err);
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
        const res = await fetch(`/api/books/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_page: localPage }),
        });
        if (res.ok) {
          fetchBookData();
        } else {
          console.error("Failed to update current page");
        }
      } catch (err) {
        console.error("Error updating current page:", err);
      }
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev: any) => ({
          ...prev,
          cover_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setIsEditing(false);
      fetchBookData();
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) {
      navigate("/");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center md:pl-64">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );

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
        {/* Sidebar: Cover & Quick Stats */}
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
            <StickerDisplay stickersJson={book.stickers} size="md" />
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
                <span>
                  {Math.min(
                    100,
                    Math.round((localPage / (book.total_pages || 1)) * 100),
                  )}
                  %
                </span>
              </div>
              <div className="relative w-full h-6 flex items-center group/slider">
                <div className="absolute inset-0 bg-accent/5 h-2 my-auto rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, Math.round((localPage / (book.total_pages || 1)) * 100))}%`,
                    }}
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
                    left: `calc(${Math.min(100, Math.round((localPage / (book.total_pages || 1)) * 100))}% - 8px)`,
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
                    await fetch(`/api/books/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ rating: star }),
                    });
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

        {/* Main Content */}
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
                sessions.map((session) => (
                  <div
                    key={session.id}
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
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="w-full p-4 bg-paper rounded-2xl border border-black/5"
                    value={editData.rating || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        rating: parseInt(e.target.value),
                      })
                    }
                  />
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
                        let currentStickers: string[] = [];
                        try {
                          currentStickers = editData.stickers
                            ? JSON.parse(editData.stickers)
                            : [];
                        } catch (e) {
                          currentStickers = [];
                        }

                        const isSelected = currentStickers.includes(sticker.id);
                        const isUnlocked = JSON.parse(
                          profile?.unlocked_stickers || "[]",
                        ).includes(sticker.id);
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
                                  (id: string) => id !== sticker.id,
                                );
                              } else if (newStickers.length < 5) {
                                newStickers.push(sticker.id);
                              }
                              setEditData({
                                ...editData,
                                stickers: JSON.stringify(newStickers),
                              });
                            }}
                            className={`p-3 rounded-2xl border transition-all ${isSelected ? "bg-accent/10 border-accent" : "bg-paper border-black/5 hover:border-accent/30"}`}
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
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-4">
                        Police de la carte
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "sans",
                          "serif",
                          "mono",
                          ...JSON.parse(profile?.unlocked_fonts || "[]"),
                        ].map((font) => (
                          <button
                            key={font}
                            type="button"
                            onClick={() =>
                              setEditData({ ...editData, card_font: font })
                            }
                            className={`px-4 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${editData.card_font === font ? "bg-accent text-white border-accent" : "bg-paper border-black/5 hover:border-accent/30"}`}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-4">
                        Arrière-plan de la carte
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "bg-white",
                          ...JSON.parse(profile?.unlocked_backgrounds || "[]"),
                        ].map((bg) => (
                          <button
                            key={bg}
                            type="button"
                            onClick={() =>
                              setEditData({ ...editData, card_bg: bg })
                            }
                            className={`w-10 h-10 rounded-xl border transition-all ${editData.card_bg === bg ? "ring-2 ring-accent ring-offset-2" : "border-black/5 hover:border-accent/30"} ${bg === "bg-white" ? "bg-white" : bg}`}
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

const ProfilePage = ({ user }: { user: User }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetch(`/api/user/${user.id}`)
      .then((res) => res.json())
      .then(setProfile);
  }, [user.id]);

  const handleUpdateAvatar = async () => {
    const res = await fetch(`/api/user/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: avatarUrl }),
    });
    if (res.ok) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      setIsEditing(false);
    }
  };

  if (!profile)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );

  const stickers = JSON.parse(profile.unlocked_stickers || "[]");
  const fonts = JSON.parse(profile.unlocked_fonts || "[]");
  const bgs = JSON.parse(profile.unlocked_backgrounds || "[]");

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-4xl mx-auto">
      <header className="mb-12">
        <h2 className="text-5xl font-serif italic mb-2">Mon Profil</h2>
        <p className="text-ink/40 uppercase tracking-widest text-xs font-bold">
          Membre depuis le {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
            <button
              onClick={() => {
                setAvatarUrl(profile.avatar_url || "");
                setIsEditing(true);
              }}
              className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Edit3 size={16} />
            </button>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-serif italic">{profile.username}</h3>
            <p className="text-ink/40 text-sm">{profile.email}</p>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
            <Coins size={16} />
            <span className="font-bold">{profile.points} Points</span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-accent" size={20} />
              <h3 className="text-2xl font-serif">Ma Collection de Stickers</h3>
            </div>
            <div className="flex flex-wrap gap-4">
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

          <section className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-accent" size={20} />
              <h3 className="text-2xl font-serif">
                Personnalisation Débloquée
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  Polices
                </p>
                <div className="flex flex-wrap gap-2">
                  {fonts.map((f: string) => (
                    <span
                      key={f}
                      className={`px-3 py-1 bg-paper rounded-lg border border-black/5 text-xs font-bold capitalize ${f === "serif" ? "font-serif" : f === "sans" ? "font-sans" : "font-mono"}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  Arrière-plans
                </p>
                <div className="flex flex-wrap gap-2">
                  {bgs.map((bg: string) => (
                    <div
                      key={bg}
                      className={`w-8 h-8 rounded-lg border border-black/5 ${bg === "white" ? "bg-white" : bg}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

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
                Modifier l'avatar
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                    Photo de profil
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
                            reader.onloadend = () => {
                              setAvatarUrl(reader.result as string);
                            };
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
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 p-4 rounded-2xl font-bold text-ink/40"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateAvatar}
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

const ShopPage = ({ user }: { user: User }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [points, setPoints] = useState(user.points);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [cRes, sRes, uRes] = await Promise.all([
      fetch(`/api/challenges/${user.id}`),
      fetch("/api/shop"),
      fetch(`/api/user/${user.id}`),
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
    const res = await fetch("/api/challenges/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, challengeId: id }),
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleBuy = async (id: number) => {
    const res = await fetch("/api/shop/buy", {
      method: "POST",
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
        <Loader2 className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="pb-24 md:pb-8 md:pl-72 p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-serif italic mb-2">Défis & Boutique</h2>
          <p className="text-ink/40 uppercase tracking-widest text-xs font-bold">
            Relevez des défis et personnalisez votre journal
          </p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 text-accent px-6 py-3 rounded-full shadow-sm">
          <Coins size={20} />
          <span className="text-xl font-bold">{points} Points</span>
        </div>
      </header>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="text-accent" size={24} />
          <h3 className="text-3xl font-serif italic">Défis en cours</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className={`bg-white p-8 rounded-[40px] border border-black/5 shadow-sm flex flex-col justify-between ${c.completed && !c.claimed ? "ring-2 ring-accent ring-offset-4" : ""}`}
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
                        width: `${Math.min(100, (c.currentProgress / c.requirement_value) * 100)}%`,
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

      <section>
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="text-accent" size={24} />
          <h3 className="text-3xl font-serif italic">
            Boutique de Personnalisation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stickers Section */}
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

          {/* Fonts Section */}
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
                        className={`text-xl mt-2 ${item.value === "serif" ? "font-serif" : item.value === "sans" ? "font-sans" : "font-mono"}`}
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

          {/* Backgrounds Section */}
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

const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white p-12 rounded-[40px] shadow-xl w-full max-w-md text-center"
    >
      <h2 className="text-4xl font-serif italic mb-6">Mot de passe oublié</h2>
      <p className="text-ink/60 mb-8">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Lien envoyé (simulation)");
        }}
      >
        <input
          placeholder="Email"
          className="w-full p-4 bg-paper rounded-2xl border border-black/5"
          type="email"
          required
        />
        <button
          type="submit"
          className="w-full bg-accent text-white p-4 rounded-2xl font-bold"
        >
          Envoyer le lien
        </button>
      </form>
      <p className="mt-8 text-sm">
        <Link
          to="/login"
          className="text-accent font-bold uppercase tracking-widest text-xs"
        >
          Retour à la connexion
        </Link>
      </p>
    </motion.div>
  </div>
);

// --- Main App ---

export default function App() {
  const [isPWA, setIsPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("lumina_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    setIsPWA(!!isStandalone);

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setUser(data);
            localStorage.setItem("lumina_user", JSON.stringify(data));
          }
        })
        .catch((err) => console.error("Failed to refresh user profile:", err));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("lumina_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("lumina_user");
  };

  return (
    <Router>
      <div className="min-h-screen bg-paper">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onInstall={handleInstallClick}
          showInstall={!!deferredPrompt}
        />
        <main>
          <Routes>
            <Route
              path="/login"
              element={
                !user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
              }
            />
            <Route
              path="/register"
              element={
                !user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/"
              element={
                user ? (
                  <Journal user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/book/:id"
              element={
                user ? <BookDetailPage user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/library"
              element={
                user ? <LibraryPage user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/wishlist"
              element={
                user ? <WishlistPage user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/stats"
              element={
                user ? <StatsPage user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/shop"
              element={
                user ? <ShopPage user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/club"
              element={
                user ? <BookClubPage user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile"
              element={
                user ? <ProfilePage user={user} /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
