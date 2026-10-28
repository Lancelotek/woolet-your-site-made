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

// Internal: tells Marek which customer and which order just sent the required
// fit photo with a card. The photo itself stays in private storage and is
// opened from the Bespoke panel - never attached or linked from email.

interface Props {
  orderRef?: string
  caseNo?: string
  customerName?: string
  customerEmail?: string
  frameName?: string
  amountFormatted?: string
  paidAt?: string
  photoTempleToTempleMm?: number | null
  scanTempleToTempleMm?: number | null
  deltaMm?: number | null
  needsReview?: boolean
  retake?: boolean
  adminUrl?: string
}

const INK = '#0B0A09'
const PAPER = '#EFE9DF'
const RED = '#C13A2E'

const mm = (v?: number | null) => (v == null ? '' : `${v} mm`)

const Email = ({
  orderRef = '',
  caseNo = '',
  customerName = '',
  customerEmail = '',
  frameName = 'Woolet Bespoke',
  amountFormatted = '',
  paidAt = '',
  photoTempleToTempleMm = null,
  scanTempleToTempleMm = null,
  deltaMm = null,
  needsReview = false,
  retake = false,
  adminUrl = 'https://woolet.co/en/admin/bespoke',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {customerName || customerEmail} sent the fit photo - {orderRef}
      {needsReview ? ' - CHECK BEFORE CUTTING' : ''}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>WOOLET · INTERNAL</Text>

        {needsReview ? (
          <Text style={alert}>
            CHECK BEFORE CUTTING - photo and scan differ by {deltaMm} mm. Production is blocked
            until you confirm the width.
          </Text>
        ) : null}

        <Heading style={h1}>{retake ? 'Fit photo retaken' : 'Fit photo received'}</Heading>
        <Text style={body}>
          {customerName || 'The customer'} sent the photo with a card for order {orderRef}.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>Customer & order</Text>
          <SpecRow label="Customer" value={customerName} />
          <SpecRow label="Email" value={customerEmail} />
          <SpecRow label="Order" value={[orderRef, caseNo].filter(Boolean).join(' · ')} />
          <SpecRow label="Frame" value={frameName} />
          <SpecRow label="Paid" value={[amountFormatted, paidAt].filter(Boolean).join(' · ')} />
        </Section>

        <Section style={card}>
          <Text style={cardTitle}>Photo vs scan</Text>
          <SpecRow label="Photo · temple-to-temple" value={mm(photoTempleToTempleMm)} />
          <SpecRow label="Scan · face width" value={mm(scanTempleToTempleMm)} />
          <SpecRow
            label="Difference"
            value={deltaMm == null ? 'No scan to compare against' : `${deltaMm} mm`}
          />
        </Section>

        <Text style={body}>
          <Link href={adminUrl} style={link}>Open the order and the photo in the Bespoke panel →</Link>
        </Text>

        <Hr style={hr} />
        <Text style={footer}>Automated notification from woolet.co · Bespoke fit photo.</Text>
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
    `${data.needsReview ? '[CHECK] ' : ''}[Woolet Bespoke] Fit photo — ${
      data.customerName || data.customerEmail || ''
    } — ${data.orderRef ?? ''}`.trim(),
  displayName: 'Bespoke — Fit Photo Received',
  to: 'marek@woolet.co',
  previewData: {
    orderRef: 'WLT-02345C42',
    caseNo: 'B-0007',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    frameName: 'Woolet Bespoke — Round',
    amountFormatted: '$480.00 USD',
    paidAt: '2026-10-28',
    photoTempleToTempleMm: 161.4,
    scanTempleToTempleMm: 158,
    deltaMm: 3.4,
    needsReview: false,
    retake: false,
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
const body: React.CSSProperties = { fontSize: 14, lineHeight: 1.55, color: '#333', margin: '0 0 12px' }
const card: React.CSSProperties = { background: PAPER, borderRadius: 6, padding: '18px 20px', margin: '16px 0 20px' }
const cardTitle: React.CSSProperties = { fontSize: 18, fontWeight: 500, color: INK, margin: '0 0 12px' }
const specRow: React.CSSProperties = { borderTop: '1px solid rgba(11,10,9,0.08)', padding: '6px 0' }
const specLabel: React.CSSProperties = { fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', margin: '0 0 2px' }
const specValue: React.CSSProperties = { fontSize: 13, color: INK, margin: 0 }
const link: React.CSSProperties = { color: INK, textDecoration: 'underline' }
const hr: React.CSSProperties = { borderColor: '#e6e6e6', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: 11, color: '#888', lineHeight: 1.5, margin: 0 }
