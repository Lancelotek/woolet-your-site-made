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

// The email to the workshop (Warren) for one Bespoke order: specification,
// the production brief link, the file-format rule and the per-order upload
// link. Content is built by workshopBrief() in ../bespoke-workshop.ts.

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
  formatRule?: string
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
  formatRule = '',
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

        {formatRule ? (
          <Section style={warn}>
            <Text style={warnLabel}>File formats</Text>
            <Text style={warnText}>{formatRule}</Text>
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
          Reply to this email with any question - it comes straight to Marek.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => data?.subject ?? 'Woolet Bespoke - specification and upload link',
  displayName: 'Bespoke - brief + upload link for the workshop',
  previewData: {
    subject: 'WLT-BSP-2026-0010 - Woolet Bespoke specification and upload link',
    preview: 'Specification and upload link for WLT-BSP-2026-0010',
    heading: 'Order WLT-BSP-2026-0010',
    paragraphs: [
      'Dear Konstantina,',
      'Below is the specification for order WLT-BSP-2026-0010. Please upload the 3D model video, the drawing, the CAD files and any photos for this order through the link at the bottom.',
    ],
    rows: [
      { label: 'Order', value: 'WLT-BSP-2026-0010' },
      { label: 'Frame', value: 'Crown Panto' },
      { label: 'Front acetate (6 mm)', value: 'Classic Honey & Dark Havana (P605 0527)' },
    ],
    formatRule: 'Please send every file in a standard format: videos as MP4 (H.264), photos as JPG or PNG, drawings as PDF. No HEIC photos and no .MOV / HEVC videos.',
    ctaLabel: 'Upload files for WLT-BSP-2026-0010',
    ctaUrl: 'https://woolet.co/en/bespoke/workshop?t=example',
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
const warn: React.CSSProperties = {
  border: '1px solid #d9b26a',
  background: '#fff8e8',
  borderRadius: 6,
  padding: '10px 18px',
  margin: '0 0 20px',
}
const warnLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#8a6a2a',
  margin: '0 0 4px',
  fontWeight: 600,
}
const warnText: React.CSSProperties = { fontSize: 14, lineHeight: 1.55, color: INK, margin: 0 }
const hr: React.CSSProperties = { borderColor: '#e6e6e6', margin: '28px 0' }
const footer: React.CSSProperties = { fontSize: 12, color: '#888', lineHeight: 1.55, margin: '0 0 8px' }
