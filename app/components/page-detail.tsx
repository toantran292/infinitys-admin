import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/common/api";
import { Button } from "@/components/ui/button";

export default function PageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: page, isLoading, isError } = useQuery({
        queryKey: ["pageDetail", id],
        queryFn: async () => {
            const res = await instance.get(`/pages/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    const approveMutation = useMutation({
        mutationFn: async (pageId: string) => {
            await instance.post(`/pages/${pageId}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pages"]);
            queryClient.invalidateQueries(["pageDetail", id]);
            navigate("/pages");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (pageId: string) => {
            await instance.post(`/pages/${pageId}/reject`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pages"]);
            queryClient.invalidateQueries(["pageDetail", id]);
            navigate("/pages");
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !page) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="text-red-500 text-center mt-8">Không tìm thấy page!</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-start">
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg mt-8 relative">
                {/* Cover photo */}
                <div className="h-32 w-full bg-gradient-to-r from-blue-800 to-blue-600 rounded-t-xl">
                    {page.coverPhoto && (
                        <img
                            src={page.coverPhoto}
                            alt="cover"
                            className="w-full h-full object-cover rounded-t-xl"
                        />
                    )}
                </div>

                {/* Avatar tròn nổi lên cover */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2">
                    <img
                        src={page.avatar?.url || "https://via.placeholder.com/100"}
                        alt="avatar"
                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                    />
                </div>

                <div className="px-6 pb-6 pt-20 text-center">
                    <h1 className="text-xl font-bold text-gray-900">{page.name}</h1>
                    <p className="text-sm text-gray-600">{page.address}</p>
                    <p className="text-sm text-gray-600">{page.email}</p>

                    {page.content && (
                        <p className="mt-3 text-gray-700 whitespace-pre-line">
                            {page.content}
                        </p>
                    )}
                    {page.url && (
                        <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-blue-600 hover:underline"
                        >
                            {page.url}
                        </a>
                    )}

                    {/* Nút hành động */}
                    <div className="mt-5 flex justify-center gap-2">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            onClick={() => approveMutation.mutate(id!)}
                            disabled={approveMutation.isLoading}
                        >
                            Duyệt
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                            onClick={() => rejectMutation.mutate(id!)}
                            disabled={rejectMutation.isLoading}
                        >
                            Từ chối
                        </Button>
                        <Button className="cursor-pointer" variant="outline" onClick={() => navigate("/pages")}>
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
