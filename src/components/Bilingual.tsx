import type { ElementType, ReactNode } from "react";

interface BilingualHeadingProps {
  en: string;
  pt: string;
  as?: ElementType;
  className?: string;
  enClassName?: string;
  ptClassName?: string;
}

export function BilingualHeading({
  en,
  pt,
  as: Tag = "h3",
  className = "",
  enClassName = "text-slate-100",
  ptClassName = "text-slate-500 font-normal",
}: BilingualHeadingProps) {
  return (
    <Tag className={className}>
      <span className={enClassName}>{en}</span>
      <span className={`text-sm ml-1.5 ${ptClassName}`}>/ {pt}</span>
    </Tag>
  );
}

interface BilingualItemProps {
  en: ReactNode;
  pt: ReactNode;
  icon?: string;
}

export function BilingualItem({ en, pt, icon = "✓" }: BilingualItemProps) {
  return (
    <li className="leading-relaxed">
      <span className="text-teal-200/90">
        {icon} {en}
      </span>
      <span className="text-slate-500"> — {pt}</span>
    </li>
  );
}

interface BilingualTextProps {
  en: string;
  pt: string;
  className?: string;
}

export function BilingualText({ en, pt, className = "" }: BilingualTextProps) {
  return (
    <p className={className}>
      <span className="text-slate-200">{en}</span>
      <span className="text-slate-500 text-sm"> — {pt}</span>
    </p>
  );
}

interface BilingualButtonLabelProps {
  en: string;
  pt: string;
}

export function BilingualButtonLabel({ en, pt }: BilingualButtonLabelProps) {
  return (
    <>
      <span>{en}</span>
      <span className="opacity-75 font-normal"> / {pt}</span>
    </>
  );
}
