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
    <Tag className={`${className} flex flex-col gap-0.5 sm:block`}>
      <span className={`${enClassName} break-words`}>{en}</span>
      <span className={`text-sm sm:ml-1.5 ${ptClassName} break-words`}>/ {pt}</span>
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
    <li className="leading-snug space-y-1 py-0.5">
      <p className="text-teal-200/90 break-words [overflow-wrap:anywhere]">
        <span className="mr-1">{icon}</span>
        {en}
      </p>
      <p className="text-slate-500 text-xs pl-5 break-words [overflow-wrap:anywhere]">{pt}</p>
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
    <div className={`space-y-1 ${className}`}>
      <p className="text-slate-200 break-words [overflow-wrap:anywhere]">{en}</p>
      <p className="text-slate-500 text-xs break-words [overflow-wrap:anywhere]">{pt}</p>
    </div>
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
