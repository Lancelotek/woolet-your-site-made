import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  heading?: string
  lines?: string[]
}

// Operational alert for things a person has to look at — a booking that
// matched no case, a cancelled interview. Never sent to a customer.
const Email = ({ heading = 'Bespoke alert', lines = [] }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{heading}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{heading}</Heading>
        {lines.map((line, i) => (
          <Text key={i} style={text}>
            {line}
          </Text>
        ))}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `Woolet bespoke — ${data?.heading ?? 'alert'}`,
  displayName: 'Bespoke — support alert',
  to: 'support@woolet.co',
  previewData: {
    heading: 'Calendly booking without a case number',
    lines: ['https://api.calendly.com/scheduled_events/AAA/invitees/BBB', 'Event: invitee.created'],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { color: '#0B0A09', fontSize: '22px', lineHeight: '1.25', margin: '0 0 16px' }
const text = { color: '#211f1c', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px' }
