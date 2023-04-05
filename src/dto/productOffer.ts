export interface ProductOffer {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  channelId: number;
  price: number;
  status: 0 | 1 | 2 | 3 | 4;
  dateExpired: string;
  isDeleted: boolean;
  dateUpdated: string;
  dateCreated: string;
}

/* ---------- Request Parameters ---------- */

export interface PostProductOfferData {
  productId: number;
  channelId: number;
  price: number;
}
