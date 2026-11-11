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

// One customer email for the deposit plan: "your 3D model is ready", the
// day-10 reminder and "balance received". The caller supplies the words, so
// the three messages share one layout and one button.

interface Row {
  label: string
  value: string
}

interface Props {
  subject?: string
  preview?: string
  heading?: string
  paragraphs?: string[]
  rows?: Row[]
  ctaLabel?: string
  ctaUrl?: string
  footnote?: string
}

const GOLD = '#C2A05A'
const INK = '#0B0A09'
const PAPER = '#EFE9DF'

const Email = ({
  preview = '',
  heading = 'Woolet Bespoke',
  paragraphs = [],
  rows = [],
  ctaLabel = '',
  ctaUrl = '',
  footnote = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview || heading}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandRow}>
          <Text style={brand}>WOOLET</Text>
          <Text style={brandSub}>Made-to-measure eyewear</Text>
        </Section>

        <Heading style={h1}>{heading}</Heading>
        {paragraphs.map((p, i) => (
          <Text key={i} style={body}>
            {p}
          </Text>
        ))}

        {rows.length > 0 ? (
          <Section style={card}>
            {rows.map((r) => (
              <Section key={r.label} style={specRow}>
                <Text style={specLabel}>{r.label}</Text>
                <Text style={specValue}>{r.value}</Text>
              </Section>
            ))}
          </Section>
        ) : null}

        {ctaLabel && ctaUrl ? (
          <Section style={ctaWrap}>
            <Link href={ctaUrl} style={cta}>
              {ctaLabel}
            </Link>
          </Section>
        ) : null}

        {footnote ? <Text style={smallBody}>{footnote}</Text> : null}

        <Hr style={hr} />
        <Text style={footer}>
          Questions? Reply to this email - support@woolet.co reads every message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => data?.subject ?? 'Your Woolet Bespoke order',
  displayName: 'Bespoke - 3D model / balance notice',
  previewData: {
    subject: 'Your Woolet Bespoke 3D model is ready',
    preview: 'Approve your 3D model or ask for a correction.',
    heading: 'Your 3D model is ready, Marek.',
    paragraphs: [
      'We sent the video and the drawing of your frame in a separate email from support@woolet.co.',
      'Approve the model by paying the balance, or ask us to correct it. You have until November 25, 2026.',
    ],
    rows: [
      { label: 'Order', value: 'WLT-BSP-2026-0012' },
      { label: 'Deposit paid', value: '$49' },
      { label: 'Balance due on approval', value: '$431' },
    ],
    ctaLabel: 'Review my 3D model',
    ctaUrl: 'https://woolet.co/en/bespoke/model?sid=cs_live_a1B2c3',
    footnote: 'The deposit is non-refundable. You are free to stop here - nothing more is charged unless you approve.',
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
const brandRow: React.CSSProperties = { marginBottom: 32 }
const brand: React.CSSProperties = { fontSize: 14, letterSpacing: '0.32em', fontWeight: 600, color: INK, margin: 0 }
const brandSub: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.14em',
  color: '#666',
  margin: '4px 0 0',
  textTransform: 'uppercase',
}
const h1: React.CSSProperties = { fontSize: 28, fontWeight: 400, lineHeight: 1.15, margin: '0 0 16px', color: INK }
const body: React.CSSProperties = { fontSize: 15, lineHeight: 1.6, color: '#333', margin: '0 0 12px' }
const smallBody: React.CSSProperties = { fontSize: 13, lineHeight: 1.55, color: '#666', margin: '8px 0 0' }
const card: React.CSSProperties = {
  background: PAPER,
  border: `1px solid ${GOLD}`,
  borderRadius: 6,
  padding: '12px 22px',
  margin: '20px 0 24px',
}
const specRow: React.CSSProperties = { padding: '8px 0' }
const specLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#666',
  margin: '0 0 2px',
}
const specValue: React.CSSProperties = { fontSize: 14, color: INK, margin: 0 }
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
const hr: React.CSSProperties = { borderColor: '#e6e6e6', margin: '28px 0' }
const footer: React.CSSProperties = { fontSize: 12, color: '#888', lineHeight: 1.55, margin: '0 0 8px' }
