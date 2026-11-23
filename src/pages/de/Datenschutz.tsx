import DeLegalLayout from "@/components/de/DeLegalLayout";

/**
 * German privacy policy (23.11.2026). Until now the DE footer linked
 * "Datenschutz" to the English /en/privacy-policy. Same content as
 * src/pages/PrivacyPolicy.tsx: keep both in sync when the policy changes.
 * noindex like the English page.
 */

const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc space-y-1.5 pl-5">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-normal text-foreground">{children}</strong>
);

const Mail = () => (
  <a className="text-primary underline" href="mailto:support@woolet.co">support@woolet.co</a>
);

export default function Datenschutz() {
  return (
    <DeLegalLayout
      title="Datenschutzerklärung"
      slug="datenschutz"
      noindex
      description="Datenschutzerklärung von Woolet (JAY23 LLC): welche Daten wir erheben, wofür wir sie nutzen und welche Rechte du hast."
      intro={<p>JAY23 LLC · Stand: April 2026 (deutsche Fassung vom November 2026)</p>}
      sections={[
        {
          title: "Fit-Scan und Maßanfertigung",
          content: (
            <>
              <p><B>JAY23 LLC</B> (Wyoming, USA) ist Verantwortlicher für alle in diesem Abschnitt beschriebenen Daten. Unser Anbieter für den Fit-Scan (FitLens) und die Werkstatt in der EU, die deine Fassung fertigt, handeln nur als Auftragsverarbeiter nach unseren Weisungen.</p>
              <p><B>Der Fit-Scan.</B> Wenn du dein Gesicht mit unserem Scan-Tool auf der Website misst, erhält das Tool nur eine zufällige Sitzungsreferenz und die Sprache der Seite, sonst nichts. Es erhält nie deinen Namen, deine E-Mail-Adresse oder deine Bestellnummer. Die Zuordnung eines Scans zu einer Person entsteht erst danach in unseren eigenen Systemen.</p>
              <p><B>Foto und virtuelle Anprobe.</B> Vor dem Kauf kannst du mit dem Handy ein Porträt ohne Brille hochladen und die zuvor erzeugte Fassung auf deinem Gesicht sehen. Beim Erzeugen der Anprobe speichern wir weder das Original noch das Ergebnis. Erst nachdem du das Ergebnis gesehen hast, kannst du gesondert einwilligen, dass wir beide Bilder aufbewahren und an die Werkstatt weitergeben. Nach dem Kauf steht dir zusätzlich ein separater, freiwilliger Messprozess zur Verfügung.</p>
              <p><B>Speicherung.</B> Fotos und Anprobe-Vorschauen liegen in einem privaten Speicher und sind nur über kurzlebige, signierte Links erreichbar. Als Nachweis deiner Einwilligung speichern wir den genauen Einwilligungstext, seine Version, den Zeitpunkt, die Sprache und einen Einweg-Hash deiner IP-Adresse.</p>
              <p><B>Die Werkstatt.</B> Die Werkstatt, die deine Fassung in der EU von Hand fertigt, sieht nur, was sie dafür braucht: eine Fertigungsreferenz, die Maße, das Passform-Foto und die Anprobe-Vorschau. Sie sieht nie deinen Namen, deine E-Mail-Adresse oder deine Lieferadresse.</p>
              <p><B>Speicherdauer.</B> Passform-Fotos werden spätestens 90 Tage nach Zustellung deiner Bestellung gelöscht. Du kannst deine Einwilligung jederzeit widerrufen, auf der Foto-Seite deiner Bestellung oder per E-Mail an <Mail />. Foto und Vorschau werden dann sofort gelöscht; nur der Einwilligungsnachweis selbst bleibt erhalten.</p>
            </>
          ),
        },
        {
          title: "Wer wir sind",
          content: (
            <>
              <p><B>JAY23 LLC</B>, handelnd unter der Marke Woolet, weiß, dass dir deine personenbezogenen Daten wichtig sind, und nimmt den Schutz deiner Privatsphäre ernst.</p>
              <p>Wir bieten Produkte und Leistungen in mehreren Rechtsräumen an, darunter die USA, Europa und weitere Regionen. Für uns gelten unter anderem:</p>
              <List items={[
                "die Datenschutz-Grundverordnung (EU) 2016/679 (DSGVO)",
                "der California Online Privacy Protection Act of 2003 (CalOPPA)",
                "der Children's Online Privacy Protection Act of 1998 (COPPA)",
                "weitere anwendbare Datenschutzgesetze des US-Bundes und der US-Bundesstaaten",
              ]} />
              <p>Wenn du woolet.co und unsere Leistungen nutzt oder uns personenbezogene Daten mitteilst, nimmst du zur Kenntnis, dass wir diese Daten nach dieser Datenschutzerklärung erheben, nutzen, speichern und weitergeben.</p>
            </>
          ),
        },
        {
          title: "Welche Daten wir erheben",
          content: (
            <>
              <p>Welche Daten wir über dich erheben und speichern, hängt davon ab, wie du mit uns zu tun hast. Dazu können gehören:</p>
              <List items={[
                "Kontakt- und Identifikationsdaten wie Name, Anschrift, Telefonnummer, E-Mail-Adresse und Geburtsdatum",
                "Anmeldedaten wie Benutzername und Passwort",
                "Zahlungs- und Rechnungsdaten wie Kartendaten, Rechnungsadresse und Zahlungsverlauf",
                "Korrespondenz und Anfragen an den Kundenservice",
                "Daten aus Marketingkampagnen, Umfragen und deinen Interaktionen mit uns, auch über soziale Medien",
                "technische Daten wie IP-Adresse, Browsertyp, Gerätekennungen und Nutzungsdaten, die beim Besuch von woolet.co automatisch anfallen",
              ]} />
              <p>Besondere Kategorien personenbezogener Daten erheben wir in der Regel nicht. Wenn doch, holen wir deine ausdrückliche Einwilligung ein oder stützen uns auf eine andere Rechtsgrundlage nach geltendem Recht.</p>
            </>
          ),
        },
        {
          title: "Wie wir Daten erheben",
          content: (
            <>
              <p>Wir erheben personenbezogene Daten auf verschiedenen Wegen, unter anderem:</p>
              <List items={[
                "direkt von dir, wenn du bestellst, ein Konto anlegst, eine Anfrage stellst oder dich in unsere Warteliste oder unseren Newsletter einträgst",
                "automatisch, wenn du unsere Website nutzt, über Cookies, Logdateien und ähnliche Technologien",
                "von Drittanbietern wie Zahlungsdienstleistern, sozialen Netzwerken und Analyseanbietern",
                "aus öffentlich zugänglichen Quellen, soweit relevant",
              ]} />
              <p>Wenn du uns Daten über eine andere Person mitteilst, sorge bitte dafür, dass sie diese Datenschutzerklärung kennt und mit der Weitergabe einverstanden ist.</p>
            </>
          ),
        },
        {
          title: "Cookies und Tracking",
          content: (
            <>
              <p>Wir können auf woolet.co Cookies, Web-Beacons und ähnliche Technologien einsetzen, um die Nutzung zu verbessern, Zugriffe auszuwerten und passende Inhalte zu zeigen. Dazu können gehören:</p>
              <List items={[
                "technisch notwendige Cookies, ohne die die Website nicht funktioniert",
                "Analyse-Cookies (z. B. Google Analytics), um zu verstehen, wie Besucher unsere Seite nutzen",
                "Marketing- und Retargeting-Cookies, um dir passende Werbung zu zeigen",
              ]} />
              <p>Du kannst Cookies in deinen Browsereinstellungen steuern. Wenn du Cookies deaktivierst, funktionieren manche Funktionen der Website möglicherweise nicht richtig. „Do Not Track“-Signale berücksichtigen wir, soweit technisch möglich.</p>
              <p>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
                  className="text-primary underline underline-offset-2"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                >
                  Cookie-Einstellungen
                </button>{" "}
                - hier kannst du deine Einwilligung jederzeit anpassen oder widerrufen.
              </p>
            </>
          ),
        },
        {
          title: "Wofür wir deine Daten nutzen",
          content: (
            <>
              <p>Wir erheben, speichern, nutzen und übermitteln personenbezogene Daten vor allem, um unser Geschäft zu betreiben, insbesondere um:</p>
              <List items={[
                "deine Bestellungen von Brillen und anderen Produkten zu bearbeiten und auszuliefern",
                "mit dir über Bestellungen, Rücksendungen und Serviceanfragen zu kommunizieren",
                "dein Konto zu verwalten und dir Zugang zu unseren Leistungen zu geben",
                "dir Marketing-Nachrichten, Produktneuheiten und Angebote zu senden (mit deiner Einwilligung oder soweit gesetzlich erlaubt)",
                "unsere Website, Produkte und Leistungen durch Analysen und Forschung zu verbessern",
                "gesetzliche Pflichten zu erfüllen und unsere Bedingungen durchzusetzen",
                "Betrug, Missbrauch und unbefugten Zugriff zu verhindern",
                "Daten im Rahmen eines Unternehmensverkaufs, einer Fusion oder Umstrukturierung zu übertragen",
              ]} />
            </>
          ),
        },
        {
          title: "Kinder",
          content: (
            <p>Unsere Produkte und Leistungen richten sich nicht an Kinder unter 13 Jahren. Wir erheben wissentlich keine Daten von Kindern unter 13 Jahren. Wenn du glaubst, dass wir versehentlich Daten eines Kindes erhoben haben, melde dich bitte sofort bei uns, damit wir sie löschen. Direktwerbung senden wir an niemanden unter 18 Jahren.</p>
          ),
        },
        {
          title: "An wen wir Daten weitergeben",
          content: (
            <>
              <p>Wir können deine Daten an vertrauenswürdige Dritte weitergeben, die uns beim Betrieb unseres Geschäfts unterstützen, darunter:</p>
              <List items={[
                "Zahlungsdienstleister und Finanzinstitute",
                "Versand- und Logistikdienstleister",
                "E-Mail-Marketing- und CRM-Plattformen",
                "Anbieter von Analyse- und Werbetechnologie",
                "Rechts-, Steuer- und sonstige Berater",
                "Cloud-Hosting- und IT-Dienstleister",
              ]} />
              <p>Alle Dritten müssen deine Daten nach geltendem Datenschutzrecht und unseren Auftragsverarbeitungsverträgen behandeln. Wir verkaufen deine personenbezogenen Daten nicht an Dritte.</p>
            </>
          ),
        },
        {
          title: "Internationale Datenübermittlung",
          content: (
            <>
              <p>Als international tätiges Unternehmen mit Sitz in den USA können wir deine Daten in Länder außerhalb deines Wohnsitzlandes übermitteln. Dabei sorgen wir für angemessene Garantien, soweit anwendbar unter anderem durch die von der Europäischen Kommission genehmigten Standardvertragsklauseln.</p>
              <p>Mit der Nutzung unserer Leistungen willigst du in die Übermittlung deiner Daten in die USA und in andere Länder ein, in denen wir oder unsere Dienstleister tätig sind.</p>
            </>
          ),
        },
        {
          title: "Datensicherheit und Speicherdauer",
          content: (
            <>
              <p>Wir nehmen Datenschutz und Sicherheit ernst und schützen deine Daten mit geeigneten technischen und organisatorischen Maßnahmen, darunter:</p>
              <List items={[
                "SSL/TLS-Verschlüsselung für alle Daten, die über woolet.co übertragen werden",
                "verschlüsselte Speicherung von Zahlungs- und sensiblen Kontodaten",
                "eingeschränkte Zugriffsrechte und Passwortschutz in unseren Systemen",
                "regelmäßige Sicherheitsprüfungen und Überwachung",
              ]} />
              <p>Wir speichern personenbezogene Daten so lange, wie es für die hier beschriebenen Zwecke vernünftigerweise nötig ist oder gesetzlich vorgeschrieben ist. Werden sie nicht mehr benötigt, löschen oder anonymisieren wir sie sicher.</p>
              <p>Keine Übertragung über das Internet ist zu 100 % sicher. Für die Vertraulichkeit deiner Zugangsdaten bist du selbst verantwortlich.</p>
            </>
          ),
        },
        {
          title: "Deine Rechte",
          content: (
            <>
              <p>Je nach Wohnort hast du in Bezug auf deine personenbezogenen Daten folgende Rechte:</p>
              <List items={[
                <><B>Auskunft</B> - eine Kopie der Daten anfordern, die wir über dich speichern</>,
                <><B>Berichtigung</B> - unrichtige oder unvollständige Daten korrigieren lassen</>,
                <><B>Löschung</B> - unter bestimmten Voraussetzungen die Löschung deiner Daten verlangen</>,
                <><B>Widerspruch</B> - bestimmten Verarbeitungen widersprechen, auch der Direktwerbung</>,
                <><B>Einschränkung</B> - unter bestimmten Voraussetzungen die Einschränkung der Verarbeitung verlangen</>,
                <><B>Datenübertragbarkeit</B> - deine Daten in einem maschinenlesbaren Format für einen anderen Dienst erhalten</>,
                <><B>Widerruf der Einwilligung</B> - eine Einwilligung jederzeit widerrufen, wenn die Verarbeitung darauf beruht</>,
              ]} />
              <p>Um deine Rechte auszuüben, schreib uns über die unten genannten Kontaktdaten. Wir antworten innerhalb von 30 Tagen nach Eingang deiner Anfrage und können vorher einen Identitätsnachweis verlangen.</p>
            </>
          ),
        },
        {
          title: "Direktwerbung",
          content: (
            <>
              <p>Wir können deine Daten nutzen, um dich über unsere Produkte, neue Kollektionen, Angebote und Veranstaltungen zu informieren. Du kannst Direktwerbung jederzeit abbestellen:</p>
              <List items={[
                "über den Abmelde-Link am Ende jeder Marketing-E-Mail",
                <>per E-Mail an <Mail /></>,
              ]} />
              <p>Nach deiner Abmeldung passen wir unsere Unterlagen in angemessener Zeit an und senden dir keine Marketing-Nachrichten mehr.</p>
            </>
          ),
        },
        {
          title: "Nutzer in der Europäischen Union (DSGVO)",
          content: (
            <>
              <p>Wenn du dich in der Europäischen Union befindest, richtet sich die Verarbeitung deiner Daten nach der DSGVO. Zusätzlich zu den oben genannten Rechten kannst du dich bei deiner zuständigen Datenschutz-Aufsichtsbehörde beschweren, wenn du der Meinung bist, dass wir deine Daten nicht rechtmäßig verarbeiten.</p>
              <p>Rechtsgrundlagen unserer Verarbeitung sind die Erfüllung eines Vertrags, die Erfüllung rechtlicher Pflichten, unsere berechtigten Interessen und deine Einwilligung. Wir nutzen keine automatisierten Entscheidungen oder Profiling mit rechtlicher Wirkung für dich.</p>
            </>
          ),
        },
        {
          title: "Änderungen dieser Erklärung",
          content: (
            <p>Wir können diese Datenschutzerklärung anpassen, wenn sich unsere Abläufe oder die Rechtslage ändern. Über wesentliche Änderungen informieren wir, indem wir die aktualisierte Fassung auf woolet.co veröffentlichen. Wenn du unsere Leistungen danach weiter nutzt, gilt das als Zustimmung zu den Änderungen.</p>
          ),
        },
        {
          title: "Kontakt",
          content: (
            <>
              <p>Bei Fragen, Anliegen oder Anfragen zu dieser Datenschutzerklärung oder zum Umgang mit deinen Daten erreichst du uns hier:</p>
              <p>JAY23 LLC - Woolet<br />412 N. Main Street, STE 100<br />Buffalo, Wyoming 82834, USA</p>
              <p>E-Mail: <Mail /></p>
              <p>Siehe auch: <a className="text-primary underline" href="/de/impressum">Impressum</a> · <a className="text-primary underline" href="/de/widerruf">Widerrufsbelehrung</a></p>
            </>
          ),
        },
      ]}
    />
  );
}
