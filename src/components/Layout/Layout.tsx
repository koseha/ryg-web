import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="w-full flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};