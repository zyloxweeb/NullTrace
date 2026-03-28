import { motion, AnimatePresence } from "framer-motion";

type Props = {
  show: boolean;
};

export default function SplashScreen({ show }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        >
          <div className="relative flex items-center justify-center">
            <motion.img
              src="/hood-icon.png"
              alt="NullTrace logo"
              className="h-44 w-auto md:h-56 select-none pointer-events-none drop-shadow-[0_0_30px_rgba(34,211,238,0.25)]"
              initial={{ opacity: 0, scale: 0.88, x: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: [-0, 0, -100],
              }}
              transition={{
                opacity: { duration: 0.45, ease: "easeOut" },
                scale: { duration: 0.45, ease: "easeOut" },
                x: {
                  times: [0, 0.45, 1],
                  duration: 1.8,
                  ease: "easeInOut",
                },
              }}
            />

            <motion.div
              className="absolute left-1/2 ml-2 overflow-hidden"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 1.05,
                duration: 0.55,
                ease: "easeOut",
              }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-semibold tracking-tight text-white whitespace-nowrap"
                initial={{ letterSpacing: "-0.08em", opacity: 0 }}
                animate={{ letterSpacing: "-0.04em", opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                Null<span className="text-cyan-400">Trace</span>
              </motion.h1>

              <motion.div
                className="mt-3 h-px w-full bg-gradient-to-r from-cyan-400/70 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.45, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>

            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0.15] }}
              transition={{ duration: 1.8 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}