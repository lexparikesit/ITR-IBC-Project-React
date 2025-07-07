// src/app/dashboard/arrival-check/renault-trucks/page.js
'use client';

import { UnitArrivalChecklistForm } from '../../../../../components/forms/UnitArrivalChecklistForm';

export default function RenaultTrucksArrivalCheckPage() {
    return (
        <div>
            {/* Opsional: Judul atau teks tambahan untuk halaman ini */}
            {/* <h1 style={{ marginBottom: '20px' }}>Renault Trucks Arrival Check</h1> */}
            <UnitArrivalChecklistForm />
        </div>
    );
}