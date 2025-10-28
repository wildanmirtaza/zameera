import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/zameeralogo.webp";
import "../App.css";
import { useParams, useNavigate } from "react-router-dom";
import { QRCode, message } from "antd";
import backgroundhp2 from "../assets/Black and Gold Bokeh Sparkle Thanks For Watching Mobile Video.webm";
import cundamani from "../assets/hero.webp";
import gueststar from "../assets/gueststar.webp";
import { baseUrl } from "../config/apiConfig";

function App() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const decodedString = atob(slug);

    const [messageApi, contextHolder] = message.useMessage();
    const [isMobile, setIsMobile] = useState(false);
    const [dataReservasi, setDataReservasi] = useState([]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    const [isOpened, setIsOpened] = useState(false);

    const targetDate = "2025-10-29T17:00:00";

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const target = new Date(targetDate);
        const current = new Date();
        const utcOffset = 7 * 60 * 60 * 1000;
        const currentInWIB = new Date(current.getTime() + current.getTimezoneOffset() * 60 * 1000 + utcOffset);
        const difference = target - currentInWIB;
        if (difference <= 0) return {};
        return {
            hari: Math.floor(difference / (1000 * 60 * 60 * 24)),
            jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
            menit: Math.floor((difference / 1000 / 60) % 60),
            detik: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const timerComponents = Object.keys(timeLeft).map((interval) => {
        if (!timeLeft[interval]) return null;
        return (
            <span key={interval} className="mx-1">
                <strong>{timeLeft[interval]}</strong> {interval}
            </span>
        );
    });

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, transition: { duration: 1 } },
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1 } },
    };

    const pageTransition = {
        hidden: { opacity: 0, y: -200 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
        exit: { opacity: 0, x: 200, transition: { duration: 0.8 } },
    };


    const galleryFade = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 1, staggerChildren: 0.2 } },
    };

    const galleryItem = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    };


    const galleryItemAnimation = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, delay: i * 0.5 },
        }),
    };

    const staggerContainer = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const scaleUp = {
        hidden: { opacity: 0, scale: 0 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" } },
    };

    const [guests, setGuests] = useState([]);
    const [inputNama, setInputNama] = useState("");

    const fetchGuest = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/guest`);
            if (!response.ok) throw new Error("Gagal mengambil data distributor");

            const data = await response.json();

            // ambil hanya data yang distributor == decodedString
            const filteredData = data.filter((item) => item.distributor === decodedString);

            if (filteredData.length === 0) {
                console.warn("Distributor tidak ditemukan:", decodedString);
                navigate('/404');
            }

            // simpan sebagai array, walau hanya 1 objek
            setGuests(filteredData);

        } catch (error) {
            console.error("Error fetching guest:", error);
        }
    };



    useEffect(() => {
        fetchGuest();
    }, []);

    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredGuests = guests.filter((guest) =>
        guest.nama.toLowerCase().includes(inputNama.toLowerCase())
    );


    return (
        <>
            {contextHolder}



            <div className="relative h-screen w-screen overflow-hidden text-white font-sriracha">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src={backgroundhp2} type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                <AnimatePresence>
                    {!isOpened && (
                        <motion.div
                            className="absolute inset-0 flex flex-col items-center text-center p-6 lg:p-2 space-y-4"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
                        >
                            {/* Logo */}
                            <motion.img
                                src={logo}
                                alt="Logo"
                                className="w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[25vw] mb-6"
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                            />

                            {/* Judul */}
                            <motion.h2
                                className="text-2xl font-semibold text-white mb-10"
                                variants={fadeInUp}
                            >
                                {decodedString}
                            </motion.h2>

                            <motion.div
                                className="relative w-64"
                                variants={fadeInUp}
                            >
                                {/* Inputan Nama */}
                                <label className="block text-white mb-2 text-sm font-medium" htmlFor="namaInput">
                                    Nama Tamu
                                </label>
                                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                    <div className="flex flex-col gap-2">
                                        {guests.map((guest) => (
                                            <button
                                                key={guest._id}
                                                onClick={() => navigate(`/${guest.code}`)}
                                                className="w-full text-left px-4 py-3 bg-white/10 text-white rounded-lg border border-white/30 hover:bg-[#FFB200]/30 transition"
                                            >
                                                {guest.nama}
                                            </button>
                                        ))}
                                    </div>
                                </div>



                            </motion.div>



                        </motion.div>
                    )}
                </AnimatePresence>


            </div>
        </>
    );
}

export default App;
