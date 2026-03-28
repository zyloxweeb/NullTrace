import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  onUpload: (file: File) => Promise<void>;
};

export default function FileUpload({ onUpload }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    try {
      setLoading(true);
      await onUpload(file);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <motion.div
      className="rounded-[32px] border border-slate-800/80 bg-slate-950/45 p-6 backdrop-blur-xl transition duration-300 hover:scale-[1.01]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest text-cyan-400/70">
          Ingest sample
        </p>
        <h2 className="text-xl font-semibold text-white">
          Upload Artifact
        </h2>
        <p className="text-sm text-slate-400">
          Drop a file to begin static inspection and extract indicators.
        </p>
      </div>

      {/* DROPZONE */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative mt-4 rounded-[24px] border-2 border-dashed p-10 text-center transition ${
          dragging
            ? "border-cyan-400 bg-cyan-400/5 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
            : "border-slate-700 bg-slate-950/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]"
        }`}
        whileHover={{ scale: 1.02 }}
      >
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleChange}
        />

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-cyan-400 text-2xl mb-2"
        >
          ↑
        </motion.div>

        <p className="text-sm text-slate-300">
          Drag & drop or click to select
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Any file type • Local analysis only
        </p>
      </motion.div>

      {/* BUTTON */}
      <button
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-slate-800 py-3 text-sm text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Artifact"}
      </button>
    </motion.div>
  );
}