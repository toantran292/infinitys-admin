import {instance} from "~/common/api";


interface Page {
    id: string;
    name: string;
    content: string;
    address: string;
    url: string;
    email: string;
    status: string;
}

export const getPendingPages = async (): Promise<Page[]> => {
    try {
        const response = await instance.get("/pages");

        return response.data;
    } catch (error) {
        console.error("API Error:", error);
    }
};

export const approvePage = async (id: string): Promise<void> => {
    await instance.post(`/pages/${id}/approve`);
};

export const rejectPage = async (id: string): Promise<void> => {
    await instance.post(`/pages/${id}/reject`);
};
