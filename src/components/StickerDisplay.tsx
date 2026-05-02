import React from "react";
import { motion } from "motion/react";
import { Sticker } from "../types";

interface StickerDisplayProps {
  stickersJson?: string;
  size?: "sm" | "md";
  STICKERS: Sticker[];
}

const StickerDisplay: React.FC<StickerDisplayProps> = ({
  stickersJson,
  size = "sm",
  STICKERS,
}) => {
  if (!stickersJson) return null;

  try {
    const stickerIds: string[] = JSON.parse(stickersJson);
    const stickerList = stickerIds
      .map((id) => STICKERS.find((s) => s.id === id))
      .filter(Boolean);

    // Hash pour positions pseudo-aléatoires
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
        x = rx * 20;
        y = ry * 85;
      } else if (quadrant === 1) {
        x = 75 + rx * 15;
        y = ry * 85;
      } else if (quadrant === 2) {
        x = 20 + rx * 55;
        y = ry * 20;
      } else {
        x = 20 + rx * 55;
        y = 75 + ry * 15;
      }

      const scale = 0.7 + (sizeSeed - Math.floor(sizeSeed)) * 0.7;

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
                zIndex: 10 + idx,
              }}
              className="absolute drop-shadow-lg"
              alt={sticker?.label}
            />
          );
        })}
      </div>
    );
  } catch {
    return null;
  }
};

export default StickerDisplay;
