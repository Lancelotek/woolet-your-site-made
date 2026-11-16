import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

// A personal note from Marek: what is still missing before the workshop can
// start the 3D model. Sent as "Marek from Woolet <marek@woolet.co>". One
// button (the first ask); every other link is a text link.

interface Ask {
  title: string
  body: string
  linkLabel?: string
  linkUrl?: string
}

interface Props {
  subject?: string
  preview?: string
  firstName?: string
  intro?: string[]
  asks?: Ask[]
  outro?: string
  orderRef?: string
}

const INK = '#0B0A09'

const Email = ({ preview = '', firstName = '', intro = [], asks = [], outro = '', orderRef = '' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={body}>Hi{firstName ? ` ${firstName}` : ''},</Text>
        {intro.map((p, i) => (
          <Text key={i} style={body}>
            {p}
          </Text>
        ))}

        {asks.map((a, i) => (
          <Section key={a.title} style={askBox}>
            <Text style={askTitle}>
              {asks.length > 1 ? `${i + 1}. ` : ''}
              {a.title}
            </Text>
            <Text style={body}>{a.body}</Text>
            {a.linkLabel && a.linkUrl ? (
              i === 0 ? (
                <Section style={ctaWrap}>
                  <Link href={a.linkUrl} style={cta}>
                    {a.linkLabel}
                  </Link>
                </Section>
              ) : (
                <Text style={body}>
                  <Link href={a.linkUrl} style={textLink}>
                    {a.linkLabel}
                  </Link>
                </Text>
              )
            ) : null}
          </Section>
        ))}

        {outro ? <Text style={body}>{outro}</Text> : null}
        <Text style={body}>Marek</Text>
        <Text style={signature}>
          Marek Ciesla
          <br />
          Founder, Woolet
          <br />
          +48 501 390 551
          {orderRef ? (
            <>
              <br />
              Order {orderRef}
            </>
          ) : null}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => data?.subject ?? 'Your Woolet Bespoke order',
  displayName: 'Bespoke - missing fitting items (from Marek)',
  previewData: {
    subject: 'Your Woolet Bespoke Crown Panto - 3 things before the 3D model (WLT-BSP-2026-0010)',
    preview: 'Three things before the workshop starts your 3D model.',
    firstName: 'Brian',
    intro: ['Your card photo came through. Thanks.', 'The workshop in Greece builds your 3D model next. I need three things from you first:'],
    asks: [
      { title: 'Face scan', body: '60 seconds with your phone camera.', linkLabel: 'Start the scan', linkUrl: 'https://woolet.co/en/fit' },
      { title: 'Side photo with the card', body: 'Turn 90 degrees to the camera.', linkLabel: 'Upload the side photo', linkUrl: 'https://woolet.co/en/bespoke/photo?sid=cs_live_a1B2c3' },
      { title: 'The numbers inside your current glasses', body: 'They look like 54-18 145.', linkLabel: 'Open my fitting form', linkUrl: 'https://woolet.co/en/bespoke/measurements?sid=cs_live_a1B2c3' },
    ],
    outro: 'Nothing is cut before you approve the 3D model.',
    orderRef: 'WLT-BSP-2026-0010',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  color: INK,
  margin: 0,
  padding: 0,
}
const container: React.CSSProperties = { maxWidth: 560, margin: '0 auto', padding: '28px 24px 40px' }
const body: React.CSSProperties = { fontSize: 15, lineHeight: 1.6, color: '#222', margin: '0 0 12px' }
const askBox: React.CSSProperties = { margin: '18px 0 6px' }
const askTitle: React.CSSProperties = { fontSize: 15, lineHeight: 1.5, fontWeight: 700, color: INK, margin: '0 0 4px' }
const ctaWrap: React.CSSProperties = { margin: '6px 0 14px' }
const cta: React.CSSProperties = {
  display: 'inline-block',
  background: INK,
  color: '#fff',
  padding: '13px 22px',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  borderRadius: 4,
}
const textLink: React.CSSProperties = { color: INK, textDecoration: 'underline' }
const signature: React.CSSProperties = { fontSize: 13, lineHeight: 1.6, color: '#666', margin: '16px 0 0' }
