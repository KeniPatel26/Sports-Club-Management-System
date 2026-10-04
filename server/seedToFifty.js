import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { existsSync } from 'node:fs';
import Activity from './src/models/Activity.js';
import Attendance from './src/models/Attendance.js';
import AuditLog from './src/models/AuditLog.js';
import Booking from './src/models/Booking.js';
import ClubSetting from './src/models/ClubSetting.js';
import Court from './src/models/Court.js';
import DiningTable from './src/models/DiningTable.js';
import Expense from './src/models/Expense.js';
import InventoryTransaction from './src/models/InventoryTransaction.js';
import Invoice from './src/models/Invoice.js';
import Lead from './src/models/Lead.js';
import Leave from './src/models/Leave.js';
import MemberProfile from './src/models/MemberProfile.js';
import Membership from './src/models/Membership.js';
import MembershipPlan from './src/models/MembershipPlan.js';
import Notification from './src/models/Notification.js';
import Order from './src/models/Order.js';
import Payment from './src/models/Payment.js';
import Payroll from './src/models/Payroll.js';
import Product from './src/models/Product.js';
import Project from './src/models/Project.js';
import Shift from './src/models/Shift.js';
import StaffProfile from './src/models/StaffProfile.js';
import Task from './src/models/Task.js';
import User from './src/models/User.js';

dotenv.config({ path: existsSync('.env') ? '.env' : '../.env' });

const TARGET_COUNT = 50;
const foundation = [User, Court, Product, MembershipPlan, Project];
const allModels = [
  ...foundation,
  Activity, Attendance, AuditLog, Booking, ClubSetting, DiningTable, Expense,
  InventoryTransaction, Invoice, Lead, Leave, MemberProfile, Membership,
  Notification, Order, Payment, Payroll, Shift, StaffProfile, Task,
];

const makeString = (field, modelName, sequence, passwordHash) => {
  const key = field.toLowerCase();
  if (key.includes('email')) return `seed.${modelName.toLowerCase()}.${sequence}@example.com`;
  if (key.includes('phone')) return `+919${String(sequence).padStart(9, '0')}`;
  if (key.includes('password')) return passwordHash;
  if (key.includes('firstname')) return `Seed${sequence}`;
  if (key.includes('lastname')) return 'Record';
  if (key.includes('name')) return `${modelName} ${sequence}`;
  if (key.includes('title')) return `${modelName} entry ${sequence}`;
  if (key.includes('description')) return `Generated ${modelName} record ${sequence}`;
  if (key.includes('reason')) return `Seed data entry ${sequence}`;
  if (key.includes('employeeid')) return `EMP-SEED-${sequence}`;
  if (key.includes('invoicenumber')) return `INV-SEED-${sequence}`;
  if (key.includes('paymentid')) return `PAY-SEED-${sequence}`;
  if (key.includes('datekey')) return `2099-01-${String((sequence % 28) + 1).padStart(2, '0')}-${sequence}`;
  if (key.includes('monthyear')) return `2099-${String((sequence % 12) + 1).padStart(2, '0')}-${sequence}`;
  if (key.includes('action')) return `Seeded ${modelName} activity ${sequence}`;
  if (key.includes('entity')) return modelName;
  return `Seed ${sequence}`;
};

const getReferenceId = async (refName) => {
  const RefModel = mongoose.model(refName);
  const doc = await RefModel.findOne().select('_id').lean();
  if (!doc) throw new Error(`Cannot seed ${refName} reference: that collection has no records.`);
  return doc._id;
};

const createEmptyCollectionRecord = async (Model, sequence, passwordHash) => {
  const data = new Model().toObject();
  delete data._id;
  delete data.__v;
  return data;
};

const fillMissingRequiredFields = async (Model, data, sequence, passwordHash) => {
  for (const [field, path] of Object.entries(Model.schema.paths)) {
    if (!path.isRequired || data[field] !== undefined && data[field] !== null) continue;
    if (path.options.ref) {
      data[field] = await getReferenceId(path.options.ref);
    } else if (path.enumValues?.length) {
      data[field] = path.enumValues[sequence % path.enumValues.length];
    } else if (path.instance === 'String') {
      data[field] = makeString(field, Model.modelName, sequence, passwordHash);
    } else if (path.instance === 'Number') {
      data[field] = Math.max(1, path.options.min || 0);
    } else if (path.instance === 'Date') {
      data[field] = new Date(Date.UTC(2026, 0, (sequence % 28) + 1));
    } else if (path.instance === 'Boolean') {
      data[field] = false;
    }
  }
  return data;
};

