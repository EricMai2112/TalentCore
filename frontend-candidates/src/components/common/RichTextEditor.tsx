"use client";

import React, { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import "jodit/es2021/jodit.min.css";

// Dynamic import with SSR disabled to avoid 'window is not defined' in Next.js
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium animate-pulse">
      Đang tải trình soạn thảo văn bản...
    </div>
  ),
});

export function isHtmlEmpty(html?: string | null): boolean {
  if (!html) return true;
  const stripped = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return stripped.length === 0;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number | string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  height = 360,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      height: typeof height === "number" ? height : 360,
      minHeight: 280,
      toolbarAdaptive: false,
      toolbarSticky: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "fontsize",
        "paragraph",
        "|",
        "brush",
        "align",
        "|",
        "link",
        "table",
        "hr",
        "|",
        "undo",
        "redo",
        "eraser",
      ],
      style: {
        fontFamily: "inherit",
        fontSize: "14px",
        color: "#0f172a",
      },
    }),
    [placeholder, height]
  );

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <JoditEditor
        ref={editorRef}
        value={value || ""}
        config={config}
        onBlur={(newContent) => onChange(newContent)}
        onChange={() => {}}
      />
    </div>
  );
}
