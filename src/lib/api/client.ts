import type { Patient } from "@/types/patient";
import {
  AssessmentResponse,
  type ApiResponse,
  type AssessmentResults,
} from "./types";

const API_BASE_URL = "https://assessment.ksensetech.com/api";

const exponentialTimeout = async (i: number) => {
  await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i)));
};

export class ApiClient {
  private apiKey: string = "";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    validateData?: (data: any) => boolean
  ): Promise<T> {
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, { ...options, headers });

        /* handle api rate limiting */
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, i) * 1000;
          console.log(`Rate limited, retrying in ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        /* handle random 500 server errors */
        if (response.status >= 500) {
          if (i === maxRetries - 1) {
            throw new Error(`Server error: ${response.statusText}`);
          }
          console.log(`Server error, retrying... (${i + 1}/${maxRetries})`);
          await exponentialTimeout(i);
          continue;
        }
        /* parse json and validate data */
        const data = await response.json();
        if (validateData && !validateData(data)) {
          console.log(
            `Data validation failed, retrying... (${i + 1}/${maxRetries})`
          );
          await exponentialTimeout(i);
          continue;
        }
        return data as T;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        console.log(`Request failed, retrying... (${i + 1}/${maxRetries})`);
        await exponentialTimeout(i);
      }
    }
    throw new Error(`Failed to fetch after ${maxRetries} max retries!`);
  }

  async fetchAllPatients(
    onProgress?: (progress: number) => void
  ): Promise<Patient[]> {
    const allPatients: Patient[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      /* custom validation for patient data */
      const validatePatientData = (data: any): boolean => {
        return (
          data &&
          data.data &&
          Array.isArray(data.data) &&
          data.pagination &&
          typeof data.pagination.totalPages === "number"
        );
      };
      const data = await this.fetchWithRetry<ApiResponse>(
        `${API_BASE_URL}/patients?page=${page}&limit=10`,
        { method: "GET" },
        10,
        validatePatientData
      );

      allPatients.push(...data.data);

      if (page === 1) {
        totalPages = data.pagination.totalPages;
      }

      console.log(
        `Fetched page ${page}/${totalPages} with ${data.data.length} patients`
      );

      /* update progress if callback provided */
      if (onProgress) {
        const progress = (page / data.pagination.totalPages) * 100;
        onProgress(Math.min(progress, 100));
      }
      page++;
    }

    console.log(`Successfully fetched ${allPatients.length} total patients`);
    return allPatients;
  }

  async submitAssessment(results: AssessmentResults) {
    return await this.fetchWithRetry<AssessmentResponse>(
      `${API_BASE_URL}/submit-assessment`,
      {
        method: "POST",
        body: JSON.stringify(results),
      },
      3
    );
  }
}