const makeUnique = async (Model, data, sequence, passwordHash) => {
  for (const [indexFields, options] of Model.schema.indexes()) {
    if (!options.unique) continue;
    const fields = Object.keys(indexFields);
    for (const field of fields) {
      const path = Model.schema.path(field);
      if (path?.options.ref && fields.length === 1) {
        const RefModel = mongoose.model(path.options.ref);
        const refs = await RefModel.find().select('_id').lean();
        let available = null;
        for (const ref of refs) {
          if (!(await Model.exists({ [field]: ref._id }))) {
            available = ref._id;
            break;
          }
        }
        if (!available && RefModel.modelName === 'User' && ['MemberProfile', 'StaffProfile'].includes(Model.modelName)) {
          const role = Model.modelName === 'StaffProfile' ? 'STAFF' : 'MEMBER';
          const user = await User.create({
            firstName: 'Seed',
            lastName: `${Model.modelName}${sequence}`,
            email: `seed.${Model.modelName.toLowerCase()}.${sequence}@example.com`,
            phone: `+919${String(sequence + 1000).padStart(9, '0')}`,
            password: passwordHash,
            role,
            department: role === 'STAFF' ? 'SPORTS_SHOP' : null,
          });
          available = user._id;
        }
        if (!available) return false;
        data[field] = available;
      } else if (path?.instance === 'String') {
        data[field] = makeString(field, Model.modelName, sequence, passwordHash);
      } else if (path?.instance === 'Date') {
        data[field] = new Date(Date.UTC(2026, 0, (sequence % 28) + 1, 0, 0, sequence));
      }
    }
  }
  // Support databases that still have the legacy unique staff/date index.
  if (Model.modelName === 'Attendance') data.date = new Date(Date.UTC(2099, 0, sequence));
  return true;
};

const diversifyRecord = async (Model, data, sequence) => {
  for (const [field, path] of Object.entries(Model.schema.paths)) {
    if (path.enumValues?.length > 1) data[field] = path.enumValues[(sequence - 1) % path.enumValues.length];
    if (path.instance === 'Boolean') data[field] = sequence % 2 === 0;
    if (path.instance === 'Number' && data[field] !== undefined && Number.isFinite(Number(data[field]))) {
      data[field] = Math.max(path.options.min || 0, Number(data[field]) + (sequence % 7));
    }
    if (path.instance === 'Date') data[field] = new Date(Date.UTC(2026, sequence % 12, (sequence % 28) + 1));
  }

  if (Model.modelName === 'Product') {
    const categories = ['Rackets', 'Balls', 'Footwear', 'Apparel', 'Accessories', 'Protective Gear'];
    data.category = categories[(sequence - 1) % categories.length];
    data.name = `${data.category} item ${sequence}`;
    data.brand = ['Yonex', 'Wilson', 'Head', 'Adidas', 'Nike'][(sequence - 1) % 5];
    data.sku = `SKU-${String(sequence).padStart(4, '0')}`;
    data.price = 250 + ((sequence * 173) % 9000);
    data.stock = sequence % 19;
    data.lowStockThreshold = 5 + (sequence % 6);
    data.isAvailable = sequence % 9 !== 0;
  }

  if (Model.modelName === 'Order') {
    const orderType = sequence % 2 === 0 ? 'sports' : 'canteen';
    const products = await Product.find({ type: orderType }).select('_id name price').limit(100).lean();
    if (products.length) {
      const itemCount = 1 + (sequence % Math.min(4, products.length));
      data.items = Array.from({ length: itemCount }, (_, index) => {
        const product = products[(sequence + index) % products.length];
        return {
          product: product._id,
          name: product.name,
          quantity: 1 + ((sequence + index) % 3),
          price: product.price,
        };
      });
      data.type = orderType;
      data.subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      data.discount = sequence % 4 === 0 ? Math.round(data.subtotal * 0.1) : 0;
      data.total = Math.max(0, data.subtotal - data.discount);
      data.customerName = `Club customer ${sequence}`;
      data.fulfillment = ['pickup', 'delivery', 'counter'][(sequence - 1) % 3];
      data.status = ['pending', 'preparing', 'ready', 'completed', 'delivered', 'cancelled'][(sequence - 1) % 6];
      data.paymentStatus = ['completed', 'delivered'].includes(data.status) ? 'paid' : 'pending';
    }
  }
  return data;
};

