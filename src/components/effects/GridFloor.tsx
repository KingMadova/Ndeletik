"use client";

import { motion } from "framer-motion";

export function GridFloor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-96" style={{ perspective: "1000px" }}>
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(212, 154, 68, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(212, 154, 68, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            transform: "rotateX(60deg)",
            transformOrigin: "center bottom",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </div>
  );
}