/* ---------- Request Parameters ---------- */
export interface ManageParams {
  event: string;
  name?: string;
  title?: string;
  userId?: number;
}

export interface ActivityNotiParams {
  size: number;
  sort: string;
  type: number;
  page?: number;
}
