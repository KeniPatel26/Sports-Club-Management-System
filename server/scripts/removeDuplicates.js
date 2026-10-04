import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';

dotenv.config({ path: existsSync('.env') ? '.env' : '../.env' });
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odoo_ldce_db';

const normalizeStr = (val) => (val ? String(val).trim().toLowerCase() : '');
const normalizeDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const getBusinessKey = (colName, doc) => {
  switch (colName) {
    case 'users': {
      const email = normalizeStr(doc.email);
      const phone = normalizeStr(doc.phone);
      return email ? `email:${email}` : (phone ? `phone:${phone}` : null);
    }
    case 'courts': {
      const name = normalizeStr(doc.name);
      return name ? `court:${name}` : null;
    }
    case 'products': {
      const name = normalizeStr(doc.name);
      const type = normalizeStr(doc.type);
      return name && type ? `prod:${name}_${type}` : null;
    }
    case 'membershipplans': {
      const name = normalizeStr(doc.name || doc.tier);
      return name ? `plan:${name}` : null;
    }
    case 'diningtables': {
      const num = normalizeStr(doc.tableNumber);
      return num ? `table:${num}` : null;
    }
    case 'projects': {
      const name = normalizeStr(doc.name || doc.title);
      return name ? `proj:${name}` : null;
    }
    case 'leads': {
      const email = normalizeStr(doc.email);
      const phone = normalizeStr(doc.phone);
      const name = normalizeStr(doc.name);
      return email ? `lead_email:${email}` : (phone ? `lead_phone:${phone}` : `lead_name:${name}`);
    }
    case 'clubsettings': {
      // Single global settings document for the club
      return 'singleton_club_setting';
    }
    case 'memberprofiles': {
      const user = String(doc.user || doc.member || '');
      return user ? `mp_user:${user}` : null;
    }
    case 'staffprofiles': {
      const user = String(doc.user || doc.staff || '');
      const empId = normalizeStr(doc.employeeId);
      return user ? `sp_user:${user}` : (empId ? `sp_emp:${empId}` : null);
    }
    case 'shifts': {
      const name = normalizeStr(doc.name);
      const type = normalizeStr(doc.shiftType);
      const start = normalizeStr(doc.startTime);
      const end = normalizeStr(doc.endTime);
      return `shift:${name}_${type}_${start}_${end}`;
    }
    case 'attendances': {
      const emp = String(doc.staff || doc.employee || doc.user || '');
      const date = doc.dateKey || normalizeDate(doc.date);
      return emp && date ? `att:${emp}_${date}` : null;
    }
    case 'leaves': {
      const staff = String(doc.staff || doc.employee || '');
      const sDate = normalizeDate(doc.startDate);
      const eDate = normalizeDate(doc.endDate);
      return staff && sDate ? `leave:${staff}_${sDate}_${eDate}` : null;
    }
    case 'payrolls': {
      const emp = String(doc.staff || doc.employee || doc.user || '');
      const my = normalizeStr(doc.monthYear) || `${doc.month || ''}_${doc.year || ''}`;
      return emp && my ? `payroll:${emp}_${my}` : null;
    }
    case 'bookings': {
      const court = String(doc.court || '');
      const date = normalizeDate(doc.date);
      const startTime = normalizeStr(doc.startTime);
      return court && date && startTime ? `booking:${court}_${date}_${startTime}` : null;
    }
    case 'orders': {
      const memberOrCust = String(doc.member || doc.customerName || '').trim();
      const type = normalizeStr(doc.type);
      const total = Number(doc.total || 0).toFixed(2);
      const items = (doc.items || []).map(i => `${i.product || i.name}_${i.quantity}_${i.price}`).sort().join('|');
      const minute = doc.createdAt ? new Date(doc.createdAt).toISOString().slice(0, 16) : '';
      return `order:${memberOrCust}_${type}_${total}_${items}_${minute}`;
    }
    case 'expenses': {
      const title = normalizeStr(doc.title);
      const amount = Number(doc.amount || 0).toFixed(2);
      const category = normalizeStr(doc.category);
      const date = normalizeDate(doc.date);
      return `expense:${title}_${amount}_${category}_${date}`;
    }
    case 'invoices': {
      const invNum = normalizeStr(doc.invoiceNumber);
      return invNum ? `inv:${invNum}` : null;
    }
    case 'payments': {
      const tx = normalizeStr(doc.transactionId);
      const payId = normalizeStr(doc.paymentId);
      return tx ? `pay_tx:${tx}` : (payId ? `pay_id:${payId}` : null);
    }
    case 'memberships': {
      const member = String(doc.member || doc.user || '');
      const plan = String(doc.plan || '');
      const sDate = normalizeDate(doc.startDate);
      return member && plan ? `membership:${member}_${plan}_${sDate}` : null;
    }
    case 'tasks': {
      const title = normalizeStr(doc.title);
      const proj = String(doc.project || '');
      return title ? `task:${title}_${proj}` : null;
    }
    case 'activities': {
      const u = String(doc.userId || doc.user || '');
      const act = normalizeStr(doc.action);
      const ent = normalizeStr(doc.entity);
      const eid = String(doc.entityId || '');
      const d = normalizeDate(doc.createdAt);
      return `act:${u}_${act}_${ent}_${eid}_${d}`;
    }
    case 'auditlogs': {
      const u = String(doc.userId || doc.user || '');
      const act = normalizeStr(doc.action);
      const ent = normalizeStr(doc.entity);
      const eid = String(doc.entityId || '');
      const d = normalizeDate(doc.createdAt);
      return `audit:${u}_${act}_${ent}_${eid}_${d}`;
    }
    case 'notifications': {
      const rec = String(doc.recipient || doc.user || '');
      const tit = normalizeStr(doc.title);
      const msg = normalizeStr(doc.message);
      return rec && tit ? `notif:${rec}_${tit}_${msg}` : null;
    }
    case 'inventorytransactions': {
      const prod = String(doc.product || '');
      const typ = normalizeStr(doc.type);
      const qty = String(doc.quantity || '');
      const d = normalizeDate(doc.date || doc.createdAt);
      const rsn = normalizeStr(doc.reason);
      return prod && qty ? `inv_tx:${prod}_${typ}_${qty}_${rsn}_${d}` : null;
    }
    default:
      return null;
  }
};

