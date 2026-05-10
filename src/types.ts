// =========================
// USER
// =========================

export interface User {
  id: number;
  pseudo: string;
  email: string;
  points: number;
  role: "user" | "admin";
  is_premium: boolean;
  avatar_url?: string;

  // JSON strings venant du backend PHP
  unlocked_stickers: string;
  unlocked_fonts: string;
  unlocked_backgrounds: string;

  createdAt: string;
}

// =========================
// BOOK ENTRY (livre enregistré)
// =========================

export type BookSupport = "physical" | "ebook" | "audio";
export type BookStatus = "to-read" | "reading" | "finished";

export interface BookEntry {
  id: number;
  title: string;
  author: string;
  category: string;
  support: BookSupport;
  edition: string;
  status: BookStatus;

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

// =========================
// BOOK FORM (ajout d’un livre)
// =========================

export interface BookForm {
  title: string;
  author: string;
  category: string;
  support: BookSupport;
  edition: string;
  status: BookStatus;
  total_pages: number;
  cover_url: string;
  stickers: string[];
  card_bg?: string;
  card_font?: string;
}

// =========================
// WISHLIST
// =========================

export interface WishlistItem {
  id: number;
  title: string;
  author: string;
}

// =========================
// READING SESSIONS
// =========================

export interface ReadingSession {
  id: number;
  book_id: number;
  pages_read: number;
  duration_minutes: number;
  timestamp: string;
}

// =========================
// STATISTIQUES
// =========================

export interface ReadingStats {
  books_read: number;
  pages_read: number;
  yearly_goal: number;
  favorite_genres: string[];
  average_speed: number;
  average_session_time: number;
  most_active_day: string;
  least_active_day: string;
  heatmap: Record<string, number>;
}

// =========================
// BOUTIQUE
// =========================

export type ShopItemType = "sticker" | "font" | "background";

export interface ShopItem {
  id: number;
  type: ShopItemType;
  name: string;
  price_points: number;
  stripe_url: string;
  image_url: string;
  value: string;
}

// =========================
// DÉFIS
// =========================

export interface Challenge {
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

// =========================
// CLUBS DE LECTURE
// =========================

export interface Club {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  owner_name: string;
  type: "open" | "invite";
  member_count: number;
  created_at: string;

  // Ajout indispensable pour ton App.tsx
  is_member?: boolean;
}

export interface ClubEvent {
  id: number;
  club_id: number;
  title: string;
  date: string;
  description: string;
  attendee_count: number;
  is_attending?: boolean;
}

export interface ClubVote {
  book_title: string;
  count: number;
}

export interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

// =========================
// STICKERS
// =========================

export interface Sticker {
  id: string;
  url: string;
  label: string;
}

// =========================
// APP STATE (SplashScreen + transitions)
// =========================

export enum AppState {
  SPLASH = "SPLASH",
  READY = "READY",
}
