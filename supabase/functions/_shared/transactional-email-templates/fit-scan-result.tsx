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
  faceWidthMm?: number
  noseWidthMm?: number
  recommendationTitle?: string
  recommendationBody?: string
  recommendedModel?: string
  modelUrl?: string
  badgeLabel?: string
}

const GOLD = '#CAA449'
const INK = '#0f0f0f'
const PAPER = '#f0ece4'

const Email = ({
  faceWidthMm = 158,
  noseWidthMm = 40,
  recommendationTitle = 'Your fit recommendation',
  recommendationBody = '',
  recommendedModel = 'Woolet 007',
  modelUrl = 'https://woolet.co/en/products/007',
  badgeLabel = 'YOUR FIT',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Your face width is {faceWidthMm}mm — here's your recommended Woolet fit.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandRow}>
          <Text style={brand}>WOOLET</Text>
          <Text style={brandSub}>Eyewear for wide faces</Text>
        </Section>

        <Heading style={h1}>Your measurements</Heading>

        <Section style={card}>
          <Text style={badge}>{badgeLabel}</Text>
          <Section style={metricsRow}>
            <Section style={metricCell}>
              <Text style={metricValue}>{faceWidthMm}<span style={metricUnit}> mm</span></Text>
              <Text style={metricLabel}>Face width (temple to temple)</Text>
            </Section>
            <Section style={metricCell}>
              <Text style={metricValue}>{noseWidthMm}<span style={metricUnit}> mm</span></Text>
              <Text style={metricLabel}>Nose / bridge width</Text>
            </Section>
          </Section>
        </Section>

        <Heading as="h2" style={h2}>{recommendationTitle}</Heading>
        {recommendationBody && <Text style={body}>{recommendationBody}</Text>}

        <Section style={ctaWrap}>
          <Link href={modelUrl} style={cta}>
            See {recommendedModel} →
          </Link>
        </Section>

        <Hr style={hr} />

        <Heading as="h3" style={h3}>How to use these numbers</Heading>
        <Text style={body}>
          <strong>Frame width</strong> should be within ±3 mm of your face width
          ({faceWidthMm} mm). Anything narrower will pinch your temples; wider
          will slide down your nose.
        </Text>
        <Text style={body}>
          <strong>Bridge width</strong> should be close to your nose width
          ({noseWidthMm} mm). A keyhole bridge (like Woolet's 21 mm) distributes
          weight without leaving pressure marks.
        </Text>
        <Text style={body}>
          When shopping elsewhere, look at the spec sheet for "lens width × bridge ×
          temple". Add lens width × 2 + bridge to estimate total frame width.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          You're getting this email because you completed a Fit Scan at woolet.co.
          We'll use your measurements to recommend better-fitting frames as our
          collection grows.
        </Text>
        <Text style={footer}>
          Woolet · Italian acetate eyewear engineered for 155 mm+ faces.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your fit: ${data.faceWidthMm ?? '—'}mm face · ${data.recommendedModel ?? 'Woolet'} recommended`,
  displayName: 'Fit Scan Result',
  previewData: {
    faceWidthMm: 162,
    noseWidthMm: 42,
    recommendationTitle: 'You need wider frames AND a wider bridge',
    recommendationBody:
      "At 162mm face width and 42mm nose width, you're exactly who we built Woolet for.",
    recommendedModel: 'Woolet 007',
    modelUrl: 'https://woolet.co/en/products/007',
    badgeLabel: 'PERFECT WOOLET CANDIDATE',
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
const card: React.CSSProperties = {
  background: PAPER,
  border: `1px solid ${GOLD}`,
  borderRadius: 6,
  padding: '20px 22px',
  margin: '0 0 24px',
}
const badge: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.22em',
  fontWeight: 600,
  color: GOLD,
  margin: '0 0 12px',
}
const metricsRow: React.CSSProperties = { display: 'block' }
const metricCell: React.CSSProperties = {
  display: 'inline-block',
  width: '49%',
  verticalAlign: 'top',
}
const metricValue: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 500,
  color: INK,
  margin: '0 0 4px',
  lineHeight: 1,
}
const metricUnit: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 400,
  color: '#666',
}
const metricLabel: React.CSSProperties = {
  fontSize: 12,
  color: '#666',
  margin: 0,
  lineHeight: 1.4,
}
const ctaWrap: React.CSSProperties = { margin: '20px 0 8px' }
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
