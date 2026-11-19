import Image from "next/image";
import { ArrowRight, DeliveryIcon, RefurbIcon, WarrantyIcon } from "./Icons";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__blob hero__blob--left" aria-hidden="true" />
      <div className="hero__copy">
        <h1 id="hero-title">
          Pre-Owned iPhones
          <span>Great Value. Trusted Quality.</span>
        </h1>
        <p>
          Get premium iPhones at unbeatable prices,
          <br />
          with warranty and peace of mind.
        </p>
        <a href="#products" className="btn-orange">
          Shop Our Collection <ArrowRight />
        </a>

        <ul className="hero__perks">
          <li>
            <WarrantyIcon />
            <span>
              12-Month
              <br />
              Warranty
            </span>
          </li>
          <li>
            <RefurbIcon />
            <span>
              Certified
              <br />
              Refurbished
            </span>
          </li>
          <li>
            <DeliveryIcon />
            <span>
              Fast
              <br />
              Delivery
            </span>
          </li>
        </ul>
      </div>

      <div className="hero__art">
        <Image
          src="/images/hero-art.png"
          alt="Pre-owned iPhone 14 Pro and iPhone 13 shown front and back"
          width={826}
          height={366}
          priority
        />
      </div>
    </section>
  );
}
