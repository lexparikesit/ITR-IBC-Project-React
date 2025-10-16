import LogData from '@/components/log/StorageMaintenanceLogData';

export default function MaintenanceLogPage() {
    return <LogData title="Storage Maintenance Log" apiUrl="http://localhost:5000/storage-maintenance/log/all" />;
}