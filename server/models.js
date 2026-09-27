import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
		customerName: { type: String, required: true, trim: true },
		phone: { type: String, required: true, trim: true },
		item: { type: String, required: true, trim: true },
		reference: { type: String, trim: true, default: '' },
		status: { type: String, enum: ['pending', 'confirmed', 'declined'], default: 'pending' },
		callStatus: { type: String, enum: ['not_configured', 'sent', 'failed'], default: 'not_configured' },
	}, 
{ timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
