"use client";

import React from "react";
import { isHtmlEmpty } from "./RichTextEditor";

interface RichTextDisplayProps {
  content?: string | null;
  fallback?: string;
  className?: string;
}

export default function RichTextDisplay({
  content,
  fallback,
  className = "",
}: RichTextDisplayProps) {
  if (isHtmlEmpty(content)) {
    if (!fallback) return null;
    return (
      <p className={`text-slate-400 italic text-sm ${className}`}>
        {fallback}
      </p>
    );
  }

  // Check if content has HTML tags
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(content || "");

  if (!hasHtml) {
    return (
      <p className={`whitespace-pre-line leading-relaxed ${className}`}>
        {content}
      </p>
    );
  }

  return (
    <div
      className={`rich-text-content leading-relaxed text-slate-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: content || "" }}
    />
  );
}
