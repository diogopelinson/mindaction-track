import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface XPCounterProps {
  xp: number;
  description: string;
  show: boolean;
}

export function XPCounter({ xp, description, show }: XPCounterProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-24 right-4 z-50 pointer-events-none"
        >
          <div className="bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg border-2 border-primary-foreground/20 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            
            <div className="text-left">
              <p className="text-2xl font-bold">+{xp} XP</p>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
