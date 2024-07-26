import mongoose,{Schema} from "mongoose";
// Create a schema for purchase 
const purchaseIdSchema = new Schema({
    purchaseId: String,
    secretKey: String
  });
  
export const PurchaseId  = mongoose.model("PurchaseId", purchaseIdSchema);