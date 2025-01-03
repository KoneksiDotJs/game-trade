export interface CreateListingDTO {
    title: string;
    description: string;
    price: number;
    gameId: number;
    serviceTypeId: number;
  }
  
  export enum ListingStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    SOLD = 'SOLD',
    CANCELLED = 'CANCELLED'
  }