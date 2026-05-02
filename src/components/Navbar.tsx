import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Library,
  Heart,
  BarChart2,
  Users,
  LogOut,
  Plus,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { User } from "../types";
import NavLink from "./NavLink";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onInstall: () => void;
  showInstall: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onInstall,
  showInstall,
}) => {
  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-6 py-3 z-50 md:top-0 md:bottom-auto md:flex-col md:w-64 md:h-screen md:border-r md:border-t-0">
      {/* Logo desktop */}
      <div className="hidden md:block mb-12 mt-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-serif italic text-accent">Bookhunter</h1>

          {window.matchMedia("(display-mode: standalone)").matches && (
            <span className="bg-accent/10 text-accent text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
              PWA
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
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

        {/* Bouton d'installation PWA */}
        {showInstall && (
          <button
            onClick={onInstall}
            className="hidden md:flex items-center gap-4 text-accent hover:opacity-80 transition-opacity w-full mt-4"
          >
            <Plus size={24} className="bg-accent/10 p-1 rounded" />
            <span className="text-sm font-medium">Installer l'App</span>
          </button>
        )}

        {/* Déconnexion */}
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

export default Navbar;
