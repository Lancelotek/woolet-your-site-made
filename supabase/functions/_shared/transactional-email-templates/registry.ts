import * as React from 'npm:react@18.3.1'
import { template as fitScanResult } from './fit-scan-result.tsx'
import { template as bespokePurchaseCustomer } from './bespoke-purchase-customer.tsx'
import { template as bespokePurchaseAdmin } from './bespoke-purchase-admin.tsx'
import { template as vipWaitlistConfirmation } from './vip-waitlist-confirmation.tsx'
import { template as vipReservationPaid } from './vip-reservation-paid.tsx'


export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string | ((data: Record<string, any>) => string)
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'fit-scan-result': fitScanResult,
  'bespoke-purchase-customer': bespokePurchaseCustomer,
  'bespoke-purchase-admin': bespokePurchaseAdmin,
}
