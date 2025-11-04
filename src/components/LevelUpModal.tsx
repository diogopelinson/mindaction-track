import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { getLevelTitle } from "@/hooks/useXPSystem";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  level: number;
}

export function LevelUpModal({ open, onClose, level }: LevelUpModalProps) {
  const { width, height } = useWindowSize();
  const title = getLevelTitle(level);

  return (
    <>
      {open && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md border-primary/20 bg-gradient-to-b from-background to-primary/5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 py-8"
          >
            {/* Icon with glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative"
            >
              <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full" />
              <Trophy className="w-24 h-24 text-primary relative z-10" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              <Star className="w-6 h-6 text-yellow-300 absolute -bottom-1 -left-1 animate-pulse" />
            </motion.div>

            {/* Text content */}
            <div className="text-center space-y-2">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              >
                Nível {level}!
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-semibold text-foreground"
              >
                {title}
              </motion.p>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground max-w-xs"
              >
                Parabéns! Você subiu de nível e está cada vez mais perto dos seus objetivos!
              </motion.p>
            </div>

            {/* Rewards section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-primary/10 rounded-lg p-4 space-y-2"
            >
              <p className="text-sm font-semibold text-center">Recompensas desbloqueadas:</p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">Novo título: {title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-sm">Badge no perfil</span>
                </div>
              </div>
            </motion.div>

            {/* Close button */}
            <Button onClick={onClose} size="lg" className="w-full">
              Continuar
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
