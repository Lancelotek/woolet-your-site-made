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
}

interface Props {
  orderRef?: string
  customerEmailMasked?: string
  source?: string
  /** How far the scan was verified: Verified scan / Signed scan / unverified. */
  verificationLabel?: string
  frameName?: string
  measurements?: Row[]
  /** Bridge values already judged out of range by the shared gap rules. */
  bridgeAlerts?: number[]
  bridgeMin?: number
  bridgeMax?: number
  /** Pairs the shared helper found to diverge by more than the tolerance. */
  disagreements?: Array<{ label: string; scan: number; manual: number; delta: number }>
  /** Gap sentences from the shared rules — not restated here. */
  gaps?: string[]
  shippingStatus?: string
  shippingAddress?: string
  adminUrl?: string
}

const INK = '#0B0A09'
const PAPER = '#EFE9DF'
const RED = '#C13A2E'

const Email = ({
  orderRef = '',
  customerEmailMasked = '',
  source = 'manual',
  frameName = 'Woolet Bespoke',
  measurements = [],
  bridgeAlerts = [],
  bridgeMin = 16,
  bridgeMax = 26,
  disagreements = [],
  gaps = [],
  shippingStatus = '',
  shippingAddress = '',
  adminUrl = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {orderRef} — measurements in ({source === 'fitlens' ? 'scan' : 'by hand'})
      {bridgeAlerts.length ? ' — CHECK BEFORE CUTTING' : ''}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>WOOLET · INTERNAL</Text>

        {bridgeAlerts.map((mm) => (
          <Text key={mm} style={alert}>
            CHECK BEFORE CUTTING - bridge {mm} mm outside {bridgeMin}-{bridgeMax} mm
          </Text>
        ))}

        {disagreements.length ? (
          <Text style={alert}>
            SCAN AND MANUAL DISAGREE -{' '}
            {disagreements
              .map((d) => `${d.label}: scan ${d.scan} mm vs manual ${d.manual} mm (${d.delta} mm apart)`)
              .join('; ')}
          </Text>
        ) : null}

        <Heading style={h1}>Measurements received</Heading>
        <Text style={body}>
          {orderRef} · {frameName} · {customerEmailMasked} · numbers came{' '}
          {source === 'fitlens' ? 'from the phone scan' : 'in by hand'}.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>Submitted measurements</Text>
          {measurements.length ? (
            measurements.map((row) => <SpecRow key={row.label} label={row.label} value={row.value} />)
          ) : (
            <Text style={specValue}>No measurements submitted.</Text>
          )}
        </Section>

        <Heading as="h3" style={h3}>Shipping</Heading>
        <Text style={body}>
          {shippingStatus}
          {shippingAddress ? (
            <>
              <br />
              {shippingAddress}
            </>
          ) : null}
        </Text>

        {gaps.length ? (
          <>
            <Heading as="h3" style={h3}>Outstanding gaps</Heading>
            {gaps.map((gap) => (
              <Text key={gap} style={gapLine}>
                · {gap}
              </Text>
            ))}
          </>
        ) : null}

        {adminUrl ? (
          <Text style={body}>
            <Link href={adminUrl} style={link}>Open the order in the Bespoke panel →</Link>
          </Text>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>Automated notification from woolet.co · Bespoke measurements.</Text>
      </Container>
    </Body>
  </Html>
)

const SpecRow = ({ label, value }: { label: string; value: string }) => {
  if (!value) return null
  return (
    <Section style={specRow}>
      <Text style={specLabel}>{label}</Text>
      <Text style={specValue}>{value}</Text>
    </Section>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `${(data.bridgeAlerts ?? []).length ? '[CHECK] ' : ''}[Woolet Bespoke] Measurements — ${
      data.orderRef ?? ''
    }`.trim(),
  displayName: 'Bespoke — Measurements Received',
  to: 'marek@woolet.co',
  previewData: {
    orderRef: 'WLT-02345C42',
    customerEmailMasked: 'h***@icloud.com',
    source: 'fitlens',
    frameName: 'Aviator 155',
    measurements: [
      { label: 'Scan · Face width', value: '158 mm' },
      { label: 'Scan · Temple-to-temple', value: '160 mm' },
      { label: 'Scan · Bridge width', value: '33 mm' },
      { label: 'Manual · Face width', value: '154 mm' },
    ],
    bridgeAlerts: [33],
    bridgeMin: 16,
    bridgeMax: 26,
    disagreements: [{ label: 'Face width', scan: 158, manual: 154, delta: 4 }],
    gaps: ['No city in the delivery address'],
    shippingStatus: 'Address confirmed by the customer',
    shippingAddress: 'Jane Doe, Truong Dinh 89, 330000, VN',
    adminUrl: 'https://woolet.co/en/admin/bespoke',
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
  fontSize: 11,
  letterSpacing: '0.32em',
  fontWeight: 600,
  color: '#888',
  margin: '0 0 16px',
}
const alert: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: RED,
  border: `1px solid ${RED}`,
  borderRadius: 4,
  padding: '10px 12px',
  margin: '0 0 12px',
  lineHeight: 1.45,
}
const h1: React.CSSProperties = { fontSize: 24, fontWeight: 500, lineHeight: 1.2, margin: '0 0 12px', color: INK }
const h3: React.CSSProperties = { fontSize: 14, fontWeight: 600, letterSpacing: '0.04em', margin: '20px 0 8px', color: INK }
const body: React.CSSProperties = { fontSize: 14, lineHeight: 1.55, color: '#333', margin: '0 0 12px' }
const gapLine: React.CSSProperties = { fontSize: 13, lineHeight: 1.5, color: '#333', margin: '0 0 4px' }
const card: React.CSSProperties = { background: PAPER, borderRadius: 6, padding: '18px 20px', margin: '16px 0 20px' }
const cardTitle: React.CSSProperties = { fontSize: 18, fontWeight: 500, color: INK, margin: '0 0 12px' }
const specRow: React.CSSProperties = { borderTop: '1px solid rgba(11,10,9,0.08)', padding: '6px 0' }
const specLabel: React.CSSProperties = { fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', margin: '0 0 2px' }
const specValue: React.CSSProperties = { fontSize: 13, color: INK, margin: 0 }
const link: React.CSSProperties = { color: INK, textDecoration: 'underline' }
const hr: React.CSSProperties = { borderColor: '#e6e6e6', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: 11, color: '#888', lineHeight: 1.5, margin: 0 }
