import * as React from 'npm:react@18.3.1'
import { template as fitScanResult } from './fit-scan-result.tsx'
import { template as bespokePurchaseCustomer } from './bespoke-purchase-customer.tsx'
import { template as bespokePurchaseAdmin } from './bespoke-purchase-admin.tsx'
import { template as bespokeMeasurementsAdmin } from './bespoke-measurements-admin.tsx'
import { template as bespokeMeasurementSummary } from './bespoke-measurement-summary.tsx'
import { template as bespokeMeasureInvite } from './bespoke-measure-invite.tsx'
import { template as bespokeScanInvite } from './bespoke-scan-invite.tsx'
import { template as bespokeSupportAlert } from './bespoke-support-alert.tsx'
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
  'bespoke-measurements-admin': bespokeMeasurementsAdmin,
  'bespoke-measurement-summary': bespokeMeasurementSummary,
  'bespoke-measure-invite': bespokeMeasureInvite,
  'bespoke-scan-invite': bespokeScanInvite,
  'bespoke-support-alert': bespokeSupportAlert,
  'vip-waitlist-confirmation': vipWaitlistConfirmation,
  'vip-reservation-paid': vipReservationPaid,
}

