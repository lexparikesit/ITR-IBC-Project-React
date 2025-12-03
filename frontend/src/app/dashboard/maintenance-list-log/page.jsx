import LogData from '@/components/log/StorageMaintenanceLogData';

export default function MaintenanceLogPage() {
    return <LogData title="Storage Maintenance Log" apiUrl="/storage-maintenance/log/all" />;
}
