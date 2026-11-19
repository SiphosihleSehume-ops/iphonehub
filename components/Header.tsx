"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CartIcon,
  ChevronDown,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./Icons";

interface HeaderProps {
  cartCount: number;
  query: string;
  onQueryChange: (value: string) => void;
}

export default function Header({ cartCount, query, onQueryChange }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__inner">
        <a href="#" className="logo" aria-label="iPhoneHub home">
          <Image
            src="/images/logo-phone.png"
            alt=""
            width={25}
            height={26}
            className="logo__mark"
          />
          <span className="logo__word">
            iPhone<span>Hub</span>
          </span>
        </a>

        <button
          className="header__burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon />
        </button>

        <nav className={`nav ${open ? "nav--open" : ""}`} aria-label="Main">
          <a href="#" className="nav__link nav__link--active">
            Home
          </a>
          <a href="#products" className="nav__link">
            Shop <ChevronDown width={15} height={15} />
          </a>
          <a href="#about" className="nav__link">
            About
          </a>
          <a href="#faqs" className="nav__link">
            FAQs
          </a>
          <a href="#contact" className="nav__link">
            Contact
          </a>
        </nav>

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
  );
}
