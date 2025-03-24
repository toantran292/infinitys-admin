import { instance } from "@/common/api";
import { S3UploadError } from "@/types/upload";
import type { PresignedUrlResponse } from "@/types/upload";

interface UseS3UploadOptions {
  type: string;
  prefix?: string;
  onSuccess?: (data: { key: string; url: string }[]) => void;
  onError?: (error: Error) => void;
}

export function useS3Upload({
  type,
  prefix = "",
  onSuccess,
  onError
}: UseS3UploadOptions) {
  const uploadToS3 = async (
    file: File,
    _prefix?: string
  ): Promise<PresignedUrlResponse> => {
    const actualPrefix = _prefix || prefix;
    try {
      const { data: presignedData } = await instance.post<PresignedUrlResponse>(
        `assets/presign-link`,
        {
          type,
          suffix: `${actualPrefix}/${Date.now()}-${String(file.name).trim().replace(/\s+/g, "-")}`
        }
      );

      if (!presignedData?.url) {
        throw new S3UploadError("Không lấy được pre-signed URL");
      }

      const uploadResponse = await fetch(presignedData.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      if (!uploadResponse.ok) {
        throw new S3UploadError(
          `Upload thất bại: ${uploadResponse.statusText}`
        );
      }

      onSuccess?.([{ key: presignedData.key, url: presignedData.url }]);
      return presignedData;
    } catch (error) {
      const uploadError =
        error instanceof Error
          ? new S3UploadError(error.message)
          : new S3UploadError("Lỗi không xác định");

      onError?.(uploadError);
      throw uploadError;
    }
  };

  const uploadMultipleToS3 = async (
    files: File[],
    _prefix?: string
  ): Promise<PresignedUrlResponse[]> => {
    const actualPrefix = _prefix || prefix;
    try {
      const fileInfos = files.map((file) => ({
        type,
        suffix:
          type === "testcases"
            ? `${actualPrefix}/${String(file.name).trim().replace(/\s+/g, "-")}`
            : `${actualPrefix}/${Date.now()}-${String(file.name).trim().replace(/\s+/g, "-")}`
      }));

      console.log({ fileInfos });

      const { data: presignedDataArray } = await instance.post<
        PresignedUrlResponse[]
      >(`assets/presign-links`, fileInfos);

      if (!presignedDataArray?.length) {
        throw new S3UploadError("Không lấy được pre-signed URLs");
      }

      const uploadPromises = files.map((file, index) => {
        const presignedData = presignedDataArray[index];
        return fetch(presignedData.url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type
          },
          credentials: "omit"
        });
      });

      const responses = await Promise.all(uploadPromises);

      const failedUploads = responses.filter((response) => !response.ok);
      if (failedUploads.length > 0) {
        throw new S3UploadError(`${failedUploads.length} file upload thất bại`);
      }

      onSuccess?.(presignedDataArray);
      return presignedDataArray;
    } catch (error) {
      const uploadError =
        error instanceof Error
          ? new S3UploadError(error.message)
          : new S3UploadError("Lỗi không xác định");

      onError?.(uploadError);
      throw uploadError;
    }
  };

  return { uploadToS3, uploadMultipleToS3 };
}
