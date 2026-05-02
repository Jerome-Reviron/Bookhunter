import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User } from "../types";

interface RegisterProps {
  onLogin: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
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

export default Register;
