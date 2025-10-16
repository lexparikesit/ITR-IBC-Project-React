import LogData from '@/components/log/CommissioningLogData';

export default function CommisssioningLogPage() {
    return <LogData title="Commissioning Log" apiUrl="http://localhost:5000/commissioning/log/all" />;
}