"use client";

import { useState } from "react";
import {
    Button,
    Stack,
    PinInput
} from "@mantine/core";

export default function OtpForm() {
    const [otp, setOtp] = useState("");

    const handleVerify = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("OTP Verified Successfully!");
            } else {
                alert(data.message || "OTP Verification Failed!");
            }
        } catch (error) {
            console.error("OTP verification error:", error);
        }
    };

    return (
        <Stack>
            <div className="flex justify-center">
                <PinInput
                    length={6}
                    oneTimeCode
                    value={otp}
                    onChange={setOtp}
                    type="number"
                />
            </div>
            <div className="flex justify-center mt-10" mx="auto">
                <Button color="#A91D3A" onClick={handleVerify}>Verify OTP</Button>
            </div>
        </Stack>
    );
}