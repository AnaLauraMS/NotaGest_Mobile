import { Schema, model, Document } from 'mongoose';

export interface IRevokedToken extends Document {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const revokedTokenSchema = new Schema<IRevokedToken>({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now }
});

const RevokedToken = model<IRevokedToken>('RevokedToken', revokedTokenSchema);

export default RevokedToken;
