// Cyan uppercase section label used above every H2 on the site

interface SectionTagProps {
  children: string;
}

export function SectionTag({ children }: SectionTagProps) {
  return <span className="section-tag">{children}</span>;
}
