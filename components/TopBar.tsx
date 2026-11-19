import { HeadsetSolid, ShieldCheckSolid, TruckSolid } from "./Icons";

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar__inner">
        <ul className="topbar__perks">
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
        <ul className="topbar__links">
          <li>
            <a href="#track">Track Order</a>
          </li>
          <li>
            <a href="#help">Help</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
