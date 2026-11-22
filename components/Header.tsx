"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import {
  CartIcon,
  ChevronDown,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./Icons";
import InfoModal from "./InfoModal";
import { AboutContent, ContactContent } from "./SiteDialogs";

interface HeaderProps {
  cartCount?: number;
  /** Leave out query and onQueryChange (e.g. on the FAQs page) to hide the search box */
  query?: string;
  onQueryChange?: (value: string) => void;
}

export default function Header({ cartCount = 0, query = "", onQueryChange }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<"about" | "contact" | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const pathname = usePathname();

  const show = (which: "about" | "contact") => {
    setOpen(false);
    setDialog(which);
  };

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <Link href="/" className="logo" aria-label="iPhoneHub home">
            <Image
              src="/images/logo-phone.png"
              alt=""
              width={25}
              height={26}
              className="logo__mark"
            />
            <span className="logo__word">
              Oskido's<span>Electronics</span>
            </span>
          </Link>

          <button
            className="header__burger"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon />
          </button>

          <nav className={`nav ${open ? "nav--open" : ""}`} aria-label="Main">
            <Link href="/" className={`nav__link ${pathname === "/" ? "nav__link--active" : ""}`}>
              Home
            </Link>
            <Link href="/#products" className="nav__link">
              Shop <ChevronDown width={15} height={15} />
            </Link>
            <button type="button" className="nav__link" onClick={() => show("about")}>
              About
            </button>
            <Link
              href="/faqs"
              className={`nav__link ${pathname === "/faqs" ? "nav__link--active" : ""}`}
            >
              FAQs
            </Link>
            <button type="button" className="nav__link" onClick={() => show("contact")}>
              Contact
            </button>
          </nav>

          {onQueryChange && (
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search for iPhones..."
                aria-label="Search for iPhones"
              />
            </label>
          )}

          <div className="header__actions">
            <button className="icon-btn" aria-label="Account">
              <UserIcon />
            </button>
            <button className="icon-btn cart-btn" aria-label={`Cart, ${cartCount} items`}>
              <CartIcon />
              {cartCount > 0 && <span className="cart-btn__badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {dialog === "about" && (
        <InfoModal title="About Oskido's Electronics" onClose={closeDialog}>
          <AboutContent />
        </InfoModal>
      )}
      {dialog === "contact" && (
        <InfoModal title="Get in touch" onClose={closeDialog}>
          <ContactContent onNavigate={closeDialog} />
        </InfoModal>
      )}
    </>
  );
}