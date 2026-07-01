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

interface Props {
  customerEmail?: string
  customerName?: string
  frameName?: string
  frontCode?: string
  templeCode?: string
  finishName?: string
  lensName?: string
  engravingText?: string
  amountFormatted?: string
  orderRef?: string
  paymentIntentId?: string
  environment?: string
  measurementsUrl?: string
  adminOrderUrl?: string
}

const INK = '#0B0A09'
const PAPER = '#EFE9DF'

const Email = ({
  customerEmail = '',
  customerName = '',
  frameName = 'Woolet Bespoke',
  frontCode = '',
  templeCode = '',
  finishName = '',
  lensName = '',
  engravingText = '',
  amountFormatted = '',
  orderRef = '',
  paymentIntentId = '',
  environment = 'live',
  measurementsUrl = '',
  adminOrderUrl = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      New Bespoke order — {frameName} — {amountFormatted || 'paid'}.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>WOOLET · INTERNAL</Text>
        <Heading style={h1}>New Bespoke order</Heading>
        <Text style={body}>
          {customerName || customerEmail || 'A customer'} just placed a Bespoke
          order. The customer confirmation email (with the measurements form)
          has already been sent.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>{frameName}</Text>
          <SpecRow label="Customer" value={customerName ? `${customerName} <${customerEmail}>` : customerEmail} />
          <SpecRow label="Front acetate" value={frontCode} />
          <SpecRow label="Temple acetate" value={templeCode} />
          <SpecRow label="Finish" value={finishName} />
          <SpecRow label="Lenses" value={lensName} />
          {engravingText ? <SpecRow label="Engraving" value={`"${engravingText}"`} /> : null}
          <SpecRow label="Total paid" value={amountFormatted} />
          <SpecRow label="Environment" value={environment} />
          <SpecRow label="Stripe session" value={orderRef} />
          <SpecRow label="Payment intent" value={paymentIntentId} />
        </Section>

        {measurementsUrl ? (
          <>
            <Heading as="h3" style={h3}>Customer measurements form</Heading>
            <Text style={body}>
              <Link href={measurementsUrl} style={link}>{measurementsUrl}</Link>
            </Text>
          </>
        ) : null}

        {adminOrderUrl ? (
          <Text style={body}>
            <Link href={adminOrderUrl} style={link}>Open in Stripe →</Link>
          </Text>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>
          Automated notification from woolet.co · Bespoke checkout.
        </Text>
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
    `[Woolet Bespoke] New order — ${data.frameName ?? 'made-to-measure'} — ${data.amountFormatted ?? ''}`.trim(),
  displayName: 'Bespoke — Internal Order Alert',
  to: 'marek@woolet.co',
  previewData: {
    customerEmail: 'jane@example.com',
    customerName: 'Jane Doe',
    frameName: 'Aviator 155',
    frontCode: 'M-1023',
    templeCode: 'M-1041',
    finishName: 'Polished',
    lensName: 'Single vision — clear',
    engravingText: 'JD',
    amountFormatted: '$780.00 USD',
    orderRef: 'cs_live_a1B2c3',
    paymentIntentId: 'pi_3P...',
    environment: 'live',
    measurementsUrl: 'https://woolet.co/en/bespoke/measurements?sid=cs_live_a1B2c3',
    adminOrderUrl: 'https://dashboard.stripe.com/payments/pi_3P',
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
const h1: React.CSSProperties = { fontSize: 24, fontWeight: 500, lineHeight: 1.2, margin: '0 0 12px', color: INK }
const h3: React.CSSProperties = { fontSize: 14, fontWeight: 600, letterSpacing: '0.04em', margin: '20px 0 8px', color: INK }
const body: React.CSSProperties = { fontSize: 14, lineHeight: 1.55, color: '#333', margin: '0 0 12px' }
const card: React.CSSProperties = { background: PAPER, borderRadius: 6, padding: '18px 20px', margin: '16px 0 20px' }
const cardTitle: React.CSSProperties = { fontSize: 18, fontWeight: 500, color: INK, margin: '0 0 12px' }
const specRow: React.CSSProperties = { borderTop: '1px solid rgba(11,10,9,0.08)', padding: '6px 0' }
const specLabel: React.CSSProperties = { fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', margin: '0 0 2px' }
const specValue: React.CSSProperties = { fontSize: 13, color: INK, margin: 0, wordBreak: 'break-all' }
const link: React.CSSProperties = { color: INK, textDecoration: 'underline' }
const hr: React.CSSProperties = { borderColor: '#e6e6e6', margin: '24px 0' }
const footer: React.CSSProperties = { fontSize: 11, color: '#888', lineHeight: 1.5, margin: 0 }
