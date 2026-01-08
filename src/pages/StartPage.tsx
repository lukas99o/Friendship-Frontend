import { useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function StartPage() {
    useEffect(() => {
        fetch(`${API_BASE_URL}/ping`)
            .then(() => console.log("✅ API wake-up request sent"))
            .catch(err => console.error("❌ API not reachable", err));
    }, []);

    return (
        <div
            className="d-flex flex-column align-items-center pb-5 px-3"
            style={{ fontFamily: "'Nunito', sans-serif" }}
        >
            <h1 className="fancy-title mb-4 text-center">Välkommen till Vänskap!</h1>

            <div
                className="container rounded bg-light p-4 shadow d-flex flex-column flex-md-row align-items-center gap-4"
                style={{ overflow: "hidden" }} 
            >
                <div
                    className="position-relative w-100 w-md-50"
                    style={{
                        maxHeight: "400px", 
                        flex: "1 1 50%", 
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <video
                        src="/videos/vänskap-flöde.mp4"
                        autoPlay
                        muted
                        loop
                        style={{
                            width: "100%",
                            height: "100%",
                            maxHeight: "400px",
                            objectFit: "cover",
                            pointerEvents: "none",
                            filter: "brightness(0.85)",
                            borderRadius: "0.5rem"
                        }}
                    />
                </div>

                <div
                    className="w-90 w-md-50 text-center"
                    style={{ flex: "1 1 50%" }}
                >
                    <div
                        className="shadow startpage-text rounded p-4"
                        style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}
                    >
                        <h2 className="mb-3 header" style={{ fontWeight: "bold" }}>Utforska Vänskap</h2>
                        <p>Gå med i vår gemenskap och upptäck nya vänskapsband!</p>
                        <p>Vi erbjuder en plattform för att knyta kontakter och bygga meningsfulla relationer.</p>
                        <p>Oavsett om du letar efter vänner, aktiviteter eller bara vill ha kul, så har vi något för dig!</p>
                        <p>Registrera dig idag och börja din resa mot nya vänskaper!</p>
                        <a className="btn btn-orange mt-2 mx-auto"
                           href="/register"
                           style={{ color: "white", width: "fit-content", padding: "10px 20px" }}
                        >
                            Registrera dig
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
