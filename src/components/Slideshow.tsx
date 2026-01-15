import { useEffect, useState } from "react";

const imageList = [
    "/images/slideshow1.jpg",
    "/images/slideshow2.jpg",
    "/images/slideshow3.jpg",
    "/images/slideshow4.jpg"
]

export default function Slideshow() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);

            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % imageList.length);
                setFade(true);
            }, 1000);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="slideshow-container">
                <img
                    src={imageList[currentIndex]}
                    alt={`Slideshow image ${currentIndex + 1}`}
                    className={`slideshow-image ${fade ? "fade-in" : "fade-out"}`}
                />
            </div>

            <div className="slideshow-overlay"></div>
        </>
    )
}
