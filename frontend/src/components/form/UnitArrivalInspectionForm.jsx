"use client";

import React, { useState, useEffect } from "react";
import {
    TextInput,
    Textarea, // Tetap diimpor jika Anda memiliki textarea catatan umum di bagian bawah form
    Button,
    Stack,
    Text,
    Grid,
    Group,
    Radio,
    Card, // Menggunakan Card untuk konsistensi desain
    Title,
    Divider,
    Box, // Menambahkan Box sebagai pembungkus terluar
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { TimeInput } from "@mantine/dates";
import { IconClock } from "@tabler/icons-react";

// Pastikan file ini ada di direktori yang sama atau sesuaikan path-nya
import ChecklistRadioItem from "./ChecklistRadioItem";

const UnitArrivalInspectionForm = () => {
    const [unitInfo, setUnitInfo] = useState({
        model: "",
        serialNo: "",
        hourMeter: "",
        dateOfCheck: null,
        timeOfCheck: "",
        technician: "John Doe", // Data dummy, akan diperbarui nanti menggunakan First/LastName
        signature: "",
    });

    // Mengubah struktur checklistItems: HANYA status, tanpa remarks
    const [checklistItems, setChecklistItems] = useState({
        engine: {
            airFilter: "", // Hanya status
            fuelFilter: "",
            fuelPipeFilters: "",
            injectionCarburationSystem: "",
            radiatorCoolingSystems: "",
            belts: "",
            hosesEngine: "",
        },
        transmission: {
            reversingSystem: "",
            gearOilLeaks: "",
            directionDisconnectPedal: "",
            clutch: "",
        },
        hydraulicHydrostaticCircuits: {
            oilTank: "",
            pumpsCoupling: "",
            tightnessOfUnions: "",
            fillingLevel: "",
            hosesHydraulic: "",
            accessoryParts: "",
            telescopeRams: "",
            tiltLiftRams: "",
            steeringControlValves: "",
            controlValves: "",
        },
        brakingCircuits: {
            serviceBrakeParkingBrakeOperation: "",
            brakeFluidLevel: "",
        },
        lubrication: {
            lubrication: "",
        },
        boomMastManiscopicManicess: {
            boomTelescopes: "",
            wearPads: "",
            linkage: "",
            forks: "",
        },
        mastUnitCheckboxes: {
            fixedMovableMast: "",
            carriage: "",
            sideShifter: "",
            rollers: "",
            forksMastUnit: "",
        },
        accessoriesCheckboxes: {
            adaptationToMachine: "",
            hydraulicConnections: "",
        },
        cabProtectiveDeviceElectricCircuit: {
            seat: "",
            controlPanelRadio: "",
            hornWarningLightSafetyDevice: "",
            heatingAirConditioning: "",
            windscreenWiperWasher: "",
            horns: "",
            blockingAlarm: "",
            lighting: "",
            additionalLighting: "",
            rotatingBeacon: "",
            battery: "",
        },
        wheels: {
            rims: "",
            tiresPressure: "",
        },
        // Item tunggal di luar objek, hanya status
        screwsNuts: "",
        frameBody: "",
        namePlate: "",
        operatorsManual: "",
        instructionsForCustomer: "",
    });

    const [generalRemarks, setGeneralRemarks] = useState(""); // Catatan umum tetap ada jika diperlukan

    const handleUnitInfoChange = (e) => {
        const { name, value } = e.target;
        setUnitInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (value) => {
        setUnitInfo((prev) => ({ ...prev, dateOfCheck: value }));
    };

    const handleTimeChange = (value) => {
        setUnitInfo((prev) => ({ ...prev, timeOfCheck: value }));
    };

    // Handler untuk status radio (Good/Missing/Bad) - disederhanakan
    const handleChecklistItemStatusChange = (section, itemKey, value) => {
        setChecklistItems((prev) => {
            // Cek apakah section adalah objek bersarang atau item tunggal
            if (typeof prev[section] === 'object' && prev[section] !== null && prev[section].hasOwnProperty(itemKey)) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [itemKey]: value, // Langsung update status
                    },
                };
            } else {
                // Untuk item tunggal yang langsung di root checklistItems
                return {
                    ...prev,
                    [itemKey]: value, // Langsung update status
                };
            }
        });
    };

    // Handler untuk remarks (DIHAPUS KARENA TIDAK DIGUNAKAN)
    // const handleChecklistItemRemarksChange = (section, itemKey, value) => { ... };

    // Efek dummy untuk mendapatkan teknisi (nanti dari API)
    useEffect(() => {
        // const fetchTechnician = async () => {
        //     const response = await fetch('/api/get-current-user-lastname');
        //     const data = await response.json();

        //     if (data && data.lastName) {
        //         setUnitInfo(prev => ({ ...prev, technician: data.lastName }));
        //     }
        // };
        // fetchTechnician();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Informasi Unit: ", unitInfo);
        console.log("Item Checklist: ", checklistItems);
        console.log("Catatan Umum: ", generalRemarks);
        
        alert("Form Terkirim! Periksa Konsol untuk Data");
        // Di sini Anda akan mengirim data ini ke backend Anda
    };

    // Helper untuk render bagian checklist - disederhanakan
    const renderChecklistSection = (sectionTitle, sectionKey, items) => {
        return (
            <Card shadow="sm" p="xl" withBorder mb="lg">
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}>{sectionTitle}</Title>
                <Grid gutter="xl">
                    {items.map((item, index) => (
                        <ChecklistRadioItem
                            key={index} // Gunakan index sebagai key jika tidak ada id unik yang stabil
                            label={<Text style={{ color: '#000000 !important' }}>{`${item.id}. ${item.label}`}</Text>}
                            section={sectionKey}
                            itemKey={item.itemKey} // Menggunakan itemKey yang sudah ada di struktur state
                            currentStatus={checklistItems[sectionKey][item.itemKey] || ""} // Hanya status
                            onStatusChange={handleChecklistItemStatusChange}
                            span={{ base: 12, sm: 6 }}
                        />
                    ))}
                </Grid>
            </Card>
        );
    };

    // Data item untuk setiap bagian, disesuaikan dengan kebutuhan
    const engineItems = [
        { id: '01', label: 'Filter Udara', itemKey: 'airFilter' },
        { id: '02', label: 'Filter Bahan Bakar', itemKey: 'fuelFilter' },
        { id: '03', label: 'Pipa Bahan Bakar/Filter Bahan Bakar', itemKey: 'fuelPipeFilters' },
        { id: '04', label: 'Sistem Injeksi/Karburasi', itemKey: 'injectionCarburationSystem' },
        { id: '05', label: 'Radiator dan Sistem Pendingin', itemKey: 'radiatorCoolingSystems' },
        { id: '06', label: 'Sabuk', itemKey: 'belts' },
        { id: '07', label: 'Selang', itemKey: 'hosesEngine' },
    ];

    const transmissionItems = [
        { id: '01', label: 'Sistem Pembalik', itemKey: 'reversingSystem' },
        { id: '02', label: 'Kebocoran Oli Gear', itemKey: 'gearOilLeaks' },
        { id: '03', label: 'Pedal Arah dan Pemutus', itemKey: 'directionDisconnectPedal' },
        { id: '04', label: 'Kopling', itemKey: 'clutch' },
    ];

    const hydraulicHydrostaticCircuitsItems = [
        { id: '01', label: 'Tangki Oli', itemKey: 'oilTank' },
        { id: '02', label: 'Pompa dan Kopling', itemKey: 'pumpsCoupling' },
        { id: '03', label: 'Kekencangan Sambungan', itemKey: 'tightnessOfUnions' },
        { id: '04', label: 'Tingkat Pengisian', itemKey: 'fillingLevel' },
        { id: '05', label: 'Selang (misalnya)', itemKey: 'hosesHydraulic' },
        { id: '06', label: 'Bagian Aksesori', itemKey: 'accessoryParts' },
        { id: '07', label: 'Ram Teleskop', itemKey: 'telescopeRams' },
        { id: '08', label: 'Ram Miring/Angkat', itemKey: 'tiltLiftRams' },
        { id: '09', label: 'Katup Kontrol Kemudi', itemKey: 'steeringControlValves' },
        { id: '10', label: 'Katup Kontrol', itemKey: 'controlValves' },
    ];

    const brakingCircuitsItems = [
        { id: '01', label: 'Pengecekan Operasi Rem Servis dan Rem Parkir', itemKey: 'serviceBrakeParkingBrakeOperation' },
        { id: '02', label: 'Pengecekan Level Minyak Rem (sesuai perakitan)', itemKey: 'brakeFluidLevel' },
    ];

    const lubricationItems = [
        { id: '01', label: 'Pelumasan', itemKey: 'lubrication' },
    ];

    const boomMastManiscopicManicessItems = [
        { id: '01', label: 'Boom dan Teleskop', itemKey: 'boomTelescopes' },
        { id: '02', label: 'Bantalan Aus', itemKey: 'wearPads' },
        { id: '03', label: 'Sambungan', itemKey: 'linkage' },
        { id: '04', label: 'Garpu', itemKey: 'forks' },
    ];

    const mastUnitItems = [
        { id: '01', label: 'Mast Tetap dan Bergerak', itemKey: 'fixedMovableMast' },
        { id: '02', label: 'Kereta', itemKey: 'carriage' },
        { id: '03', label: 'Penggeser Samping', itemKey: 'sideShifter' },
        { id: '04', label: 'Roller', itemKey: 'rollers' },
        { id: '05', label: 'Garpu', itemKey: 'forksMastUnit' },
    ];

    const accessoriesItems = [
        { id: '01', label: 'Adaptasi ke Mesin', itemKey: 'adaptationToMachine' },
        { id: '02', label: 'Koneksi Hidrolik', itemKey: 'hydraulicConnections' },
    ];

    const cabProtectiveDeviceElectricCircuitItems = [
        { id: '01', label: 'Kursi', itemKey: 'seat' },
        { id: '02', label: 'Panel Kontrol dan Radio', itemKey: 'controlPanelRadio' },
        { id: '03', label: 'Klakson dan Lampu Peringatan, Perangkat Keselamatan', itemKey: 'hornWarningLightSafetyDevice' },
        { id: '04', label: 'Pemanas, Pendingin Udara', itemKey: 'heatingAirConditioning' },
        { id: '05', label: 'Wiper Kaca Depan / Pencuci Kaca Depan', itemKey: 'windscreenWiperWasher' },
        { id: '06', label: 'Klakson', itemKey: 'horns' },
        { id: '07', label: 'Alarm Pemblokiran', itemKey: 'blockingAlarm' },
        { id: '08', label: 'Pencahayaan', itemKey: 'lighting' },
        { id: '09', label: 'Pencahayaan Tambahan', itemKey: 'additionalLighting' },
        { id: '10', label: 'Lampu Berputar', itemKey: 'rotatingBeacon' },
        { id: '11', label: 'Baterai', itemKey: 'battery' },
    ];

    const wheelsItems = [
        { id: '01', label: 'Pelek', itemKey: 'rims' },
        { id: '02', label: 'Ban / Tekanan', itemKey: 'tiresPressure' },
    ];

    // Item Lainnya (yang tidak bersarang dalam objek di state checklistItems)
    const otherItems = [
        { id: '015', label: 'Sekrup dan Mur', itemKey: 'screwsNuts', section: 'screwsNuts' },
        { id: '016', label: 'Rangka dan Bodi', itemKey: 'frameBody', section: 'frameBody' },
        { id: '017', label: 'Plat Nama', itemKey: 'namePlate', section: 'namePlate' },
        { id: '018', label: 'Manual Operator', itemKey: 'operatorsManual', section: 'operatorsManual' },
        { id: '019', label: 'INSTRUKSI UNTUK PELANGGAN', itemKey: 'instructionsForCustomer', section: 'instructionsForCustomer' },
    ];


    return (
        // Box sebagai pembungkus terluar untuk mengatur lebar dan penempatan
        <Box maw="100%" mx="auto" px="md">
            {/* Judul utama di luar Card, sejajar kiri */}
            <Title
                order={1}
                mt="md"
                mb="lg"
                style={{ color: '#000000 !important' }}
            >
                Unit Arrival Check Inspection
            </Title>

            <form onSubmit={handleSubmit}>
                {/* Informasi Unit dalam Card */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Informasi Unit </Title>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}>Model</Text>}
                                name="model"
                                placeholder="Masukkan model"
                                value={unitInfo.model}
                                onChange={handleUnitInfoChange}
                                // style={{ color: '#000000 !important' }} // Ini tidak bekerja untuk placeholder atau input value
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}>Nomor Seri</Text>}
                                name="serialNo"
                                placeholder="Masukkan nomor seri"
                                value={unitInfo.serialNo}
                                onChange={handleUnitInfoChange}
                                // style={{ color: '#000000 !important' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}>Hour Meter</Text>}
                                name="hourMeter"
                                placeholder="Masukkan hour meter"
                                value={unitInfo.hourMeter}
                                onChange={handleUnitInfoChange}
                                // style={{ color: '#000000 !important' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <DateInput
                                label={<Text style={{ color: '#000000 !important' }}>Tanggal Pengecekan</Text>}
                                placeholder="Pilih tanggal"
                                value={unitInfo.dateOfCheck}
                                onChange={handleDateChange}
                                valueFormat="YYYY-MM-DD"
                                // style={{ color: '#000000 !important' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TimeInput
                                label={<Text style={{ color: '#000000 !important' }}>Waktu Pengecekan</Text>}
                                placeholder="Pilih waktu"
                                value={unitInfo.timeOfCheck}
                                onChange={handleTimeChange}
                                rightSection={<IconClock size={16} />}
                                // style={{ color: '#000000 !important' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}>Teknisi</Text>}
                                name="technician"
                                value={unitInfo.technician}
                                readOnly
                                // style={{ color: '#000000 !important' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                            <TextInput
                                label={<Text style={{ color: '#000000 !important' }}>Tanda Tangan</Text>}
                                name="signature"
                                placeholder="Masukkan tanda tangan"
                                value={unitInfo.signature}
                                onChange={handleUnitInfoChange}
                                // style={{ color: '#000000 !important' }}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Bagian Checklist */}
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Item Checklist </Title>

                {renderChecklistSection("001 - Mesin", "engine", engineItems)}
                {renderChecklistSection("002 - Transmisi", "transmission", transmissionItems)}
                {renderChecklistSection("003 - Sirkuit Hidrolik/Hidrostatik", "hydraulicHydrostaticCircuits", hydraulicHydrostaticCircuitsItems)}
                {renderChecklistSection("004 - Sirkuit Pengereman", "brakingCircuits", brakingCircuitsItems)}
                {renderChecklistSection("005 - Pelumasan", "lubrication", lubricationItems)}
                {renderChecklistSection("006 - Boom/Mast Maniscopic/Manicess", "boomMastManiscopicManicess", boomMastManiscopicManicessItems)}
                {renderChecklistSection("007 - Unit Mast", "mastUnitCheckboxes", mastUnitItems)}
                {renderChecklistSection("008 - Aksesori", "accessoriesCheckboxes", accessoriesItems)}
                {renderChecklistSection("009 - Kabin, Perangkat Pelindung / Sirkuit Listrik", "cabProtectiveDeviceElectricCircuit", cabProtectiveDeviceElectricCircuitItems)}
                {renderChecklistSection("010 - Roda", "wheels", wheelsItems)}

                {/* Item Lainnya (di luar kategori bernomor) */}
                <Card shadow="sm" p="xl" withBorder mb="lg">
                    <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Item Lainnya </Title>
                    <Grid gutter="xl">
                        {otherItems.map((item, index) => (
                            <ChecklistRadioItem
                                key={index}
                                label={<Text style={{ color: '#000000 !important' }}>{`${item.id} ${item.label}`}</Text>}
                                section={item.section} // Menggunakan section langsung dari item untuk item tunggal
                                itemKey={item.itemKey} // Menggunakan itemKey yang sudah ada di struktur state
                                currentStatus={checklistItems[item.itemKey] || ""} // Hanya status
                                onStatusChange={(section, itemKey, value) => {
                                    // Handle perubahan untuk item tunggal
                                    setChecklistItems(prev => ({
                                        ...prev,
                                        [item.itemKey]: value // Langsung update status
                                    }));
                                }}
                                span={{ base: 12, sm: 6 }}
                            />
                        ))}
                    </Grid>
                </Card>


                <Divider my="xl" />
                {/* Catatan Umum */}
                <Title order={3} mb="md" style={{ color: '#000000 !important' }}> Catatan </Title>
                <Textarea
                    placeholder="Tambahkan catatan tambahan di sini..."
                    value={generalRemarks}
                    onChange={(e) => setGeneralRemarks(e.currentTarget.value)}
                    minRows={4}
                    mb="xl"
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit" color="#A91D3A">Kirim Checklist</Button>
                </Group>

                <Divider my="xl" label={<Text style={{ color: '#000000 !important' }}>Legenda</Text>} labelPosition="center" />
                <Group justify="center" gap="xl">
                    <Text style={{ color: '#000000 !important' }}>1: Baik</Text>
                    <Text style={{ color: '#000000 !important' }}>2: Hilang</Text>
                    <Text style={{ color: '#000000 !important' }}>3: Buruk</Text>
                </Group>
            </form>
        </Box>
    );
};

export default UnitArrivalInspectionForm;