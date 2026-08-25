import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES } from './registry.ts'
import {
  sendTemplateEmail,
  type SendTemplateEmailOptions,
  type SendTemplateEmailResult,
} from './send-email.ts'

// Sends a registered template through Lovable's managed email API and records
// the outcome in the app's email_send_log table (notification/history only —
// suppression and retries are enforced by Lovable server-side).
export async function sendTemplateEmailAndLog(
  templateName: string,
  to: string | undefined,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const template = TEMPLATES[templateName]
  const recipient = (template?.to as string | undefined) || to || ''

  const log = async (
    status: 'sent' | 'suppressed' | 'failed',
    errorMessage?: string,
  ) => {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      const { error } = await supabase.from('email_send_log').insert({
        message_id: null,
        template_name: templateName,
        recipient_email: recipient,
        status,
        ...(errorMessage ? { error_message: errorMessage.slice(0, 1000) } : {}),
      })
      if (error) {
        console.error('[email] failed to write email_send_log', {
          code: error.code,
          message: error.message,
        })
      }
    } catch (e) {
      console.error('[email] failed to write email_send_log', e)
    }
  }

  try {
    const result = await sendTemplateEmail(templateName, recipient, options)
    await log(result.sent ? 'sent' : 'suppressed')
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await log('failed', message)
    throw error
  }
}
