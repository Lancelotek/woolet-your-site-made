import DeLegalLayout from "@/components/de/DeLegalLayout";

export default function Impressum() {
  return (
    <DeLegalLayout
      title="Impressum"
      description="Impressum und Anbieterinformationen von Woolet, einer Marke der JAY23 LLC."
      sections={[
        {
          title: "Anbieter",
          content: <><p>JAY23 LLC</p><p>412 N. Main Street, STE 100<br />Buffalo, Wyoming 82834<br />USA</p></>,
        },
        {
          title: "Vertretung und Kontakt",
          content: <><p>Vertreten durch: Marek Cieśla</p><p>E-Mail: <a className="text-primary underline" href="mailto:support@woolet.co">support@woolet.co</a></p></>,
        },
        {
          title: "Verantwortlich für Inhalte",
          content: <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Marek Cieśla, Anschrift wie oben.</p>,
        },
      ]}
    />
  );
}