const fillShopOrderCart = async (data, sequence) => {
  if (data.type !== 'sports' && data.type !== 'canteen') return data;
  const products = await Product.find({ type: data.type }).select('_id name price').limit(100).lean();
  if (!products.length) return data;
  const itemCount = 1 + (sequence % Math.min(4, products.length));
  data.items = Array.from({ length: itemCount }, (_, index) => {
    const product = products[(sequence + index) % products.length];
    return {
      product: product._id,
      name: product.name,
      quantity: 1 + ((sequence + index) % 3),
      price: product.price,
    };
  });
  data.subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  data.discount = sequence % 4 === 0 ? Math.round(data.subtotal * 0.1) : 0;
  data.total = Math.max(0, data.subtotal - data.discount);
  data.customerName = `Club customer ${sequence}`;
  return data;
};

const ensureEnumCoverage = async (Model, sourceDocs, passwordHash) => {
  const enumPaths = Object.entries(Model.schema.paths).filter(([field, path]) =>
    !field.includes('.') && path.enumValues?.length > 1
  );
  let count = await Model.countDocuments();
  for (const [field, path] of enumPaths) {
    const values = path.enumValues.filter((value) => value !== null && value !== undefined);
    const existingValues = await Model.distinct(field);
    for (const value of values) {
      if (existingValues.some((existing) => String(existing) === String(value))) continue;
      const sequence = count + 1;
      const source = sourceDocs.length ? sourceDocs[(sequence - 1) % sourceDocs.length] : null;
      const data = source ? { ...source } : await createEmptyCollectionRecord(Model, sequence, passwordHash);
      delete data._id;
      delete data.__v;
      delete data.createdAt;
      delete data.updatedAt;
      await fillMissingRequiredFields(Model, data, sequence, passwordHash);
      data[field] = value;
      if (Model.modelName === 'Order') await fillShopOrderCart(data, sequence);
      const uniqueReady = await makeUnique(Model, data, sequence, passwordHash);
      if (!uniqueReady) {
        existingValues.push(value);
        console.warn(`${Model.modelName}.${field}: skipped ${value}; unique references are exhausted`);
        continue;
      }
      await Model.create(data);
      count += 1;
      existingValues.push(value);
    }
  }
  return count;
};

const backfillSportsProductCatalog = async () => {
  const brands = ['Yonex', 'Wilson', 'Head', 'Adidas', 'Nike'];
  const products = await Product.find({ type: 'sports' }).select('_id sku brand category').lean();
  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const updates = {};
    if (!product.sku) updates.sku = `SKU-${product._id.toString().slice(-8).toUpperCase()}`;
    if (!product.brand) updates.brand = brands[index % brands.length];
    if (!product.category || product.category === 'General') {
      updates.category = ['Rackets', 'Balls', 'Footwear', 'Apparel', 'Accessories'][index % 5];
    }
    if (Object.keys(updates).length) await Product.updateOne({ _id: product._id }, { $set: updates });
  }
};

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odoo_ldce_db';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const passwordHash = await bcrypt.hash('SeedData@123', 10);

  // Parent collections are filled first so empty child collections can use valid references.
  const orderedModels = [...foundation, ...allModels.filter((Model) => !foundation.includes(Model))];
  for (const Model of orderedModels) {
    let count = await Model.countDocuments();
    const sourceDocs = await Model.find().lean();
    if (count >= TARGET_COUNT) {
      count = await ensureEnumCoverage(Model, sourceDocs, passwordHash);
      console.log(`${Model.modelName}: ${count} records; enum values covered`);
      continue;
    }

    while (count < TARGET_COUNT) {
      const sequence = count + 1;
      const source = sourceDocs.length ? sourceDocs[(sequence - 1) % sourceDocs.length] : null;
      const data = source
        ? { ...source }
        : await createEmptyCollectionRecord(Model, sequence, passwordHash);
      delete data._id;
      delete data.__v;
      delete data.createdAt;
      delete data.updatedAt;
      await fillMissingRequiredFields(Model, data, sequence, passwordHash);

      if (source) {
        for (const field of ['name', 'title', 'description']) {
          if (typeof data[field] === 'string' && !Model.schema.path(field)?.enumValues?.length) {
            data[field] = `${data[field]} (seed ${sequence})`;
          }
        }
      }

      await diversifyRecord(Model, data, sequence);
      if (Model.modelName === 'Order') await fillShopOrderCart(data, sequence);
      const uniqueReady = await makeUnique(Model, data, sequence, passwordHash);
      if (!uniqueReady) throw new Error(`${Model.modelName} reached a unique-reference limit before ${TARGET_COUNT} records.`);
      await Model.create(data);
      count += 1;
    }
    count = await ensureEnumCoverage(Model, sourceDocs, passwordHash);
    console.log(`${Model.modelName}: ${count} records; mixed seed data ready`);
  }

  await backfillSportsProductCatalog();

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Additive schema seeding failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
