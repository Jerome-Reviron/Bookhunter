import React from "react";
import { Link, useLocation } from "react-router-dom";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 md:flex-row md:gap-4 md:w-full transition-colors ${
        active ? "text-accent" : "text-ink/60 hover:text-accent"
      }`}
    >
      {icon}
      <span className="text-[10px] uppercase tracking-widest font-medium md:text-sm md:normal-case md:tracking-normal">
        {label}
      </span>
    </Link>
  );
};

export default NavLink;
