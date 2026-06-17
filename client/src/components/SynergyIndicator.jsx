import { motion } from 'framer-motion';

const SynergyIndicator = ({ percentage, size = 60 }) => {
  const radius = size * 0.45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-white/10"
        />
        <motion.circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-primary synergy-ring drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white leading-none">
        {percentage}%
      </span>
    </div>
  );
};

export default SynergyIndicator;
