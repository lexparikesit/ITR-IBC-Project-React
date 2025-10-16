import LogData from '@/components/log/ArrivalLogData';

export default function ArrivalCheckLogPage() {
    return <LogData title="Arrival Check Log" apiUrl="http://localhost:5000/arrival-check/log/all" />;
}