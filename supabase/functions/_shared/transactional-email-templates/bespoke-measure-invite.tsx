import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  customerName?: string | null
  orderReference?: string
  invitationUrl?: string
  expiresAt?: string
}

const Email = ({ customerName, orderReference = '', invitationUrl = '#', expiresAt = '' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your private fitting link for order {orderReference}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your fitting link</Heading>
        <Text style={text}>
          {customerName ? `${customerName},` : 'Hello,'} before the workshop cuts your frame we need your
          measurements: one photo with a bank-size card held against your cheek, and the numbers printed
          inside your current glasses. It takes about two minutes.
        </Text>
        <Text style={text}>
          This link is yours alone and belongs to order <strong>{orderReference}</strong>. Please
          do not forward it.
        </Text>
        <Section style={{ margin: '28px 0' }}>
          <Button href={invitationUrl} style={button}>
            Open my fitting form
          </Button>
        </Section>
        <Text style={small}>
          Before anything is sent you will see what we store, who receives it and how long we keep it, and
          you will be asked to agree. Turn the card so no numbers show.
        </Text>
        <Hr style={hr} />
        <Text style={small}>
          If you did not place this order, ignore this message or write to us.
        </Text>
        <Text style={small}>Woolet</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Finish the fitting for order ${data?.orderReference ?? ''}`.trim(),
  displayName: 'Bespoke — measurement invitation',
  previewData: {
    customerName: 'Marek',
    orderReference: 'WLT-02345C42',
    invitationUrl: 'https://woolet.co/en/measure?invite=example',
    expiresAt: '2026-09-22',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { color: '#0B0A09', fontSize: '26px', lineHeight: '1.2', margin: '0 0 18px' }
const text = { color: '#211f1c', fontSize: '15px', lineHeight: '1.65', margin: '0 0 14px' }
const small = { color: '#6b655c', fontSize: '13px', lineHeight: '1.6', margin: '0 0 10px' }
const button = {
  backgroundColor: '#C2A05A',
  color: '#0B0A09',
  fontFamily: 'Arial, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  padding: '13px 22px',
  borderRadius: '2px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e7e0d6', margin: '24px 0' }
