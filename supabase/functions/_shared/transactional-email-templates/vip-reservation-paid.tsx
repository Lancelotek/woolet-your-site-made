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
  vipUrl?: string
  amountFormatted?: string
  orderRef?: string
}

const GOLD = '#CAA449'
const INK = '#0f0f0f'
const PAPER = '#f0ece4'

const Email = ({
  vipUrl = 'https://woolet.co/en/lp/kickstarter/vip-confirmed?paid=1',
  amountFormatted = '$1.00',
  orderRef = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your 40% OFF founding-member price is reserved.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandRow}>
          <Text style={brand}>WOOLET</Text>
          <Text style={brandSub}>Eyewear for wide faces</Text>
        </Section>

        <Heading style={h1}>Your 40% OFF is reserved</Heading>

        <Text style={body}>
          Payment received. Your founding-member price is locked: <strong>$114</strong>{' '}
          instead of $190, with free shipping. The {amountFormatted} you paid is deducted
          from your pledge on launch day.
        </Text>

        <Section style={card}>
          <Text style={badge}>FOUNDING MEMBER</Text>
          <Text style={cardTitle}>Your VIP page</Text>
          <Text style={body}>
            Keep this link — it holds your reservation details and your referral link.
          </Text>
          <Section style={ctaWrap}>
            <Link href={vipUrl} style={cta}>
              Open my VIP page →
            </Link>
          </Section>
          <Text style={small}>{vipUrl}</Text>
        </Section>

        <Hr style={hr} />

        <Heading as="h3" style={h3}>What happens next</Heading>
        <Text style={body}>
          1. We email you the minute the Kickstarter campaign opens — you get first access.
        </Text>
        <Text style={body}>
          2. You pledge at $114 and pick 007 (round) or 009 (square), both 158 mm.
        </Text>
        <Text style={body}>
          3. Need a wider or narrower front? Bespoke covers 145–162 mm.
        </Text>

        {orderRef ? <Text style={small}>Reference: {orderRef}</Text> : null}

        <Hr style={hr} />

        <Text style={footer}>
          You're getting this email because you reserved a founding-member spot at woolet.co.
        </Text>
        <Text style={footer}>Woolet · Eyewear engineered for 155 mm+ faces.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your 40% OFF is reserved — here is your VIP link',
  displayName: 'VIP — Reservation paid',
  previewData: {
    vipUrl: 'https://woolet.co/en/lp/kickstarter/vip-confirmed?paid=1',
    amountFormatted: '$1.00',
    orderRef: 'cs_test_123',
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
  margin: '0 0 20px',
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
const card: React.CSSProperties = {
  background: PAPER,
  border: `1px solid ${GOLD}`,
  borderRadius: 6,
  padding: '20px 22px',
  margin: '20px 0 24px',
}
const cardTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 500,
  color: INK,
  margin: '0 0 8px',
}
const badge: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.22em',
  fontWeight: 600,
  color: GOLD,
  margin: '0 0 10px',
}
const ctaWrap: React.CSSProperties = { margin: '18px 0 8px' }
const cta: React.CSSProperties = {
  display: 'inline-block',
  background: GOLD,
  color: '#0B0A09',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textDecoration: 'none',
  padding: '13px 22px',
  borderRadius: 2,
}
const small: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: '#8a8a8a',
  margin: '0 0 4px',
  wordBreak: 'break-all',
}
const hr: React.CSSProperties = { borderColor: '#e6e1d8', margin: '28px 0' }
const footer: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.6,
  color: '#8a8a8a',
  margin: '0 0 6px',
}
