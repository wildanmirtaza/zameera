import { useState, useEffect, useRef } from 'react';
import { Popconfirm, message, Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import backgroundAdmin from "../assets/backgroundAdmin.jpg";
import { TbChecklist } from 'react-icons/tb';
import { LuClipboardList } from 'react-icons/lu';
import { IoPeopleSharp } from 'react-icons/io5';
import { FiPlus } from 'react-icons/fi';
import { IoIosSend } from 'react-icons/io';
import { RxCross2 } from 'react-icons/rx';
import { v4 as uuidv4 } from 'uuid';

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


    const addGuestRow = () => {
        setIsEdited(true);
        setGuests((prevGuests) => [
            ...prevGuests,
            { tempId: uuidv4(), name: '', table: '', link: '' }
        ]);
    };

    const updateGuestData = (id, field, value) => {
        setIsEdited(true);
        setGuests((prev) =>
            prev.map((guest) =>
                (guest._id === id || guest.tempId === id)
                    ? { ...guest, [field]: value }
                    : guest
            )
        );
    };



    const saveChanges = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            messageApi.error('Token tidak ditemukan. Silakan login kembali.');
            return;
        }

        try {
            const response = await fetch('https://rakevserver.space/tamu', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(guests),
            });

            if (!response.ok) {
                throw new Error('Failed to save changes');
            }

            const result = await response.json();
            console.log('Bulk update successful:', result);
            messageApi.success('Perubahan berhasil disimpan!');
            setIsEdited(false);
        } catch (error) {
            console.error('Error saving changes:', error);
            messageApi.error('Terjadi kesalahan saat menyimpan perubahan.');
        }
    };


    const cancelChanges = async () => {
        setIsEdited(false);
        fetchGuests();
    };


    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    const generateLink = (name) => {
        return name ? btoa(name.trim()) : '';
    };



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
                }, 3000);
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

    const handleDeleteKehadiran = async (id) => {
        try {
            const response = await fetch(`https://rakevserver.space/attendance/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Data berhasil dihapus!');
            } else {
                message.error('Gagal menghapus data!');
            }
        } catch (error) {
            message.error('Terjadi kesalahan saat menghapus data!');
        }
        fetchDataKehadiran();
    };

    const handleDeleteReservasi = async (id) => {
        try {
            const response = await fetch(`https://rakevserver.space/reservasi/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Data reservasi berhasil dihapus!');
            } else {
                message.error('Gagal menghapus data reservasi!');
            }
        } catch (error) {
            message.error('Terjadi kesalahan saat menghapus data reservasi!');
        }
        fetchDataReservasi();
    };

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
                    <div className="p-8 bg-gray-200/50 border-1 border-gray-700 text-white rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="mb-4 text-3xl font-bold text-center text-black">Login</h2>
                        <p className="mb-4 text-sm text-center text-black">Silakan masukkan password untuk mengakses halaman ini.</p>
                        <input
                            type="password"
                            className="w-full p-3 mb-4 text-black rounded-lg border-1 border-black focus:outline-none focus:ring focus:ring-black"
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
                <div className="p-6 bg-gradient-to-l from-white-900/20 to-white-800/20 text-black font-sriracha rounded-xl shadow-lg max-w-4xl mx-auto mt-10 z-20 border-1 border-black">
                    <h1 className="text-3xl font-bold text-black text-center mb-6">{selectedMenu}</h1>
                    {selectedMenu === "Daftar Tamu" && (
                        guests.length > 0 ? (
                            <div className="overflow-x-hidden">
                                <div className="max-h-[70vh] overflow-y-auto">
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border-b w-[10%]">No</th>
                                                <th className="px-4 py-2 border-b w-[40%]">Nama Tamu</th>
                                                <th className="px-4 py-2 border-b w-[20%]">Nomor Kursi</th>
                                                <th className="px-4 py-2 border-b w-[30%]">Link Undangan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {guests.map((guest, index) => (
                                                <tr key={guest._id || guest.tempId} className='hover:bg-gray-200'>
                                                    <td className="px-4 py-2 border-b">{index + 1}</td>
                                                    <td className="px-4 py-2 border-b">
                                                        <input
                                                            type="text"
                                                            value={guest.name}
                                                            onChange={(e) =>
                                                                updateGuestData(guest._id || guest.tempId, 'name', e.target.value)
                                                            }
                                                            placeholder="Nama Tamu"
                                                            className="w-full px-2 bg-transparent focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 border-b">
                                                        <input
                                                            type="text"
                                                            value={guest.table}
                                                            onChange={(e) =>
                                                                updateGuestData(guest._id || guest.tempId, 'table', e.target.value)
                                                            }
                                                            placeholder="Nomor"
                                                            className="w-full px-2 bg-transparent focus:outline-none"
                                                        />
                                                    </td>
                                                    <td
                                                        className="px-4 py-2 border-b cursor-copy overflow-hidden whitespace-nowrap text-ellipsis"
                                                        onClick={() => {
                                                            const link = `https://muriadjavanese.invitoo.online/${generateLink(guest.name)}`;
                                                            navigator.clipboard.writeText(link);
                                                            messageApi.success('Link berhasil disalin!');
                                                        }}
                                                    >
                                                        {generateLink(guest.name)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>
                            </div>





                        ) : (
                            <p className="text-center text-black mt-4">Belum ada tamu yang ditambahkan.</p>
                        ))}

                    {selectedMenu === "Reservasi" && (
                        dataReservasi.length > 0 ? (
                            <div className="overflow-x-hidden">
                                <div className="max-h-[70vh] overflow-y-auto">
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border-b w-[10%]">No</th>
                                                <th className="px-4 py-2 border-b w-[40%]">Nama Tamu</th>
                                                <th className="px-4 py-2 border-b w-[20%]">Jumlah Tamu</th>
                                                <th className="px-4 py-2 border-b w-[30%]">Kehadiran</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataReservasi.map((guest, index) => (
                                                <Popconfirm
                                                    key={guest._id}
                                                    title="Yakin ingin menghapus reservasi ini?"
                                                    onConfirm={() => handleDeleteReservasi(guest._id)}
                                                    okText="Ya"
                                                    cancelText="Tidak"
                                                >
                                                    <tr
                                                        className="cursor-pointer hover:bg-gray-200"
                                                        style={{ transition: 'background-color 0.3s' }}
                                                    >
                                                        <td className="px-4 py-2 border-b">{index + 1}</td>
                                                        <td className="px-4 py-2 border-b">
                                                            {guest.name}
                                                        </td>
                                                        <td className="px-4 py-2 border-b">
                                                            {guest.guestCount}
                                                        </td>
                                                        <td className="px-4 py-2 border-b">
                                                            {guest.attendance}
                                                        </td>
                                                    </tr>
                                                </Popconfirm>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>





                        ) : (
                            <p className="text-center text-black mt-4">Belum ada data reservasi.</p>
                        ))}

                    {selectedMenu === "Kehadiran" && (
                        <>
                            <input
                                ref={inputRef}
                                type="text"
                                value={scannedBarcode}
                                onChange={(e) => setScannedBarcode(e.target.value)}
                                placeholder="Scan barcode atau ketik nama di sini"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none mb-4"
                                onKeyDown={handleManualInput}
                            />

                            {dataKehadiran.length > 0 ? (
                                <div className="overflow-x-hidden">
                                    <div ref={scrollRef} className="max-h-[65vh] overflow-y-auto">
                                        <table className="w-full text-left border-collapse table-fixed">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-2 border-b w-[10%]">No</th>
                                                    <th className="px-4 py-2 border-b w-[40%]">Nama Tamu</th>
                                                    <th className="px-4 py-2 border-b w-[30%]">Waktu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dataKehadiran.map((guest, index) => (
                                                    <Popconfirm
                                                        key={guest._id}
                                                        title="Yakin ingin menghapus data ini?"
                                                        onConfirm={() => handleDeleteKehadiran(guest._id)}
                                                        okText="Ya"
                                                        cancelText="Tidak"
                                                    >
                                                        <tr
                                                            className="cursor-pointer hover:bg-gray-200"
                                                            style={{ transition: 'background-color 0.3s' }}
                                                        >
                                                            <td className="px-4 py-2 border-b">{index + 1}</td>
                                                            <td className="px-4 py-2 border-b">{guest.name}</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {new Date(guest.attendanceTime)
                                                                    .toLocaleTimeString('id-ID', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        second: '2-digit',
                                                                    })
                                                                    .replace(/\./g, ':')}
                                                            </td>
                                                        </tr>
                                                    </Popconfirm>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-black mt-4">
                                    Belum ada data kehadiran.
                                </p>
                            )}
                        </>
                    )}

                    <div className="fixed bottom-4 left-4">
                        <button
                            onClick={() => setSelectedMenu("Kehadiran")}
                            className={`flex items-center gap-2 w-48 px-6 py-2 font-bold text-black transition-all rounded-full shadow-lg border-1 cursor-pointer ${selectedMenu === "Kehadiran"
                                ? "bg-black border-black text-white"
                                : "bg-white hover:bg-gray-200 border-black"
                                }`}
                        >
                            <TbChecklist className="text-2xl" /> Kehadiran
                        </button>
                    </div>

                    {/* <div className="fixed bottom-16 left-4">
                        <button
                            onClick={() => { setSelectedMenu("Scanner") }}
                            className="flex items-center gap-2 w-48 bg-yellow-600/70 hover:bg-yellow-700/70 border-1 border-yellow-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all"
                        >
                            <MdQrCodeScanner className="text-2xl" /> Scanner
                        </button>
                    </div> */}
                    <div className="fixed bottom-16 left-4">
                        <button
                            onClick={() => { setSelectedMenu("Reservasi") }}
                            className={`flex items-center gap-2 w-48 px-6 py-2 font-bold text-black transition-all rounded-full shadow-lg border-1 cursor-pointer ${selectedMenu === "Reservasi"
                                ? "bg-black border-black text-white"
                                : "bg-white hover:bg-gray-200 border-black"
                                }`}
                        >
                            <IoPeopleSharp className="text-2xl" /> Reservasi
                        </button>
                    </div>
                    <div className="fixed bottom-28 left-4">
                        <button
                            onClick={() => { setSelectedMenu("Daftar Tamu") }}
                            className={`flex items-center gap-2 w-48 px-6 py-2 font-bold text-black transition-all rounded-full shadow-lg border-1 cursor-pointer ${selectedMenu === "Daftar Tamu"
                                ? "bg-black border-black text-white"
                                : "bg-white hover:bg-gray-200 border-black"
                                }`}
                        >
                            <LuClipboardList className="text-2xl" /> Daftar Tamu
                        </button>
                    </div>


                    {selectedMenu === "Daftar Tamu" && (
                        <>
                            <div className="fixed bottom-4 right-4">
                                <button
                                    onClick={addGuestRow}
                                    className="flex items-center gap-2 w-32 bg-blue-600 hover:bg-blue-700 border-1 border-blue-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all cursor-pointer"
                                >
                                    <FiPlus /> Add
                                </button>
                            </div>
                            {isEdited && (
                                <>
                                    <div className="fixed bottom-16 right-4">
                                        <button
                                            onClick={cancelChanges}
                                            className="flex items-center gap-2 w-32 bg-red-600 hover:bg-red-700 border-1 border-red-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all cursor-pointer"
                                        > 
                                            <RxCross2 /> Cancel
                                        </button>
                                    </div>
                                    <div className="fixed bottom-28 right-4">
                                        <button
                                            onClick={saveChanges}
                                            className="flex items-center gap-2 w-32 bg-green-600 hover:bg-green-700 border-1 border-green-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all cursor-pointer"
                                        >
                                            <IoIosSend /> Save
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}

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
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">
                        Selamat Datang, {guestDetails.name}!
                    </h2>
                    <p className="mt-2 text-gray-500">
                        Meja Anda : <span className="font-semibold">{guestDetails.table}</span>.
                    </p>
                    <p className="text-gray-500">
                        Waktu Kehadiran:{" "}
                        <span className="font-semibold">
                            {new Date().toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            })}
                        </span>
                    </p>
                    <div className="mt-4 w-full border-t border-gray-200"></div>
                    <p className="mt-4 text-sm text-gray-400">
                        Terima kasih telah hadir!
                    </p>
                </div>
            </Modal>
<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={() => { fetchGuests(); fetchDataReservasi(); fetchDataKehadiran(); messageApi.success("Berhasil Fetch Data"); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition duration-300 cursor-pointer"
                >
                    Refresh
                </button>
</div>
        </>
    );
};

export default AdminGuestList;
