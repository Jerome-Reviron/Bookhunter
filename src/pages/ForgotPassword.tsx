import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Appel API réel si tu veux :
    // const res = await fetch("/api/forgot-password", { ... })

    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-12 rounded-[40px] shadow-xl w-full max-w-md text-center"
      >
        {!sent ? (
          <>
            <h2 className="text-4xl font-serif italic mb-6">
              Mot de passe oublié
            </h2>

            <p className="text-ink/60 mb-8">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30"
                  size={18}
                />
                <input
                  placeholder="Email"
                  className="w-full p-4 pl-12 bg-paper rounded-2xl border border-black/5"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Envoyer le lien"
                )}
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
          </>
        ) : (
          <>
            <CheckCircle2 className="text-green-500 mx-auto mb-6" size={48} />
            <h2 className="text-3xl font-serif italic mb-4">Email envoyé !</h2>
            <p className="text-ink/60 mb-8">
              Si un compte existe avec cette adresse, un lien de
              réinitialisation vous a été envoyé.
            </p>

            <Link
              to="/login"
              className="w-full block bg-accent text-white p-4 rounded-2xl font-bold uppercase tracking-widest text-xs"
            >
              Retour à la connexion
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
