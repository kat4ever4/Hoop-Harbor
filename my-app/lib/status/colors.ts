export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'identified':
      return 'bg-blue-500 text-white border-blue-600'
    case 'evaluating':
      return 'bg-yellow-500 text-white border-yellow-600'
    case 'priority':
      return 'bg-purple-500 text-white border-purple-600'
    case 'offered':
      return 'bg-emerald-500 text-white border-emerald-600'
    case 'committed to usna':
      return 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300'
    case 'committed elsewhere':
      return 'bg-slate-500 text-white border-slate-600'
    case 'not pursuing':
      return 'bg-red-500 text-white border-red-600'
    case 'to be confirmed':
    default:
      return 'bg-slate-300 text-slate-700 border-slate-400'
  }
}
