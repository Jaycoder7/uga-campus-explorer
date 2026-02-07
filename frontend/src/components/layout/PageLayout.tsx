import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
}

export function PageLayout({ children, title, fullWidth = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20 pt-4 md:pb-4 md:pt-20">
      <div className={`mx-auto ${fullWidth ? 'w-full px-0' : 'max-w-[1024px] px-4'}`}>
        {title && (
          <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
