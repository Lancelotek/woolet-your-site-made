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

// Internal alert: a Founder Edition order was paid on woolet.co/en/founders.
interface Props {
  orderRef?: string
  customerName?: string
  customerEmail?: string
  phone?: string
  address?: string
  country?: string
  amountFormatted?: string
  paidSource?: string
  adminUrl?: string
  stripeUrl?: string
}

const INK = '#0B0A09'
const PAPER = '#EFE9DF'

const Email = ({
  orderRef = '',
  customerName = '',
  customerEmail = '',
  phone = '',
  address = '',
  country = '',
  amountFormatted = '',
  paidSource = '',
  adminUrl = 'https://woolet.co/en/admin/founders',
  stripeUrl = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      New Founder order {orderRef} - {customerName || customerEmail} - {country}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>WOOLET · INTERNAL</Text>
        <Heading style={h1}>New Founder Edition order</Heading>
        <Text style={body}>
          009 Black · 24 mm bridge · Founder Box. Ships right away. The customer already has the confirmation email with
          this address.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>{orderRef}</Text>
          <Row label="Ship to" value={address} />
          <Row label="Phone" value={phone} />
          <Row label="Email" value={customerEmail} />
          <Row label="Paid" value={amountFormatted} />
          <Row label="Source" value={paidSource} />
        </Section>

        <Text style={body}>
          <Link href={adminUrl} style={link}>Open the orders panel →</Link>
        </Text>
        {stripeUrl ? (
          <Text style={body}>
            <Link href={stripeUrl} style={link}>Payment in Stripe →</Link>
          </Text>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>Automated notification from woolet.co · Founder Edition checkout.</Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value: string }) => {
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
    `[Woolet Founder] New order ${data.orderRef ?? ''} - ${data.customerName || data.customerEmail || ''} - ${data.country ?? ''}`.trim(),
  displayName: 'Founder Edition - Internal Order Alert',
  to: 'support@woolet.co',
  previewData: {
    orderRef: 'WLT-FE-A1B2C3D4',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    phone: '+1 555 0100',
    address: 'Jane Doe, 1 Main St, Apt 4, 10001 New York, NY, US',
    country: 'US',
    amountFormatted: '$114.00',
    paidSource: 'ml-fe-site-v1',
    adminUrl: 'https://woolet.co/en/admin/founders',
    stripeUrl: 'https://dashboard.stripe.com/payments/pi_3P',
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
const brand: React.CSSProperties = { fontSize: 11, letterSpacing: '0.32em', fontWeight: 600, color: '#888', margin: '0 0 16px' }
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
