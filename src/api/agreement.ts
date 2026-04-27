import { http } from '@/http/http'

export type AgreementType = 0 | 1 | 2

export interface AgreementItem {
  id: string
  type: AgreementType
  title: string
  content: string
  contentFormat: string
  createdAt: string
  updatedAt: string
}

export function getAgreementByType(type: AgreementType) {
  return http.get<{ data: AgreementItem }>(`/agreements/type/${type}`, undefined, undefined, { hideErrorToast: true }).then(res => res.data)
}
