import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  caseNo?: string
  scanUrl?: string
  date?: string
  time?: string
  tz?: string
}

const Email = ({ caseNo = '', scanUrl = '#', date = '', time = '', tz = '' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Your scan link for {caseNo} — call on {date} at {time} {tz}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your scan link</Heading>

        <Text style={text}>
          You are booked for{' '}
          <strong>
            {date} at {time} {tz}
          </strong>
          . One thing before we talk: the scan.
        </Text>

        <Section style={{ margin: '28px 0' }}>
          <Button href={scanUrl} style={button}>
            Start your FitLens scan
          </Button>
        </Section>

        <Text style={text}>
          Your case number <strong>{caseNo}</strong> is already attached to this link. Complete the scan
          from this email and the measurement lands on your file by itself - nothing to copy, nothing to
          type.
        </Text>

        <Text style={text}>Three rules for a scan the workshop can build from:</Text>
        <Text style={listItem}>1. Glasses off, hair off your forehead.</Text>
        <Text style={listItem}>
          2. Hold a standard bank or ID card flat against your forehead, along your eyebrow line. The card
          is the ruler - without it there is no scale.
        </Text>
        <Text style={listItem}>3. Daylight, face straight to the camera, phone at eye level.</Text>

        <Text style={text}>
          Takes under two minutes. Do it before the call - we go through the numbers together.
        </Text>

        <Text style={text}>
          Opening the link on a different device or later? Your number is <span style={mono}>{caseNo}</span>.
          Enter it in the field above the scan.
        </Text>

        <Text style={small}>Woolet</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your scan link · ${data?.caseNo ?? ''} · call on ${data?.date ?? ''} at ${data?.time ?? ''} ${
      data?.tz ?? ''
    }`.replace(/\s+/g, ' ').trim(),
  displayName: 'Bespoke — scan link after booking',
  previewData: {
    caseNo: 'WLT-BSP-2026-0001',
    scanUrl: 'https://woolet.co/en/fit?bsp=WLT-BSP-2026-0001&t=example',
    date: 'Tuesday 22 September',
    time: '14:30',
    tz: 'Europe/Warsaw',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { color: '#0B0A09', fontSize: '26px', lineHeight: '1.2', margin: '0 0 18px' }
const text = { color: '#211f1c', fontSize: '15px', lineHeight: '1.65', margin: '0 0 14px' }
const listItem = { color: '#211f1c', fontSize: '15px', lineHeight: '1.65', margin: '0 0 8px', paddingLeft: '8px' }
const small = { color: '#6b655c', fontSize: '13px', lineHeight: '1.6', margin: '18px 0 0' }
const mono = { fontFamily: 'Menlo, Consolas, monospace', letterSpacing: '0.04em' }
const button = {
  backgroundColor: '#CAA449',
  color: '#1F1B16',
  fontFamily: 'Arial, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  padding: '13px 22px',
  borderRadius: '2px',
  textDecoration: 'none',
}
