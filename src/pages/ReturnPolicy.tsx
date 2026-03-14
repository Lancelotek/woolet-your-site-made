import { useParams } from "react-router-dom";
import PolicyPage from "@/components/PolicyPage";
import SEO from "@/components/SEO";
import { isValidLang, type Lang } from "@/lib/i18n";

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-2 pl-0 list-none">
    {items.map((item, i) => (
      <li key={i} className="pl-5 relative text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.83rem" }}>
        <span className="absolute left-0 text-gold-dim" style={{ fontSize: "0.8rem" }}>–</span>
        <span dangerouslySetInnerHTML={{ __html: item }} />
      </li>
    ))}
  </ul>
);

const ReturnPolicy = () => {
  const sections = [
    {
      num: "01",
      title: "Right of Withdrawal",
      content: (
        <>
          <p>You have the right to withdraw from your purchase made through <strong className="text-foreground font-normal">woolet.co</strong> within <strong className="text-foreground font-normal">30 days</strong> of receiving your order, without giving any reason.</p>
          <p>The withdrawal period expires 30 days from the day on which you, or a third party designated by you (other than the carrier), acquire physical possession of the goods.</p>
          <p>To exercise your right of withdrawal, you must inform us of your decision by means of an unequivocal statement — by email or post — before the withdrawal period has expired. You may use the model withdrawal form below, though this is not obligatory.</p>
        </>
      ),
    },
    {
      num: "02",
      title: "Conditions for Return",
      content: (
        <>
          <p>To be eligible for a return or exchange, your item must meet the following conditions:</p>
          <BulletList items={[
            "Returned within 30 days of receipt",
            "Unworn and unused — no signs of use, scratches or damage",
            "In original packaging with all accessories and documentation included",
            "Not a final-sale or clearance item (these are marked as non-returnable at point of purchase)",
          ]} />
          <p>Items that show signs of use or damage beyond what is necessary to inspect them may be subject to a reduced refund reflecting the diminished value.</p>
        </>
      ),
    },
    {
      num: "03",
      title: "How to Initiate a Return",
      content: (
        <>
          <p>To start your return or exchange, please contact us before sending any item back:</p>
          <BulletList items={[
            "Email us at <strong class='text-[hsl(var(--cream))] font-normal'>support@woolet.co</strong> with your order number and reason for return",
            "We will confirm eligibility and provide return instructions within 2 business days",
            "Pack the item securely and ship it to the address provided in our confirmation email",
          ]} />
          <p><strong className="text-foreground font-normal">Do not send items back without contacting us first</strong> — items returned without prior authorisation may not be processed.</p>
        </>
      ),
    },
    {
      num: "04",
      title: "Refunds",
      content: (
        <>
          <p>Once we receive and inspect your return, we will notify you of the outcome. If approved, your refund will be processed as follows:</p>
          <BulletList items={[
            "Refunded to your original payment method within <strong class='text-[hsl(var(--cream))] font-normal'>14 days</strong> of us receiving the returned item",
            "Full purchase price refunded, including standard delivery costs",
            "Additional delivery costs (e.g. express shipping chosen by you) are non-refundable",
            "No fees are charged for the refund itself",
          ]} />
          <p>We may withhold the refund until we have received the returned item or you have provided proof of return shipment, whichever is earlier.</p>
        </>
      ),
    },
    {
      num: "05",
      title: "Return Shipping Costs",
      content: (
        <p>You are responsible for the direct cost of returning the item to us, unless the return is due to our error (e.g. wrong item sent, defective product). We recommend using a tracked shipping service, as we cannot be held responsible for items lost in transit.</p>
      ),
    },
    {
      num: "06",
      title: "Exchanges",
      content: (
        <>
          <p>We offer exchanges for a different size, colour or model within 30 days of receipt. To request an exchange, contact us at <strong className="text-foreground font-normal">support@woolet.co</strong> with your order number and the details of the item you would like instead. Exchanges are subject to availability.</p>
          <p>For the eyewear collection (Woolet 007 &amp; 009), we offer a <strong className="text-foreground font-normal">30-day fit guarantee</strong> — if your frames don't fit correctly, we'll exchange them or issue a full refund, no questions asked.</p>
        </>
      ),
    },
    {
      num: "07",
      title: "Defective or Damaged Items",
      content: (
        <p>If you receive an item that is defective or damaged in transit, please contact us within <strong className="text-foreground font-normal">7 days</strong> of receipt with photos of the damage. We will arrange a replacement or full refund at no cost to you, including return shipping.</p>
      ),
    },
    {
      num: "08",
      title: "Model Withdrawal Form",
      content: (
        <>
          <p>If you wish to use the model withdrawal form, please complete and send the following to <strong className="text-foreground font-normal">support@woolet.co</strong> or by post to the address below:</p>
          <div className="woolet-contact-box">
            <div className="woolet-contact-label">Withdrawal Form</div>
            <div className="woolet-contact-line">To: JAY23 LLC — Woolet</div>
            <div className="woolet-contact-line">412 N. Main Street, STE 100, Buffalo, Wyoming 82834, USA</div>
            <div className="woolet-contact-line">Email: <a href="mailto:support@woolet.co">support@woolet.co</a></div>
            <br />
            <div className="woolet-contact-line">I hereby give notice of my withdrawal from the contract of sale of the following item(s):</div>
            <div className="woolet-contact-line">Order number: ___________________________</div>
            <div className="woolet-contact-line">Item(s) ordered: ___________________________</div>
            <div className="woolet-contact-line">Date of receipt: ___________________________</div>
            <div className="woolet-contact-line">Name: ___________________________</div>
            <div className="woolet-contact-line">Address: ___________________________</div>
            <div className="woolet-contact-line">Date: ___________________________</div>
          </div>
        </>
      ),
    },
    {
      num: "09",
      title: "Contact Us",
      content: (
        <>
          <p>For all return, exchange and refund enquiries, please reach out to our support team:</p>
          <div className="woolet-contact-box">
            <div className="woolet-contact-label">JAY23 LLC — Woolet</div>
            <div className="woolet-contact-line">412 N. Main Street, STE 100</div>
            <div className="woolet-contact-line">Buffalo, Wyoming 82834, USA</div>
            <div className="woolet-contact-line">Email: <a href="mailto:support@woolet.co">support@woolet.co</a></div>
            <div className="woolet-contact-line">Website: <a href="https://woolet.co">woolet.co</a></div>
          </div>
        </>
      ),
    },
  ];

  return <PolicyPage title="Return Policy" meta="JAY23 LLC · Last updated: March 2025" sections={sections} />;
};

export default ReturnPolicy;
