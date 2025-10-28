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
    // const decodedString = atob(slug);

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

    // const [guestCount, setGuestCount] = useState('');
    // const [attendance, setAttendance] = useState('');


    // const submitReservation = async () => {
    //     // Data untuk dikirim ke API
    //     const reservationData = {
    //         name: decodedString,
    //         guestCount: parseInt(guestCount, 10),
    //         attendance,
    //     };

    //     // Validasi data
    //     if (!reservationData.guestCount || !reservationData.attendance) {
    //         messageApi.error('Semua data wajib diisi!');
    //         return;
    //     }

    //     try {
    //         const response = await fetch('https://rakevserver.space/reservasi', {
    //             method: 'POST', // Tetap menggunakan POST untuk mendukung create dan update
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(reservationData),
    //         });

    //         if (!response.ok) {
    //             throw new Error('Gagal mengirim reservasi');
    //         }

    //         const result = await response.json();
    //         console.log('Reservasi berhasil:', result);
    //         messageApi.info(result.message);
    //     } catch (error) {
    //         console.error('Terjadi kesalahan saat mengirim reservasi:', error);
    //         messageApi.error('Terjadi kesalahan. Coba lagi.');
    //     }
    // };



    // const fetchReservasi = async () => {
    //     try {
    //         const response = await fetch('https://rakevserver.space/reservasi', {
    //             method: 'GET',
    //         });

    //         if (!response.ok) {
    //             throw new Error('Gagal mengambil data reservasi');
    //         }

    //         const data = await response.json();

    //         // Cari data yang sesuai dengan decodedString
    //         const existingData = data.find((item) => item.name === decodedString);

    //         if (existingData) {
    //             setGuestCount(existingData.guestCount); // Set nilai awal jumlah tamu
    //             setAttendance(existingData.attendance); // Set nilai awal kehadiran
    //         }
    //     } catch (error) {
    //         console.error('Error fetching reservasi:', error);
    //     }
    // };

    const [dataTamu, setDataTamu] = useState("");

    const fetchGuest = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/guest`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data reservasi');
            }

            const data = await response.json();

            // Cari data yang sesuai dengan slug
            const existingData = data.find((item) => item.code === slug);

            if (!existingData) {
                navigate('/404'); // Redirect ke halaman 404 jika data tidak ditemukan
                return;
            }

            // Simpan data guest ke state
            setDataTamu(existingData);

        } catch (error) {
            console.error('Error fetching reservasi:', error);
        }
    };


    useEffect(() => {
        // fetchReservasi();
        fetchGuest();
    }, []);


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
                            className="absolute inset-0 flex flex-col items-center text-center p-6 lg:p-2"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
                        >
                            <motion.img
                                src={logo}
                                alt="Logo"
                                className="w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[30vw] mb-10 lg:mb-2"
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                            />
                            <motion.img
                                src={cundamani}
                                alt="Cundamani"
                                className="w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[30vw] mb-10 lg:mb-2"
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                            />
                            <motion.div
                                className="mb-8 lg:mb-2 text-lg space-y-1 font-poppins"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p>Special Invite To:</p>
                                <p>Bapak/Ibu</p>
                                <p
                                    className="text-2xl font-bold text-yellow-400 relative"
                                    style={{
                                        WebkitTextStroke: "0.25px #d8c600",
                                    }}
                                >
                                    {dataTamu.nama}
                                </p>
                            </motion.div>
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p></p>
                            </motion.div>
                            <motion.button
                                onClick={() => setIsOpened(true)}
                                className="bg-white text-black font-semibold text-lg px-6 py-3 rounded-full shadow-md flex items-center gap-3 hover:bg-yellow-600 transition z-20 font-poppins cursor-pointer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                Buka Undangan
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isOpened && (
                        <motion.div
                            className="absolute inset-0 flex flex-col items-center text-center left-0 right-0 -bottom-50 p-6 overflow-y-auto font-poppins"
                            style={{ top: 200 }}
                            variants={pageTransition}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.img
                                src={logo}
                                alt="Logo"
                                className="w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[30vw] mb-10"
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                            />
                            <motion.img
                                src={cundamani}
                                alt="Cundamani"
                                className="w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[30vw] mb-10"
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                            />
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins font-semibold"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p>29 Oktober 2025</p>
                                <p>17.00 - 23.00</p>
                            </motion.div>
                            <motion.img
                                src={gueststar}
                                alt="Gueststar"
                                className="w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[30vw] mb-10"
                                variants={scaleIn}
                                initial="hidden"
                                animate="visible"
                            />
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins font-semibold"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p>Dresscode</p>
                                <p>Cundamani by Zameera</p>
                            </motion.div>
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins font-semibold"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p></p>
                            </motion.div>
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins font-semibold"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p></p>
                            </motion.div>
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p>Countdown</p>
                            </motion.div>
                            {timerComponents.length ? (
                                <motion.div
                                    className="flex  gap-2 text-lg"
                                    variants={fadeIn}
                                >
                                    {Object.entries(timeLeft).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex flex-col items-center bg-white/20 rounded-lg p-2 sm:p-4 shadow-inner w-16 h-16 sm:w-24 sm:h-24"
                                        >
                                            <span className="text-2xl sm:text-4xl font-bold text-white">{value}</span>
                                            <span className="text-xs sm:text-sm font-medium uppercase text-gray-300 mt-1 sm:mt-2">
                                                {key}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.p
                                    className="text-center text-lg sm:text-xl text-yellow-200 font-semibold mt-6"
                                    variants={fadeIn}
                                >
                                    Acara Sudah Dimulai!
                                </motion.p>
                            )}
                            <motion.div
                                className="text-center"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 100,
                                        transition: { duration: 0.5, delay: 0.2 }
                                    },
                                }}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <h2 className="text-3xl font-semibold text-yellow-400 mb-4">Venue</h2>
                                <p className="text-white mt-3">Hotel Griptha Kudus</p>
                                <p className="text-white font-semibold mt-3"></p>
                                <div className="animate-zoom-in">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.4401786576673!2d110.81930907480874!3d-6.837711893160353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70c462f7684b91%3A0x2757715038b21140!2sHotel%20Griptha!5e0!3m2!1sen!2sid!4v1760291436832!5m2!1sen!2sid"
                                        width="100%"
                                        height="300"
                                        style={{ border: 0, borderRadius: "10px" }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        title="Google Maps Location"
                                    ></iframe>
                                </div>
                                <p className="text-white font-semibold mt-3"></p>
                            </motion.div>
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p></p>
                            </motion.div>
                            <motion.div
                                className="relative mt-10 p-8 rounded-xl text-white max-w-3xl mx-auto z-20"
                                variants={fadeIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <motion.div
                                    className="mb-8 text-lg space-y-1 font-poppins"
                                    variants={fadeIn}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <p></p>
                                </motion.div>
                                <motion.div
                                    className="mb-8 text-lg space-y-1 font-poppins"
                                    variants={fadeIn}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <p></p>
                                </motion.div>
                                <motion.div
                                    className="mb-8 text-lg space-y-1 font-poppins"
                                    variants={fadeIn}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <p></p>
                                </motion.div>
                                <motion.h2
                                    className="text-3xl font-bold text-yellow-400 mb-8 text-center tracking-wider"
                                    variants={fadeIn}
                                >
                                </motion.h2>

                                <motion.div
                                    className="text-center text-white mb-6"
                                    variants={fadeIn}
                                >
                                    <p className="text-xl">QR Code</p>
                                    <p className="text-2xl font-semibold text-yellow-300">
                                        {dataTamu.nama}
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="flex justify-center"
                                    variants={fadeIn}
                                >
                                    <div className="relative group bg-gradient-to-r from-white-400 to-white-600 p-1 rounded-2xl shadow-lg">
                                        <div className="bg-white p-2 rounded-xl transition-transform duration-300 group-hover:scale-105">
                                            <QRCode
                                                value={slug}
                                                renderAs="canvas"
                                                size={isMobile ? 240 : 300}
                                                level="H"
                                                fgColor="#000000"
                                                bgColor="#FFFFFF"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.p
                                    className="text-center text-gray-300 mt-6"
                                    variants={fadeIn}
                                >
                                </motion.p>
                            </motion.div>
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p></p>
                            </motion.div>
                            <motion.div
                                className="mb-8 text-lg space-y-1 font-poppins"
                                variants={fadeIn}
                                initial="hidden"
                                animate="visible"
                            >
                                <p></p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </>
    );
}

export default App;
