import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Row {
  label: string
  value: string
  /** "scan" or "by hand" — the customer should see where a number came from. */
  source?: string
}

interface Props {
  customerName?: string
  measurementRef?: string
  rows?: Row[]
  remeasureUrl?: string
}

const GOLD = '#C2A05A'
const INK = '#0B0A09'
const PAPER = '#EFE9DF'

const Email = ({
  customerName = '',
  measurementRef = '',
  rows = [],
  remeasureUrl = 'https://woolet.co/en/bespoke/measurements',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Your measurements are with us{measurementRef ? ` — reference ${measurementRef}` : ''}.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>WOOLET</Text>

        <Heading style={h1}>
          Your measurements are with us{customerName ? `, ${customerName}` : ''}.
        </Heading>

        {measurementRef ? (
          <Section style={refCard}>
            <Text style={refLabel}>Your measurement reference</Text>
            <Text style={refValue}>{measurementRef}</Text>
          </Section>
        ) : null}

        <Section style={card}>
          <Text style={cardTitle}>What we received</Text>
          {rows.length ? (
            rows.map((row) => (
              <Section key={row.label} style={specRow}>
                <Text style={specLabel}>
                  {row.label}
                  {row.source ? ` · ${row.source}` : ''}
                </Text>
                <Text style={specValue}>{row.value}</Text>
              </Section>
            ))
          ) : (
            <Text style={specValue}>No numbers recorded yet.</Text>
          )}
        </Section>

        <Text style={body}>
          Bespoke frames are cut to the millimetre. A second scan takes twenty
          seconds and tells us whether the first one landed. When the two agree,
          we cut. When they differ, I write to you before anything is cut.
        </Text>

        <Section style={ctaWrap}>
          <Link href={remeasureUrl} style={cta}>
            Measure again
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          The reference above is yours — quote it in any reply and I will know
          exactly which measurement you mean.
        </Text>
        <Text style={footer}>Woolet · Made-to-measure eyewear.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data.measurementRef
      ? `Your measurements — reference ${data.measurementRef}`
      : 'Your measurements are with us',
  displayName: 'Bespoke — Measurement Summary (customer)',
  previewData: {
    customerName: 'Marek',
    measurementRef: 'M-7KQ4X2',
    rows: [
      { label: 'Temple-to-temple', value: '160.0 mm', source: 'scan' },
      { label: 'Pupillary distance', value: '66 mm', source: 'scan' },
      { label: 'Inner-canthal distance (face)', value: '33 mm', source: 'scan' },
      { label: 'Bridge of best-fitting glasses', value: '21 mm', source: 'by hand' },
    ],
    remeasureUrl: 'https://woolet.co/en/bespoke/measurements?sid=cs_live_a1B2c3&remeasure=1',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  color: INK,
  margin: 0,
  padding: 0,
}
const container: React.CSSProperties = { maxWidth: 560, margin: '0 auto', padding: '32px 24px 48px' }
const brand: React.CSSProperties = {
  fontSize: 14,
  letterSpacing: '0.32em',
  fontWeight: 600,
  color: INK,
  margin: '0 0 28px',
}
const h1: React.CSSProperties = { fontSize: 26, fontWeight: 400, lineHeight: 1.2, margin: '0 0 16px', color: INK }
const body: React.CSSProperties = { fontSize: 15, lineHeight: 1.65, color: '#333', margin: '20px 0 0' }
const refCard: React.CSSProperties = {
  border: `1px solid ${GOLD}`,
  borderRadius: 6,
  padding: '16px 20px',
  margin: '8px 0 20px',
  textAlign: 'center',
}
const refLabel: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#666',
  margin: '0 0 6px',
}
const refValue: React.CSSProperties = {
  fontSize: 30,
  letterSpacing: '0.12em',
  fontWeight: 600,
  color: INK,
  margin: 0,
}
const card: React.CSSProperties = { background: PAPER, borderRadius: 6, padding: '18px 20px', margin: '0 0 8px' }
const cardTitle: React.CSSProperties = { fontSize: 17, fontWeight: 500, color: INK, margin: '0 0 10px' }
const specRow: React.CSSProperties = { borderTop: '1px solid rgba(11,10,9,0.08)', padding: '7px 0' }
const specLabel: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#666',
  margin: '0 0 2px',
}
const specValue: React.CSSProperties = { fontSize: 14, color: INK, margin: 0 }
const ctaWrap: React.CSSProperties = { margin: '22px 0 4px' }
const cta: React.CSSProperties = {
  display: 'inline-block',
  background: GOLD,
  color: INK,
  padding: '14px 24px',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  borderRadius: 2,
}
const hr: React.CSSProperties = { borderColor: '#e6e6e6', margin: '28px 0' }
const footer: React.CSSProperties = { fontSize: 12, color: '#888', lineHeight: 1.55, margin: '0 0 8px' }
