/** Enquiry service — typed calls for the enquiry domain. */

import { apiEndpoints } from "@constants/api-endpoints";

import { apiClient } from "@api/client";
import type { ApiClient } from "@api/types";

import type { PageResponse } from "@domain/api";
import type {
  Enquiry,
  EnquiryCreate,
  EnquiryListParams,
  EnquiryStatusUpdate,
  EnquiryUpdate,
} from "@domain/enquiry";

import { toQueryString } from "@utils/pagination";

export class EnquiryService {
  constructor(private readonly http: ApiClient = apiClient) {}

  /** Submit an enquiry (public — no auth required). */
  async create(payload: EnquiryCreate): Promise<Enquiry> {
    return this.http.post<Enquiry>(apiEndpoints.enquiries.create, payload, {
      meta: { skipAuthRefresh: true, retry: false },
    });
  }

  /** List enquiries (agent/admin). */
  async list(params: EnquiryListParams = {}): Promise<PageResponse<Enquiry>> {
    return this.http.get<PageResponse<Enquiry>>(
      `${apiEndpoints.enquiries.list}${toQueryString(params)}`
    );
  }

  /** Fetch a single enquiry (agent/admin). */
  async get(id: string): Promise<Enquiry> {
    return this.http.get<Enquiry>(apiEndpoints.enquiries.detail(id));
  }

  /** Update enquiry subject/message (agent/admin). */
  async update(id: string, payload: EnquiryUpdate): Promise<Enquiry> {
    return this.http.patch<Enquiry>(apiEndpoints.enquiries.detail(id), payload);
  }

  /** Transition an enquiry's status (agent/admin). */
  async updateStatus(id: string, payload: EnquiryStatusUpdate): Promise<Enquiry> {
    return this.http.patch<Enquiry>(`${apiEndpoints.enquiries.detail(id)}/status`, payload, {
      meta: { retry: false },
    });
  }
}

export const enquiryService = new EnquiryService();
