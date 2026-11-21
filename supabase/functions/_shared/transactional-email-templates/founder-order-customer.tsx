import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

// Customer confirmation: a Founder Edition order was paid on woolet.co/en/founders.
// Sent by payments-webhook (transactional, so it reaches buyers who are not on
// the marketing list). dutyNote comes from _shared/import-duties.ts.
interface Props {
  customerName?: string
  orderRef?: string
  modelName?: string
  modelSpec?: string
  amountFormatted?: string
  address?: string
  phone?: string
  dutyNote?: string
}

const INK = '#0B0A09'
const PAPER = '#EFE9DF'

const Email = ({
  customerName = '',
  orderRef = '',
  modelName = 'Woolet Founder Edition 009 Black',
  modelSpec = '158 mm front · 24 mm bridge · Mazzucchelli acetate · Founder Box (magnetic box, special case, Clip-On Cloth)',
  amountFormatted = '',
  address = '',
  phone = '',
  dutyNote = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Order {orderRef} is confirmed. Here is what you ordered and where it ships.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>WOOLET</Text>
        <Heading style={h1}>Thank you{customerName ? `, ${customerName.split(' ')[0]}` : ''}. Your order is confirmed.</Heading>
        <Text style={body}>
          We have your payment and your Founder Edition frame is reserved for you. Please check the details below,
          especially the shipping address. If anything is wrong, just reply to this email.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>Order {orderRef}</Text>
          <Row label="Model" value={modelName} />
          <Row label="Configuration" value={modelSpec} />
          <Row label="Paid" value={amountFormatted} />
          <Row label="Ship to" value={address} />
          <Row label="Phone for the courier" value={phone} />
        </Section>

        <Heading as="h2" style={h2}>Shipping, duty and taxes</Heading>
        <Text style={body}>{dutyNote}</Text>
        <Text style={body}>
          Shipping itself is free. We send your frame with a tracked courier and email you the tracking number as soon
          as it leaves us.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          Questions about your order? Reply to this email, support@woolet.co reads every message.
        </Text>
        <Text style={footer}>Woolet · eyewear made for wider faces.</Text>
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
  subject: (data: Record<string, any>) => data.orderRef ? `Your Woolet order ${data.orderRef} is confirmed` : 'Your Woolet order is confirmed',
  displayName: 'Founder Edition - Customer Confirmation',
  previewData: {
    customerName: 'Jane Doe',
    orderRef: 'WLT-FE-A1B2C3D4',
    amountFormatted: '$114.00',
    address: 'Jane Doe, 1 Main St, Apt 4, 10001 New York, NY, US',
    phone: '+1 555 0100',
    dutyNote:
      'Your frame ships from the European Union. US import duty applies to eyewear from the EU (about 15% of the order value), and the carrier usually adds a customs clearance fee. Both are charged to you by the carrier on delivery, not included in your payment to us.',
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
const brand: React.CSSProperties = { fontSize: 11, letterSpacing: '0.32em', fontWeight: 600, color: INK, margin: '0 0 16px' }
const h1: React.CSSProperties = { fontSize: 24, fontWeight: 500, lineHeight: 1.2, margin: '0 0 12px', color: INK }
const h2: React.CSSProperties = { fontSize: 17, fontWeight: 500, margin: '24px 0 8px', color: INK }
const body: React.CSSProperties = { fontSize: 14, lineHeight: 1.55, color: '#333', margin: '0 0 12px' }
const card: React.CSSProperties = { background: PAPER, borderRadius: 6, padding: '18px 20px', margin: '16px 0 20px' }
const cardTitle: React.CSSProperties = { fontSize: 18, fontWeight: 500, color: INK, margin: '0 0 12px' }
const specRow: React.CSSProperties = { borderTop: '1px solid rgba(11,10,9,0.08)', padding: '6px 0' }
const specLabel: React.CSSProperties = { fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', margin: '0 0 2px' }
const specValue: React.CSSProperties = { fontSize: 13, color: INK, margin: 0 }
const hr: React.CSSProperties = { borderColor: '#e6e6e6', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: 11, color: '#888', lineHeight: 1.5, margin: 0 }
