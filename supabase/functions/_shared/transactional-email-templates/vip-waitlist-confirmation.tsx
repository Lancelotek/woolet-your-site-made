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
  reserveUrl?: string
}

const GOLD = '#CAA449'
const INK = '#0f0f0f'
const PAPER = '#f0ece4'

const Email = ({
  reserveUrl = 'https://woolet.co/en/lp/kickstarter',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're on the Woolet early-access list — here's what happens next.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandRow}>
          <Text style={brand}>WOOLET</Text>
          <Text style={brandSub}>Eyewear for wide faces</Text>
        </Section>

        <Heading style={h1}>You're on the early-access list</Heading>

        <Text style={body}>
          Thanks for signing up. We'll email you the moment our Kickstarter campaign
          goes live, before it opens to the public.
        </Text>

        <Section style={card}>
          <Text style={badge}>NEXT STEP — OPTIONAL</Text>
          <Text style={cardTitle}>Lock your 40% OFF for $1</Text>
          <Text style={body}>
            A $1 reservation holds the founding-member price — $114 instead of $190,
            with free shipping. The $1 is deducted from your pledge.
          </Text>
          <Section style={ctaWrap}>
            <Link href={reserveUrl} style={cta}>
              Reserve 40% OFF →
            </Link>
          </Section>
        </Section>

        <Hr style={hr} />

        <Heading as="h3" style={h3}>Why Woolet</Heading>
        <Text style={body}>
          158 mm signature front, keyhole bridge and a 145–162 mm bespoke range —
          built for faces that standard eyewear pinches. Hand made in EU from
          Italian Mazzucchelli acetate.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          You're getting this email because you asked for early access at woolet.co.
        </Text>
        <Text style={footer}>Woolet · Eyewear engineered for 155 mm+ faces.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: "You're on the Woolet early-access list",
  displayName: 'VIP — Early access confirmation',
  previewData: {
    reserveUrl: 'https://woolet.co/en/lp/kickstarter',
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
const ctaWrap: React.CSSProperties = { margin: '18px 0 4px' }
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
const hr: React.CSSProperties = { borderColor: '#e6e1d8', margin: '28px 0' }
const footer: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.6,
  color: '#8a8a8a',
  margin: '0 0 6px',
}
