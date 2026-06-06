export const BENEFICIARY_STATUSES = [
  { value: 'active', label: 'Currently Enrolled', badge: 'enrolled', description: 'Actively receiving program services' },
  { value: 'follow-up', label: 'Requires Follow-up', badge: 'followup', description: 'Needs check-in or additional support' },
  { value: 'inactive', label: 'Program Completed', badge: 'completed', description: 'Graduated or no longer in active program' },
];

export function getBeneficiaryStatusLabel(status) {
  return BENEFICIARY_STATUSES.find((s) => s.value === status)?.label || status;
}

export function getBeneficiaryStatusBadge(status) {
  return BENEFICIARY_STATUSES.find((s) => s.value === status)?.badge || status;
}
