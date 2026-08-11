import { X } from "lucide-react";
import { Skill } from "../types/skill.types";

interface SkillTagProps {
  skill: Skill;
  onRemove?: (skillId: string) => void;
  readonly?: boolean;
}

// 12 bộ màu pastel — background nhạt + text đậm + border nhạt
const TAG_PALETTES = [
  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    hover: "hover:bg-blue-100"    },
  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  hover: "hover:bg-violet-100"  },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hover: "hover:bg-emerald-100" },
  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  hover: "hover:bg-orange-100"  },
  { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    hover: "hover:bg-pink-100"    },
  { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    hover: "hover:bg-teal-100"    },
  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   hover: "hover:bg-amber-100"   },
  { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    hover: "hover:bg-cyan-100"    },
  { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    hover: "hover:bg-rose-100"    },
  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  hover: "hover:bg-indigo-100"  },
  { bg: "bg-lime-50",    text: "text-lime-700",    border: "border-lime-200",    hover: "hover:bg-lime-100"    },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", hover: "hover:bg-fuchsia-100" },
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_PALETTES[Math.abs(hash) % TAG_PALETTES.length];
}

export default function SkillTag({ skill, onRemove, readonly }: SkillTagProps) {
  const p = getPalette(skill.name);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 ${p.bg} ${p.text} border ${p.border} ${p.hover} text-xs font-semibold rounded-lg transition-colors group/tag`}
    >
      {skill.name}
      {!readonly && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(skill._id)}
          className={`ml-0.5 opacity-0 group-hover/tag:opacity-100 hover:text-red-500 transition-all cursor-pointer`}
          title={`Xóa ${skill.name}`}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
