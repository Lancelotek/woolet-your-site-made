import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { hatToGlasses, STANDARD_FRAME_MAX_MM } from '../hat-to-glasses.ts'

interface Props { headCm?: number }

const GOLD = '#C2A05A'
const INK = '#0B0A09'
const PAPER = '#EFE9DF'
const KS_URL = 'https://woolet.co/en/lp/kickstarter?utm_source=woolet_site&utm_medium=email&utm_campaign=hat_size_card'
const FIT_URL = 'https://woolet.co/en/fit?utm_source=woolet_site&utm_medium=email&utm_campaign=hat_size_card'

const Email = ({ headCm = 61 }: Props) => {
  const r = hatToGlasses(headCm)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Hat ${r.row.us} US = glasses ~${r.templeMm} mm. Your size card.`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>WOOLET</Text>
          <Text style={brandSub}>Eyewear for wide faces</Text>

          <Heading style={h1}>Your size card</Heading>

          <Section style={card}>
            <Text style={label}>HAT SIZE</Text>
            <Text style={big}>{r.row.us} US · {r.row.uk} UK · {r.row.cm} EU · {Math.round(headCm)} cm</Text>
            <Text style={label}>ESTIMATED TEMPLE WIDTH</Text>
            <Text style={big}>~{r.templeMm} mm <span style={{ color: '#666', fontSize: 14 }}>(standard frames stop at ~{STANDARD_FRAME_MAX_MM} mm)</span></Text>
            <Text style={label}>VERDICT</Text>
            <Text style={verdict}>{r.verdict.title}</Text>
            <Text style={body}>{r.verdict.body}</Text>
          </Section>

          {r.band !== 'mainstream' && (
            <Text style={body}>Your hat is XL. Your frames aren't — that's why they leave marks.</Text>
          )}

          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Link href={KS_URL} style={cta}>See the 158 mm frames</Link>
          </Section>

          <Text style={small}>
            This is an estimate from head size and can be off by 4–5 mm. Measure your exact width in 20 seconds: <Link href={FIT_URL} style={{ color: INK, textDecoration: 'underline' }}>woolet.co/en/fit</Link>
          </Text>

          <Hr style={{ borderColor: '#e5e0d6', margin: '28px 0 16px' }} />
          <Text style={small}>You asked for this size card at woolet.co.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => {
    const r = hatToGlasses(Number(d.headCm) || 61)
    return `Your size card: hat ${r.row.us} = glasses ~${r.templeMm} mm`
  },
  displayName: 'Hat size card',
  previewData: { headCm: 61 },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Archivo, -apple-system, Helvetica, Arial, sans-serif', color: INK, margin: 0 }
const container: React.CSSProperties = { maxWidth: 560, margin: '0 auto', padding: '32px 24px 48px' }
const brand: React.CSSProperties = { fontSize: 14, letterSpacing: '0.32em', fontWeight: 600, margin: 0 }
const brandSub: React.CSSProperties = { fontSize: 12, letterSpacing: '0.14em', color: '#666', margin: '4px 0 28px', textTransform: 'uppercase' }
const h1: React.CSSProperties = { fontFamily: 'Newsreader, Georgia, serif', fontSize: 28, fontWeight: 400, margin: '0 0 20px' }
const card: React.CSSProperties = { background: PAPER, border: `1px solid ${GOLD}`, borderRadius: 2, padding: '18px 22px', margin: '0 0 20px' }
const label: React.CSSProperties = { fontSize: 11, letterSpacing: '0.22em', color: '#8a7443', fontWeight: 600, margin: '10px 0 2px' }
const big: React.CSSProperties = { fontSize: 18, margin: '0 0 6px', color: INK }
const verdict: React.CSSProperties = { fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: INK }
const body: React.CSSProperties = { fontSize: 15, lineHeight: 1.6, color: '#333', margin: '0 0 12px' }
const small: React.CSSProperties = { fontSize: 13, lineHeight: 1.6, color: '#666', margin: '0 0 8px' }
const cta: React.CSSProperties = { display: 'inline-block', background: GOLD, color: INK, padding: '14px 26px', borderRadius: 2, fontSize: 15, fontWeight: 600, textDecoration: 'none' }
