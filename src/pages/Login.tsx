import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
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

export default Login;
