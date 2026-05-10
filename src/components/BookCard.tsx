import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Book, Clock, Star } from "lucide-react";
import StickerDisplay from "./StickerDisplay";
import { BookEntry, Sticker } from "../types";
import "../styles/backgrounds.css";
import "../styles/fonts.css";

interface BookCardProps {
  book: BookEntry;
  onUpdateProgress: (pages: number) => void;
  onUpdateBook: (id: number, data: any) => void;
  STICKERS: Sticker[];
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onUpdateProgress,
  onUpdateBook,
  STICKERS,
}) => {
  const navigate = useNavigate();

  const [localPage, setLocalPage] = useState(book.current_page);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const progress = Math.min(
    100,
    Math.round((localPage / (book.total_pages || 1)) * 100),
  );

  // Sync local page when book updates
  useEffect(() => {
    setLocalPage(book.current_page);
  }, [book.current_page]);

  // Timer logic
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
    const pages = Math.max(1, Math.floor(seconds / 60)); // 1 page/minute
    onUpdateProgress(pages);
    setSeconds(0);
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
      className={`min-w-[260px] sm:min-w-[320px] md:min-w-[400px] lg:min-w-[420px] p-6 rounded-3xl border border-black/5 shadow-sm group transition-all ${
        book.card_bg || "bg-white"
      }`}
    >
      <div className="flex gap-6">
        {/* Cover */}
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

          <StickerDisplay
            stickersJson={book.stickers}
            STICKERS={STICKERS}
            size="sm"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 bg-[#f8f5ef]/90 rounded-xl p-3 text-accent">
          {/* Title */}
          <div className="flex justify-between items-start mb-1">
            <h4
              onClick={() => navigate(`/book/${book.id}`)}
              className={`text-lg italic font-semibold cursor-pointer hover:text-accent transition-colors ${book.card_font} whitespace-normal break-words`}
            >
              {book.title}
            </h4>
          </div>

          {/* Author + Rating */}
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-semibold text-accent/90 tracking-wide">
              {book.author}
            </p>

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
                    size={14}
                    className={
                      star <= (book.rating || 0)
                        ? "fill-accent text-accent drop-shadow-sm"
                        : "text-accent/80"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest font-bold mb-1">
              <span>Progression</span>
              <br />
              <span>
                {localPage} / {book.total_pages} pages. ({progress}%)
              </span>
            </div>

            <div className="relative w-full h-4 flex items-center group/slider">
              <div className="absolute inset-0 bg-accent/30 h-1.5 my-auto rounded-full overflow-hidden">
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

          {/* Buttons */}
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
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {formatTime(seconds)} - Terminer
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => onUpdateProgress(10)}
                className="flex-1 bg-accent/30 text-accent text-[10px] font-bold py-2 rounded-lg hover:bg-accent hover:text-white transition-colors"
              >
                +10 p.
              </button>
              <button
                onClick={() => onUpdateProgress(25)}
                className="flex-1 bg-accent/30 text-accent text-[10px] font-bold py-2 rounded-lg hover:bg-accent hover:text-white transition-colors"
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

export default BookCard;
