import { createContext, useContext, type PropsWithChildren } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/common/api";

interface Page {
    id: string;
    name: string;
    content: string;
    address: string;
    url: URL;
    email: string;
    status: string;
    avatar: {
        url: URL;
    };
}

interface PageContextType {
    pages: Page[] | null;
    isLoading: boolean;
    error: any;
    approvePage: (id: string) => void;
    rejectPage: (id: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({ children }: PropsWithChildren) => {
    const queryClient = useQueryClient();

    // Fetch danh sách pages từ API
    const { data: pages, isLoading, error } = useQuery({
        queryKey: ["pages"],
        queryFn: async () => {
            const response = await instance.get("/pages");
            return response.data;
        }
    });
    console.log("🚀 ~ file: pages-provider.tsx ~ line 116 ~ PageProvider ~ pages", pages);

    // Approve pages
    const { mutate: approvePage } = useMutation({
        mutationFn: async (id: string) => {
            await instance.post(`/pages/${id}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pages"]); // Refresh dữ liệu sau khi cập nhật
        }
    });

    const { mutate: rejectPage } = useMutation({
        mutationFn: async (id: string) => {
            await instance.post(`/pages/${id}/reject`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pages"]);
        }
    });

    return (
        <PageContext.Provider value={{ pages:pages?.items, isLoading, error, approvePage, rejectPage }}>
            {children}
        </PageContext.Provider>
    );
};

// Hook để sử dụng Page Context
export const usePages = () => {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error("usePages must be used within a PageProvider");
    }
    return context;
};
