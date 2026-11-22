import { HeadsetSolid, ShieldCheckSolid, TruckSolid } from "./Icons";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <ul className="footer__perks">
          <li>
            <ShieldCheckSolid width={20} height={20} />
            Trusted Pre-Owned iPhones
          </li>
          <li>
            <TruckSolid width={22} height={22} />
            Fast &amp; Reliable Delivery
          </li>
          <li>
            <HeadsetSolid width={21} height={21} />
            24/7 Support
          </li>
        </ul>
        <ul className="footer__links">
          <li>
            <a href="#track">Track Order</a>
          </li>
          <li>
            <Link href="/faqs">Help</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}