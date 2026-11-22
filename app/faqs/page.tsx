import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ChevronDown, MailIcon, PhoneIcon } from "@/components/Icons";
import { FAQ_GROUPS } from "@/lib/faqs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs | Oskido's Electronics",
  description:
    "Answers about delivery, payment, condition, warranty and ordering pre-owned iPhones from Oskido's Electronics.",
};

export default function FaqPage() {
  return (
    <>
      <Header />

      <main className="faq">
        <div className="faq__inner">
          <p className="faq__eyebrow">Help</p>
          <h1>Frequently asked questions</h1>
          <p className="faq__lead">
            Quick answers about delivery, payment and our iPhones. Can&apos;t find yours? Get in
            touch below.
          </p>

          {FAQ_GROUPS.map((group, g) => (
            <section key={group.title} className="faq__group" aria-labelledby={`faq-g${g}`}>
              <h2 id={`faq-g${g}`}>{group.title}</h2>
              {group.items.map((item) => (
                <details key={item.q} className="faq__item">
                  <summary>
                    <span>{item.q}</span>
                    <ChevronDown width={20} height={20} />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </section>
          ))}

          <div className="faq__help">
            <div>
              <h2>Still need help?</h2>
              <p>Our team is available 24/7.</p>
            </div>
            <div className="faq__help-links">
              <a href={`tel:${SITE.phoneHref}`}>
                <PhoneIcon width={18} height={18} /> {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`}>
                <MailIcon width={18} height={18} /> {SITE.email}
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}