async function removeAllDuplicates() {
  try {
    console.log('Connecting to database:', uri);
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    console.log(`Connected to database [${mongoose.connection.name}]. Scanning for duplicates...`);

    const collections = await db.listCollections().toArray();
    const results = [];
    let grandTotalDeleted = 0;

    for (const col of collections) {
      const colName = col.name;
      if (colName.startsWith('system.')) continue;

      const docs = await db.collection(colName).find().sort({ _id: 1 }).toArray();
      if (!docs.length) continue;

      const seenExactContent = new Map();
      const seenBusinessKey = new Map();
      const duplicateIdsToDelete = [];

      for (const doc of docs) {
        // 1. Check exact content duplication (excluding _id, timestamps, __v)
        const copy = { ...doc };
        delete copy._id;
        delete copy.createdAt;
        delete copy.updatedAt;
        delete copy.__v;
        const serialized = JSON.stringify(copy);

        if (seenExactContent.has(serialized)) {
          duplicateIdsToDelete.push(doc._id);
          continue;
        }

        // 2. Check business logical key duplication
        const bizKey = getBusinessKey(colName, doc);
        if (bizKey) {
          if (seenBusinessKey.has(bizKey)) {
            duplicateIdsToDelete.push(doc._id);
            continue;
          }
          seenBusinessKey.set(bizKey, doc._id);
        }

        seenExactContent.set(serialized, doc._id);
      }

      // Execute deletion of duplicates for this collection
      if (duplicateIdsToDelete.length > 0) {
        const deleteRes = await db.collection(colName).deleteMany({
          _id: { $in: duplicateIdsToDelete },
        });
        grandTotalDeleted += deleteRes.deletedCount;
      }

      const finalCount = await db.collection(colName).countDocuments();
      results.push({
        Collection: colName,
        'Original Count': docs.length,
        'Duplicates Removed': duplicateIdsToDelete.length,
        'Remaining Clean Count': finalCount,
      });
    }

    console.log('\n=================== DEDUPLICATION REPORT ===================');
    console.table(results);
    console.log(`============================================================`);
    console.log(`🎉 Cleanup completed successfully! Removed ${grandTotalDeleted} duplicate entries.`);
    console.log(`============================================================\n`);

  } catch (err) {
    console.error('Deduplication failed with error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

removeAllDuplicates();
