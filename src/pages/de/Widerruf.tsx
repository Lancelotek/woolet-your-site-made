import DeLegalLayout from "@/components/de/DeLegalLayout";

export default function Widerruf() {
  return (
    <DeLegalLayout
      title="Widerrufsbelehrung"
      description="Informationen zum 14-tägigen Widerrufsrecht für Woolet Reservierungen und Vorbestellungen."
      sections={[
        {
          title: "Widerrufsrecht",
          content: <p>Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses bei einer Reservierung oder ab Erhalt der Ware bei einer Bestellung.</p>,
        },
        {
          title: "Widerruf ausüben",
          content: <p>Um dein Widerrufsrecht auszuüben, musst du JAY23 LLC, 412 N. Main Street, STE 100, Buffalo, Wyoming 82834, USA, per E-Mail an <a className="text-primary underline" href="mailto:support@woolet.co">support@woolet.co</a> mit einer eindeutigen Erklärung über deinen Entschluss informieren.</p>,
        },
        {
          title: "Folgen des Widerrufs",
          content: <p>Wenn du diesen Vertrag widerrufst, erstatten wir alle erhaltenen Zahlungen unverzüglich und spätestens binnen vierzehn Tagen ab Eingang deines Widerrufs. Die Rückzahlung erfolgt grundsätzlich über dasselbe Zahlungsmittel.</p>,
        },
        {
          title: "Reservierungsgebühr",
          content: <p>Die Reservierungsgebühr von 1 € wird vollständig auf den Kaufpreis angerechnet und auf Anfrage jederzeit erstattet.</p>,
        },
      ]}
    />
  );
}