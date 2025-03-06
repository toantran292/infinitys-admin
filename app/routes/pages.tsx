import { useEffect, useState } from "react";
import { getPendingPages, approvePage, rejectPage } from "~/providers/page-provider";

export default function AdminPages() {
    const [pages, setPages] = useState<{
        id: string;
        name: string;
        content: string;
        address: string;
        url: string;
        email: string;
        status: string
    }[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await getPendingPages();
                setPages(response?.data || []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách page:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPages();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await approvePage(id);
            setPages((prevPages) => prevPages.map(page =>
                page.id === id ? { ...page, status: "approved" } : page
            ));
        } catch (error) {
            console.error("Lỗi khi duyệt page:", error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectPage(id);
            setPages((prevPages) => prevPages.map(page =>
                page.id === id ? { ...page, status: "rejected" } : page
            ));
        } catch (error) {
            console.error("Lỗi khi từ chối page:", error);
        }
    };


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Duyệt Page</h1>

            {loading ? (
                <p>Đang tải...</p>
            ) : pages.length === 0 ? (
                <p>Không có page nào cần duyệt.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">Tên Trang</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Địa chỉ</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Nội dung</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Website</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Trạng thái</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 px-4 py-2">{page.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{page.email}</td>
                                <td className="border border-gray-300 px-4 py-2">{page.address}</td>
                                <td className="border border-gray-300 px-4 py-2">{page.content}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <a href={page.url} target="_blank" className="text-blue-500 hover:underline">
                                        {page.url}
                                    </a>
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                        <span
                                            className={`px-3 py-1 rounded-md text-sm font-semibold ${
                                                page.status === "approved" ? "bg-green-100 text-green-700 border border-green-500" :
                                                    page.status === "started" ? "bg-yellow-100 text-yellow-700 border border-yellow-500" :
                                                        "bg-red-100 text-red-700 border border-red-500"
                                            }`}
                                        >
                                            {page.status === "approved" && "Đã duyệt"}
                                            {page.status === "started" && "Chờ duyệt"}
                                            {page.status === "rejected" && "Bị từ chối"}
                                        </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                                        onClick={() => handleApprove(page.id)}
                                    >
                                        Duyệt
                                    </button>
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                                        onClick={() => handleReject(page.id)}
                                    >
                                        Từ chối
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
