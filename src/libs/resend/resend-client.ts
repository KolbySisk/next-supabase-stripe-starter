import { Resend } from 'resend';

import { getEnvVar } from '@/utils/get-env-var';

export const resendClient = new Resend(getEnvVar(process.env.RESEND_API_KEY, 'RESEND_API_KEY'));
