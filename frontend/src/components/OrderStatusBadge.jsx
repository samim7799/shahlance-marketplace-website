import { ORDER_STATUS } from '../services/orderService';

const STYLES = {
  [ORDER_STATUS.PENDING]:    'bg-amber-500/15   text-amber-300   border-amber-500/30',
  [ORDER_STATUS.PROCESSING]: 'bg-blue-500/15    text-blue-300    border-blue-500/30',
  [ORDER_STATUS.COMPLETED]:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  [ORDER_STATUS.CANCELLED]:  'bg-rose-500/15    text-rose-300    border-rose-500/30',
};

const LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

export default function OrderStatusBadge({ status }) {
  const cls = STYLES[status] || STYLES[ORDER_STATUS.PENDING];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
      data-testid={`order-status-${status}`}
    >
      {LABELS[status] || status}
    </span>
  );
}

export function PaymentBadge({ status }) {
  const map = {
    paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    refunded: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
        map[status] || map.pending
      }`}
      data-testid={`payment-status-${status}`}
    >
      {status}
    </span>
  );
}
