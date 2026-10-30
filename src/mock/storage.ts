export interface MockCommandReceipt {
  id:string;profileId:string;sessionId:string;fingerprint:string
  accepted:boolean;reason?:string;revision:number;createdAt:number
}
