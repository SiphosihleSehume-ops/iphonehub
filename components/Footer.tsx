import { HeadsetSolid, ShieldCheckSolid, TruckSolid } from "./Icons";

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
            <a href="#help">Help</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}