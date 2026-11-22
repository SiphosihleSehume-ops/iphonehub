import { SITE } from "./site";

export interface Faq {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: Faq[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Delivery",
    items: [
      {
        q: "How long does delivery usually take?",
        a: "Delivery usually takes 1–3 days. Once you place your order we contact you to confirm the details, and your phone is on its way after that.",
      },
      {
        q: "Where do you deliver?",
        a: "We deliver to the address you enter on the order form. If you are not sure we cover your area, contact us before ordering and we will let you know.",
      },
      {
        q: "How much does delivery cost?",
        a: "Any delivery fee is confirmed with you when we contact you about your order, so you always know the full amount before you pay.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Every order gets a reference number, which is in your confirmation email. Quote it when you contact us and we will tell you exactly where your order is.",
      },
    ],
  },
  {
    title: "Ordering & payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Choose your iPhone, press Add to Cart, and fill in the short form with your details, the iPhone type and the colour you want. We email you a confirmation straight away.",
      },
      {
        q: "How do I pay?",
        a: "After you place your order, our team contacts you to confirm payment and delivery. You never pay before we have spoken to you.",
      },
      {
        q: "Can I order more than one iPhone?",
        a: "Yes. Change the quantity on the order form, as long as we have that many in stock. Each iPhone model and colour is a separate order.",
      },
      {
        q: "I did not get my confirmation email. What now?",
        a: "Check your spam or junk folder first, then make sure the email address on the form was typed correctly. If it is still missing, contact us and we will find your order.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Yes, as long as it has not been dispatched. Contact us as soon as you can with your order reference and we will sort it out.",
      },
    ],
  },
  {
    title: "Condition & quality",
    items: [
      {
        q: "What does pre-owned mean?",
        a: "It means the iPhone has had a previous owner. Every phone is checked and graded before it is listed, and the condition is shown on each product so there are no surprises.",
      },
      {
        q: "What do Excellent, Very Good and Good mean?",
        a: "Excellent looks almost new with little or no sign of use. Very Good has light marks that you only notice up close. Good shows visible wear such as scratches or scuffs. All three work as they should.",
      },
      {
        q: "Are these genuine Apple iPhones?",
        a: "Yes. Every phone we sell is a genuine Apple iPhone.",
      },
    ],
  },
  {
    title: "Warranty & returns",
    items: [
      {
        q: "Is there a warranty?",
        a: "Yes. Every iPhone from iPhoneHub comes with a 12-month warranty.",
      },
      {
        q: "What does the warranty cover?",
        a: "It covers faults with the phone itself. Damage from drops, water or repairs done elsewhere is not covered. If something goes wrong, contact us with your order reference and we will guide you through it.",
      },
      {
        q: "What if the phone is not what I expected?",
        a: "Contact us as soon as it arrives. We will listen to what is wrong and work out a fix with you.",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        q: "How do I contact you?",
        a: `Call us on ${SITE.phone} or email ${SITE.email}. Our support is available 24/7.`,
      },
      {
        q: "Is my personal information safe?",
        a: "We only use your details to process and deliver your order and to get in touch about it. We never sell them.",
      },
    ],
  },
];