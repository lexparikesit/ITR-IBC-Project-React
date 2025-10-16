import LogData from '@/components/log/PDILogData';

export default function PreDeliveryLogPage() {
    return <LogData title="Pre Delivery Log" apiUrl="http://localhost:5000/pre-delivery/log/all" />;
}