import React, { useState, useEffect, useRef } from 'react';
import { message, Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import backgroundAdmin from "../assets/backgroundAdmin.png";

const AdminGuestList = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [guestDetails, setGuestDetails] = useState({});

    const checkPassword = async () => {
        try {
            const response = await fetch('https://rakevserver.space/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.status === 200) {
                console.log("Login berhasil!");
                messageApi.success('Login berhasil!');
                localStorage.setItem('token', data.token);
                setIsAuthenticated(true);
            } else {
                messageApi.error('Login gagal!');
                console.error(data.message);
            }
        } catch (error) {
            console.error("Terjadi kesalahan:", error);
        }
    };



    const [messageApi, contextHolder] = message.useMessage();
    const [guests, setGuests] = useState([]);
    const [dataReservasi, setDataReservasi] = useState([]);
    const [dataKehadiran, setDataKehadiran] = useState([]);
    const [isEdited, setIsEdited] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState("Daftar Tamu");

    const fetchGuests = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token tidak ditemukan. Silakan login kembali.');
            return;
        }

        try {
            const response = await fetch('https://rakevserver.space/tamu', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                console.error('Token tidak valid atau kedaluwarsa.');
            }

            const data = await response.json();
            setGuests(data);
        } catch (error) {
            console.error('Error fetching guests:', error);
        }
    };

    const fetchDataReservasi = async () => {

        try {
            const response = await fetch('https://rakevserver.space/reservasi', {
                method: 'GET',
            });

            if (response.status === 401) {
                console.error('Token tidak valid atau kedaluwarsa.');
            }

            const data = await response.json();
            setDataReservasi(data);
        } catch (error) {
            console.error('Error fetching guests:', error);
        }
    };

    const fetchDataKehadiran = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token tidak ditemukan. Silakan login kembali.');
            return;
        }

        try {
            const response = await fetch('https://rakevserver.space/attendance', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                console.error('Token tidak valid atau kedaluwarsa.');
            }

            const data = await response.json();
            setDataKehadiran(data);
        } catch (error) {
            console.error('Error fetching guests:', error);
        }
    };


    useEffect(() => {
        fetchGuests();
        fetchDataReservasi();
        fetchDataKehadiran();
    }, []);



    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);


    const sendAttendanceToAPI = async (name) => {
        try {
            const response = await fetch("https://rakevserver.space/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Data kehadiran berhasil dikirim:", result);
                // messageApi.success("Data kehadiran berhasil disimpan ke server!");
            } else {
                const error = await response.json();
                console.error("Error saat mengirim data kehadiran:", error);
                messageApi.error("Gagal menyimpan data kehadiran ke server.");
            }
        } catch (error) {
            console.error("Kesalahan jaringan:", error);
            messageApi.error("Terjadi kesalahan saat menghubungi server.");
        }
    };

    const [scannedBarcode, setScannedBarcode] = useState("");
    const inputRef = useRef(null);

    const validateAttendance = (input) => {
        const matchedGuest = guests.find((guest) => guest.name === input);
        if (matchedGuest) return matchedGuest;
        try {
            const decodedInput = atob(input);
            return guests.find((guest) => guest.name === decodedInput);
        } catch (error) {
            return null;
        }
    };

    const scrollRef = useRef(null);
    const processInput = async (input) => {
        const matchedGuest = validateAttendance(input);

        if (matchedGuest) {
            const isAlreadyPresent = dataKehadiran.some(
                (guest) => guest.name === matchedGuest.name
            );
            if (isAlreadyPresent) {
                messageApi.warning(`${matchedGuest.name} sudah tercatat hadir.`);
            } else {
                await sendAttendanceToAPI(matchedGuest.name);
                await fetchDataKehadiran();
                // const newAttendance = {
                //     id: matchedGuest._id,
                //     name: matchedGuest.name,
                //     table: matchedGuest.table,
                //     attendanceTime: new Date(),
                // };
                // setDataKehadiran((prev) => [...prev, newAttendance]);
                // messageApi.success(`Selamat datang, ${matchedGuest.name}!`);
                setGuestDetails(matchedGuest);
                setIsModalVisible(true);
                setTimeout(() => {
                    setIsModalVisible(false);
                    if (scrollRef.current) {
                        scrollRef.current.scrollTo({
                            top: scrollRef.current.scrollHeight,
                            behavior: "smooth",
                        });
                    }
                }, 3456);
            }
        } else {
            messageApi.error("Tamu tidak ditemukan atau data barcode tidak valid.");
        }
        setScannedBarcode("");
    };

    const handleManualInput = (event) => {
        if (event.key === "Enter" && scannedBarcode) {
            processInput(scannedBarcode.trim());
        }
    };

    useEffect(() => {
        const focusInput = () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        };
        window.addEventListener("keydown", focusInput);
        return () => {
            window.removeEventListener("keydown", focusInput);
        };
    }, []);



    return !isAuthenticated ? (
        <div>
            {contextHolder}
            <div
                className="relative h-screen w-screen overflow-hidden text-white font-sriracha"
                style={{
                    backgroundImage: `url(${backgroundAdmin})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="flex items-center justify-center h-screen">
                    <div className="p-8 text-white rounded-lg shadow-lg max-w-sm w-full">
                        <input
                            type="password"
                            className="w-full p-3 mb-4 text-white rounded-lg border-1 border-white focus:outline-none focus:ring focus:ring-white"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            onClick={checkPassword}
                            className="w-full px-4 py-3 font-bold text-white bg-blue-600 border-2 border-blue-500 cursor-pointer rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <>
            {contextHolder}
            <div
                className="relative h-screen w-screen overflow-hidden text-white font-sriracha"
                style={{
                    backgroundImage: `url(${backgroundAdmin})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="p-6 text-black font-sriracha rounded-xl max-w-4xl mx-auto mt-10 z-20">
                    <input
                        ref={inputRef}
                        type="text"
                        value={scannedBarcode}
                        onChange={(e) => setScannedBarcode(e.target.value)}
                        placeholder=""
                        className="w-full px-4 py-2 rounded-lg focus:outline-none mb-4 text-center"
                        onKeyDown={handleManualInput}
                    />
                </div>
            </div>
            <Modal
                title={null}
                visible={isModalVisible}
                footer={null}
                centered
                className="rounded-lg"
                bodyStyle={{
                    textAlign: 'center',
                    padding: '2rem',
                }}
            >
                <div className="flex flex-col items-center">
                    <CheckCircleOutlined style={{ fontSize: '4rem', color: '#52c41a' }} />
                    <p className="mt-4 text-black">
                        Selamat Datang
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-black">
                        {guestDetails.name}
                    </h2>
                </div>
            </Modal>
<div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => { fetchGuests(); fetchDataReservasi(); fetchDataKehadiran(); messageApi.success("Berhasil Fetch Data"); }}
                    className="px-4 py-2 text-black rounded-xl shadow transition duration-300 cursor-pointer"
                >
                    Refresh
                </button>
</div>
        </>
    );
};

export default AdminGuestList;
