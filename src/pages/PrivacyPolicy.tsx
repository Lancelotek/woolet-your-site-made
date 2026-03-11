import PolicyPage from "@/components/PolicyPage";

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

const PrivacyPolicy = () => {
  const sections = [
    {
      num: "01",
      title: "Who We Are",
      content: (
        <>
          <p><strong className="text-foreground font-normal">JAY23 LLC</strong> doing business as Woolet understands that your personal information is important to you, and we recognise the importance of maintaining your privacy.</p>
          <p>We offer products and services in multiple jurisdictions including the United States, Europe, and other regions worldwide. We are bound by applicable privacy regulations including:</p>
          <BulletList items={[
            "The General Data Protection Regulation (EU) 2016/679 (GDPR)",
            "California Online Privacy Protection Act of 2003 (CalOPPA)",
            "The Children's Online Privacy Protection Act of 1998 (COPPA)",
            "Other applicable US federal and state privacy laws",
          ]} />
          <p>By using woolet.co and our services, or by giving us your personal information, you acknowledge and consent to us collecting, using, storing and disclosing your personal information in accordance with this Privacy Policy.</p>
        </>
      ),
    },
    {
      num: "02",
      title: "Information We Collect",
      content: (
        <>
          <p>The kind of information we collect and hold about you will depend on the nature of your dealings with us. We may collect and hold information including:</p>
          <BulletList items={[
            "Contact information and identification such as your name, address, phone number, email address and date of birth",
            "Log-in information including your username and password",
            "Payment and billing information including credit card details, billing address and payment history",
            "Records of correspondence and customer support interactions",
            "Information collected from marketing campaigns, surveys and your interactions with us including via social media",
            "Technical data such as IP address, browser type, device identifiers and usage data collected automatically when you visit woolet.co",
          ]} />
          <p>We do not generally collect sensitive personal information. Where we do, we will obtain your explicit consent or rely on a lawful basis under applicable law.</p>
        </>
      ),
    },
    {
      num: "03",
      title: "How We Collect Information",
      content: (
        <>
          <p>We collect personal information in a number of ways, including:</p>
          <BulletList items={[
            "Directly from you when you complete an order, register an account, make an enquiry, or subscribe to our waitlist or newsletter",
            "Automatically when you interact with our website through cookies, log files and similar tracking technologies",
            "From third-party platforms such as payment processors, social media platforms and analytics providers",
            "From publicly available sources where relevant",
          ]} />
          <p>If you provide personal information about another person, please ensure they are aware of this Privacy Policy and have consented to you sharing their information with us.</p>
        </>
      ),
    },
    {
      num: "04",
      title: "Cookies and Tracking Technologies",
      content: (
        <>
          <p>We may use cookies, web beacons and similar technologies on woolet.co to improve your experience, analyse traffic and deliver relevant content. These may include:</p>
          <BulletList items={[
            "Strictly necessary cookies required for the website to function",
            "Analytics cookies (e.g. Google Analytics) to understand how visitors use our site",
            "Marketing and retargeting cookies to show you relevant advertisements",
          ]} />
          <p>You can control cookies through your browser settings. If you disable cookies, some features of our website may not function correctly. We honour "Do Not Track" browser signals where technically feasible.</p>
        </>
      ),
    },
    {
      num: "05",
      title: "How We Use Your Information",
      content: (
        <>
          <p>We collect, hold, use and disclose personal information for the primary purpose of conducting our business, which includes:</p>
          <BulletList items={[
            "Processing and fulfilling your orders for eyewear and other products",
            "Communicating with you about your orders, returns and customer support requests",
            "Managing your account and providing access to our services",
            "Sending you marketing communications, product launches and promotions (where you have consented or where permitted by law)",
            "Improving our website, products and services through analytics and research",
            "Complying with legal obligations and enforcing our terms",
            "Protecting against fraud, misuse or unauthorised access",
            "Transferring data as part of a business sale, merger or restructuring",
          ]} />
        </>
      ),
    },
    {
      num: "06",
      title: "Children's Privacy",
      content: (
        <p>Our products and services are not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child, please contact us immediately and we will take steps to delete it. We do not send direct marketing communications to anyone under 18 years of age.</p>
      ),
    },
    {
      num: "07",
      title: "Who We Share Your Information With",
      content: (
        <>
          <p>We may share your personal information with trusted third parties who assist us in operating our business, including:</p>
          <BulletList items={[
            "Payment processors and financial institutions",
            "Shipping and logistics providers",
            "Email marketing and CRM platforms",
            "Analytics and advertising technology providers",
            "Legal, accounting and professional advisors",
            "Cloud hosting and IT service providers",
          ]} />
          <p>All third parties are required to handle your personal information in accordance with applicable privacy laws and our data processing agreements. We do not sell your personal information to third parties.</p>
        </>
      ),
    },
    {
      num: "08",
      title: "International Data Transfers",
      content: (
        <>
          <p>As a US-based company operating internationally, we may transfer your personal information to countries outside your jurisdiction. When transferring data internationally, we take reasonable steps to ensure appropriate safeguards are in place, including standard contractual clauses approved by the European Commission where applicable.</p>
          <p>By using our services, you consent to the transfer of your personal information to the United States and other countries where we or our service providers operate.</p>
        </>
      ),
    },
    {
      num: "09",
      title: "Data Security and Retention",
      content: (
        <>
          <p>We take your privacy and security seriously and implement appropriate technical and organisational measures to protect your personal information, including:</p>
          <BulletList items={[
            "SSL/TLS encryption for all data transmitted through woolet.co",
            "Encrypted storage of payment and sensitive account information",
            "Restricted access controls and password protection on our systems",
            "Regular security assessments and monitoring",
          ]} />
          <p>We retain personal information for as long as reasonably necessary for the purposes described in this policy, or as required by law. When information is no longer needed, we take reasonable steps to securely delete or de-identify it.</p>
          <p>While we strive to protect your information, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </>
      ),
    },
    {
      num: "10",
      title: "Your Rights",
      content: (
        <>
          <p>Depending on your location, you may have the following rights regarding your personal information:</p>
          <BulletList items={[
            "<strong class='text-[hsl(var(--cream))] font-normal'>Access</strong> — request a copy of the personal information we hold about you",
            "<strong class='text-[hsl(var(--cream))] font-normal'>Correction</strong> — request that we correct inaccurate or incomplete information",
            "<strong class='text-[hsl(var(--cream))] font-normal'>Deletion</strong> — request that we delete your personal information under certain circumstances",
            "<strong class='text-[hsl(var(--cream))] font-normal'>Objection</strong> — object to certain processing activities, including direct marketing",
            "<strong class='text-[hsl(var(--cream))] font-normal'>Restriction</strong> — request that we restrict processing of your information in certain circumstances",
            "<strong class='text-[hsl(var(--cream))] font-normal'>Portability</strong> — request a machine-readable copy of your information for transfer to another service",
            "<strong class='text-[hsl(var(--cream))] font-normal'>Withdrawal of consent</strong> — withdraw consent at any time where processing is based on consent",
          ]} />
          <p>To exercise any of these rights, please contact us using the details below. We will respond within 30 days of receiving your request. We may require proof of identity before fulfilling your request.</p>
        </>
      ),
    },
    {
      num: "11",
      title: "Direct Marketing",
      content: (
        <>
          <p>From time to time, we may use your personal information to send you information about our products, new collections, promotions and events. You may opt out of direct marketing at any time by:</p>
          <BulletList items={[
            'Clicking the "unsubscribe" link at the bottom of any marketing email',
            "Contacting us directly at <strong class='text-[hsl(var(--cream))] font-normal'>support@woolet.co</strong>",
          ]} />
          <p>Once you have opted out, we will update our records within a reasonable time and cease sending marketing communications.</p>
        </>
      ),
    },
    {
      num: "12",
      title: "European Union Users (GDPR)",
      content: (
        <>
          <p>If you are located in the European Union, our processing of your personal data is governed by the GDPR. In addition to the rights listed above, you have the right to lodge a complaint with your local supervisory authority if you believe we have not handled your personal data in accordance with applicable law.</p>
          <p>Our legal bases for processing personal data include: performance of a contract, compliance with legal obligations, our legitimate interests, and your consent. We do not use automated decision-making or profiling that produces legal effects concerning you.</p>
        </>
      ),
    },
    {
      num: "13",
      title: "Changes to This Policy",
      content: (
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of material changes by posting the updated policy on woolet.co. Your continued use of our services following the posting of changes constitutes acceptance of those changes.</p>
      ),
    },
    {
      num: "14",
      title: "Contact Us",
      content: (
        <>
          <p>If you have any questions, concerns or requests regarding this Privacy Policy or the handling of your personal information, please contact us:</p>
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

  return <PolicyPage title="Privacy Policy" meta="JAY23 LLC · Last updated: March 2025" sections={sections} />;
};

export default PrivacyPolicy;
