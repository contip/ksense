import { ApiResponse, AssessmentResults, Patient } from "@/types/patient";

const API_BASE_URL = "https://assessment.ksensetech.com/api";

class ApiClient {
  private apiKey: string = "";

  //   constructor(apiKey: string) {
  //     this.apiKey = apiKey;
  //   }
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<Response> {
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
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
          continue;
        }
        return response;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        console.log(`Request failed, retrying... (${i + 1}/${maxRetries})`);
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
    throw new Error("Failed to fetch data after retries");
  }

  async fetchAllPatients(
    onProgress?: (progress: number) => void
  ): Promise<Patient[]> {
    const allPatients: Patient[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchWithRetry(
        `${API_BASE_URL}/patients?page=${page}&limit=10`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      allPatients.push(...data.data);

      hasMore = data.pagination.hasNext;
      page++;

      /* update progress if callback provided */
      if (onProgress) {
        const progress = (page / data.pagination.totalPages) * 100;
        onProgress(Math.min(progress, 100));
      }
    }

    return allPatients;
  }

  async submitAssessment(results: AssessmentResults) {
    const response = await this.fetchWithRetry(
      `${API_BASE_URL}/submit-assessment`,
      {
        method: "POST",
        body: JSON.stringify(results),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to submit assessment: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
