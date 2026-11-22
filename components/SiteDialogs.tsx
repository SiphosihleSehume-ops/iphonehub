import Link from "next/link";
import { SITE } from "@/lib/site";
import { DeliveryIcon, HeadsetSolid, MailIcon, PhoneIcon, WarrantyIcon } from "./Icons";

export function AboutContent() {
  return (
    <>
      <p className="info__lead">
        Pre-owned iPhones you can trust, at prices that make sense.
      </p>
      <p>
        Oskido's Electronics started with a simple idea: buying a second-hand iPhone should not feel like a
        gamble. Every phone we sell is checked, graded and described honestly, so what you see on the
        page is what arrives at your door.
      </p>
      <p>
        You pick the model, storage and colour, we confirm your order personally, and we deliver. If
        anything is not right after that, you deal with a real person, not a ticket number.
      </p>

      <ul className="info__perks">
        <li>
          <WarrantyIcon width={26} height={26} />
          12-month warranty
        </li>
        <li>
          <DeliveryIcon width={30} height={30} />
          Delivery in 1–3 days
        </li>
        <li>
          <HeadsetSolid width={24} height={24} />
          24/7 support
        </li>
      </ul>
    </>
  );
}

export function ContactContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <p className="info__sub">Questions about a phone or an order? We are here 24/7.</p>

      <a className="contact-row" href={`tel:${SITE.phoneHref}`}>
        <span className="contact-row__icon">
          <PhoneIcon />
        </span>
        <span>
          <small>Call or WhatsApp</small>
          <strong>{SITE.phone}</strong>
        </span>
      </a>

      <a className="contact-row" href={`mailto:${SITE.email}`}>
        <span className="contact-row__icon">
          <MailIcon />
        </span>
        <span>
          <small>Email us</small>
          <strong>{SITE.email}</strong>
        </span>
      </a>

      <p className="info__foot">
        Looking for a quick answer?{" "}
        <Link href="/faqs" onClick={onNavigate}>
          Read our FAQs
        </Link>
      </p>
    </>
  );
}