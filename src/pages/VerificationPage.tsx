import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function VerificationPage() {
    const location = useLocation();
    const email = location.state?.email;

    async function handleResendEmail() {
        if (!email) return;

        const res = await fetch(`${API_BASE_URL}/api/auth/resend-email?email=${encodeURIComponent(email)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const message = await res.text();
        alert(message);
    }

    return (
        <div className="d-flex justify-content-center container" style={{ height: "fit-content" }}>
            <div className="text-center p-5 rounded shadow bg-white" style={{ maxWidth: "500px" }}>
                <div className="mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        fill="currentColor"
                        className="bi bi-envelope-check text-success"
                        viewBox="0 0 16 16"
                    >
                        <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 
                        2 0 0 0-2-2H2zm12 2v.217L8 8.583 2 4.217V4a1 1 0 0 
                        1 1-1h10a1 1 0 0 1 1 1zM1 5.383l5.803 
                        4.202a.5.5 0 0 0 .582 0L13 5.383V12a1 1 0 0 1-1 
                        1H2a1 1 0 0 1-1-1V5.383z" />
                        <path d="M15.854 5.146a.5.5 0 0 0-.708 0L10.5 
                        9.793l-1.646-1.647a.5.5 0 0 0-.708.708l2 
                        2a.5.5 0 0 0 .708 0l5-5a.5.5 0 0 0 0-.708z" />
                    </svg>
                </div>
                <h2 className="mb-3">Verify your email</h2>
                <p className="mb-3 text-muted">
                    Thanks for signing up! We've sent a confirmation email to your address.
                </p>
                <p className="text-muted">
                    If you don't see the email, check your spam folder or click below to resend it.
                </p>
                <button className="btn-orange mt-3" onClick={handleResendEmail}>
                    Resend email
                </button>
            </div>
        </div>
    );
}
