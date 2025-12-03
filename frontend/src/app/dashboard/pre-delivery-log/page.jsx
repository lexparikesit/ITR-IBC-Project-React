import LogData from '@/components/log/PDILogData';

export default function PreDeliveryLogPage() {
    return <LogData title="Pre Delivery Inspection Log" apiUrl="/pre-delivery/log/all" />;
}
