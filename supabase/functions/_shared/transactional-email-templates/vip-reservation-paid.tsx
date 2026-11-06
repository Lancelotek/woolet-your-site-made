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
  founderUrl?: string
  amountFormatted?: string
  orderRef?: string
}

const GOLD = '#CAA449'
const INK = '#0f0f0f'
const PAPER = '#f0ece4'

// Secret Kickstarter reward "VIP Founder Edition - 009 Black"; ref=5fn1u9 = KS custom tag "ML Founders 114".
const FOUNDER_URL =
  'https://www.kickstarter.com/projects/wooletco/woolet-finally-glasses-that-actually-fit-wider-faces?secret_reward_token=6d3cff02&ref=5fn1u9'

const Email = ({
  founderUrl = FOUNDER_URL,
  orderRef = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Not on the Kickstarter page. Already made, ships right after the campaign ends on December 4.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandRow}>
          <Text style={brand}>WOOLET</Text>
          <Text style={brandSub}>Eyewear for wide faces</Text>
        </Section>

        <Heading style={h1}>Your Founder Edition link</Heading>

        <Text style={body}>
          Your $1 unlocked a reward you won't find on the Kickstarter page. It opens only from the
          link below.
        </Text>

        <Section style={card}>
          <Text style={badge}>FOUNDER EDITION · HIDDEN REWARD</Text>
          <Text style={item}>
            <span style={tick}>✓</span> <strong>009 Black</strong>, 24 mm bridge: <strong>$114</strong> instead of $190 in the shop
          </Text>
          <Text style={item}>
            <span style={tick}>✓</span> The Founder Box ($45 value): magnetic box, special case and the Clip-On Cloth - in no other
            reward
          </Text>
          <Text style={item}>
            <span style={tick}>✓</span> Already made - ships right after the campaign ends on December 4
          </Text>
          <Section style={ctaWrap}>
            <Link href={founderUrl} style={cta}>
              Claim my Founder frame - $114
            </Link>
          </Section>
          <Text style={smallCard}>19 of 30 left. Free shipping, 5-year warranty.</Text>
        </Section>

        <Text style={body}>
          Not sure 158 mm fits? Check your width in 60 seconds at{' '}
          <Link href="https://woolet.co/en/fit" style={textLink}>woolet.co/en/fit</Link>. Questions:{' '}
          <Link href="mailto:support@woolet.co" style={textLink}>support@woolet.co</Link>.
        </Text>

        <Hr style={hr} />

        {orderRef ? <Text style={small}>Reference: {orderRef}</Text> : null}

        <Hr style={hr} />

        <Text style={footer}>
          You're getting this email because you reserved the Founder Edition at woolet.co.
        </Text>
        <Text style={footer}>Woolet · Eyewear engineered for 155 mm+ faces.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your hidden Founder Edition link - 009 Black, $114',
  displayName: 'VIP — Reservation paid (Founder Edition link)',
  previewData: {
    founderUrl: FOUNDER_URL,
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
const item: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.5,
  color: '#333',
  margin: '0 0 8px',
  paddingLeft: 18,
  textIndent: -18,
}
const tick: React.CSSProperties = { color: GOLD, fontWeight: 700 }
const smallCard: React.CSSProperties = { fontSize: 13, lineHeight: 1.5, color: '#6b6357', margin: '6px 0 0' }
const textLink: React.CSSProperties = { color: INK, textDecoration: 'underline' }
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
