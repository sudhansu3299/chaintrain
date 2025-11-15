import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
      <div className="layout-container">
        <header className="layout-header">
          <h2>Dataset Registry</h2>
        </header>

        <main className="layout-main">
          {children}
        </main>

        <footer className="layout-footer">
          <p>Powered by Sui • Nautilus • Walrus</p>
        </footer>
      </div>
  );
}
