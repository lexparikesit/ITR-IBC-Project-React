// app/ibc/page.jsx
import IBCLogData from '@/components/log/IBCLogData'; // Sesuaikan path jika berbeda

export default function IBCLogPage() {
    return (
        <IBCLogData
            title="Indotraktor Business Case Log"
            apiUrl="http://localhost:5000/ibc/log/all"
        />
    );
}