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
  missing?: string[]
  shippingUrl?: string
}

// Sent once, 48 h after a paid Bespoke order still has no complete shipping
// address or phone. One button only.
const Email = ({ customerName, orderReference = '', missing = [], shippingUrl = '#' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We need your shipping details for order {orderReference}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Where do we ship your frames?</Heading>
        <Text style={text}>
          {customerName ? `${customerName},` : 'Hello,'} your Bespoke order <strong>{orderReference}</strong> is
          missing {missing.length ? missing.join(' and ') : 'shipping details'}. The courier will not take the
          parcel without a full address and a phone number for the recipient.
        </Text>
        <Section style={{ margin: '28px 0' }}>
          <Button href={shippingUrl} style={button}>
            Add shipping details
          </Button>
        </Section>
        <Text style={small}>
          It takes a minute. You can change the address until the frames leave the workshop.
        </Text>
        <Hr style={hr} />
        <Text style={small}>Marek, Woolet</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Shipping details needed for order ${data?.orderReference ?? ''}`.trim(),
  displayName: 'Bespoke - shipping details reminder',
  previewData: {
    customerName: 'John',
    orderReference: 'WLT-BSP-2026-0004',
    missing: ['a phone number'],
    shippingUrl: 'https://woolet.co/en/bespoke/shipping?ref=WLT-BSP-2026-0004&t=example',
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
