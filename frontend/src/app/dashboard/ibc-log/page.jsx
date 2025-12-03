// app/ibc/page.jsx
import IBCLogData from '@/components/log/IBCLogData'; // Sesuaikan path jika berbeda

export default function IBCLogPage() {
    return (
        <IBCLogData
            title="Indotraktor Business Case Log"
            apiUrl="/ibc/log/all"
        />
    );
}
