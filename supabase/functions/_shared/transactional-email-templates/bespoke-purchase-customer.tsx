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
  customerName?: string
  frameName?: string
  frontCode?: string
  templeCode?: string
  finishName?: string
  lensName?: string
  engravingText?: string
  amountFormatted?: string
  orderRef?: string
  measurementsUrl?: string
}

const GOLD = '#C2A05A'
const INK = '#0B0A09'
const PAPER = '#EFE9DF'

const Email = ({
  customerName = '',
  frameName = 'Woolet Bespoke',
  frontCode = '',
  templeCode = '',
  finishName = '',
  lensName = '',
  engravingText = '',
  amountFormatted = '',
  orderRef = '',
  measurementsUrl = 'https://woolet.co/en/bespoke/measurements',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Your Woolet Bespoke order is confirmed — one last step to finish the fit.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandRow}>
          <Text style={brand}>WOOLET</Text>
          <Text style={brandSub}>Made-to-measure eyewear</Text>
        </Section>

        <Heading style={h1}>Thank you{customerName ? `, ${customerName}` : ''}.</Heading>
        <Text style={body}>
          Your Bespoke order is confirmed. Below is the build we'll be cutting
          by hand in Italy — and one short step we need from you before the
          workshop begins.
        </Text>

        <Section style={card}>
          <Text style={badge}>YOUR BUILD</Text>
          <Text style={cardTitle}>{frameName}</Text>
          <SpecRow label="Front acetate" value={frontCode} />
          <SpecRow label="Temple acetate" value={templeCode} />
          <SpecRow label="Finish" value={finishName} />
          <SpecRow label="Lenses" value={lensName} />
          {engravingText ? <SpecRow label="Engraving" value={`"${engravingText}"`} /> : null}
          {amountFormatted ? <SpecRow label="Total paid" value={amountFormatted} /> : null}
          {orderRef ? <SpecRow label="Order ref" value={orderRef} /> : null}
        </Section>

        <Heading as="h2" style={h2}>Next step — send us your measurements</Heading>
        <Text style={body}>
          Bespoke is only Bespoke when it fits <em>you</em>. Open the secure form
          below and submit either your AI face-scan values, your manual
          measurements, or both — the workshop uses the tighter of the two.
        </Text>

        <Section style={ctaWrap}>
          <Link href={measurementsUrl} style={cta}>
            Submit my measurements →
          </Link>
        </Section>

        <Text style={smallBody}>
          Takes 2–3 minutes. You can save partial answers and come back to it.
        </Text>

        <Hr style={hr} />

        <Heading as="h3" style={h3}>What happens next</Heading>
        <Text style={body}>
          <strong>1.</strong> You submit measurements (AI + manual).<br />
          <strong>2.</strong> Our optician reviews your build and confirms the
          spec by email within 1 business day.<br />
          <strong>3.</strong> Cutting starts in Italy. Production takes ~3
          weeks; we ship worldwide, tracked and insured.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Questions or a change of heart on the build? Reply to this email —
          support@woolet.co reads every message.
        </Text>
        <Text style={footer}>
          Woolet · Italian acetate eyewear engineered for 155 mm+ faces.
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
    `Your Woolet Bespoke order is confirmed — one last step (${data.frameName ?? 'made-to-measure'})`,
  displayName: 'Bespoke — Customer Confirmation',
  previewData: {
    customerName: 'Marek',
    frameName: 'Aviator 155',
    frontCode: 'M-1023',
    templeCode: 'M-1041',
    finishName: 'Polished',
    lensName: 'Single vision — clear',
    engravingText: 'MK',
    amountFormatted: '$780.00 USD',
    orderRef: 'cs_live_a1B2c3',
    measurementsUrl: 'https://woolet.co/en/bespoke/measurements?sid=cs_live_a1B2c3',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  color: INK,
  margin: 0,
  padding: 0,
}
const container: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '32px 24px 48px',
}
const brandRow: React.CSSProperties = { marginBottom: 32 }
const brand: React.CSSProperties = {
  fontSize: 14,
  letterSpacing: '0.32em',
  fontWeight: 600,
  color: INK,
  margin: 0,
}
const brandSub: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.14em',
  color: '#666',
  margin: '4px 0 0',
  textTransform: 'uppercase',
}
const h1: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 400,
  lineHeight: 1.15,
  margin: '0 0 16px',
  color: INK,
}
const h2: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 500,
  margin: '28px 0 8px',
  color: INK,
}
const h3: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: '0.04em',
  margin: '24px 0 8px',
  color: INK,
}
const body: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: '#333',
  margin: '0 0 12px',
}
const smallBody: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.55,
  color: '#666',
  margin: '4px 0 0',
}
const card: React.CSSProperties = {
  background: PAPER,
  border: `1px solid ${GOLD}`,
  borderRadius: 6,
  padding: '20px 22px',
  margin: '20px 0 24px',
}
const cardTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 500,
  color: INK,
  margin: '0 0 12px',
}
const badge: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.22em',
  fontWeight: 600,
  color: GOLD,
  margin: '0 0 8px',
}
const specRow: React.CSSProperties = {
  borderTop: '1px solid rgba(11,10,9,0.08)',
  padding: '8px 0',
}
const specLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#666',
  margin: '0 0 2px',
}
const specValue: React.CSSProperties = {
  fontSize: 14,
  color: INK,
  margin: 0,
}
const ctaWrap: React.CSSProperties = { margin: '20px 0 4px' }
const cta: React.CSSProperties = {
  display: 'inline-block',
  background: INK,
  color: '#fff',
  padding: '14px 22px',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  borderRadius: 4,
}
const hr: React.CSSProperties = {
  borderColor: '#e6e6e6',
  margin: '28px 0',
}
const footer: React.CSSProperties = {
  fontSize: 12,
  color: '#888',
  lineHeight: 1.55,
  margin: '0 0 8px',
}
