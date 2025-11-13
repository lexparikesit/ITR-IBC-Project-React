import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
    console.log("Dashboard Rendered!");
    return (
        <div
            className="p-6"
            style={{
                backgroundColor: 'white',
                minHeight: '100vh',
                flexGrow: 1,
            }}
        >
            <DashboardOverview />
        </div>
    );
}