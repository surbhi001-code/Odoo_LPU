require('dotenv').config({ path: require('path').join(__dirname, '../.env'), override: true, quiet: true });

const bcrypt = require('bcrypt');
const { User, Category, Product, Warehouse } = require('../src/database/models');
const warehouseService = require('../src/modules/warehouses/warehouse.service');
const productService = require('../src/modules/products/product.service');
const operationService = require('../src/modules/operations/operation.service');

const PASSWORD = 'Nourish#2026';
const MARKER = 'NCR-01';

async function ensureUser({ name, email, role }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) return existing;
    return User.create({
        name,
        email,
        password_hash: await bcrypt.hash(PASSWORD, 10),
        role,
        is_active: true,
    });
}

async function ensureCategory(name, description) {
    const existing = await Category.findOne({ where: { name } });
    if (existing) return existing;
    return Category.create({ name, description });
}

async function seed() {
    if (await Warehouse.findOne({ where: { code: MARKER } })) {
        console.log('NourishCart warehouses are already loaded. Your own products and operations are untouched.');
        return;
    }

    const { Op } = require('sequelize');
    const taken = await Product.findOne({
        where: { sku: { [Op.in]: ['8901725001847', '8901499002183', '8906006280476'] } },
    });
    if (taken) {
        console.log('Seed SKUs already exist. Stopped so your catalog is not overwritten.');
        return;
    }

    const manager = await ensureUser({
        name: 'Priya Nair',
        email: 'priya.nair@nourishcart.in',
        role: 'inventory_manager',
    });
    const staff = await ensureUser({
        name: 'Ananya Sharma',
        email: 'ananya.sharma@nourishcart.in',
        role: 'warehouse_staff',
    });

    const categories = {
        Staples: await ensureCategory('Staples', 'Atta, rice, pulses, and cooking oil'),
        Beverages: await ensureCategory('Beverages', 'Tea, coffee, juices, and packaged drinks'),
        'Personal Care': await ensureCategory('Personal Care', 'Soap, shampoo, and oral care'),
        Household: await ensureCategory('Household', 'Detergent, dishwash, and cleaners'),
        'Dairy & Frozen': await ensureCategory('Dairy & Frozen', 'Milk, paneer, and frozen foods'),
    };

    const delhi = await warehouseService.createWarehouse({
        name: 'NourishCart Kundli DC',
        code: MARKER,
        address: 'Plot 12, Kundli Food Park, Sonipat, Haryana 131028',
    });
    const mumbai = await warehouseService.createWarehouse({
        name: 'NourishCart Andheri Hub',
        code: 'BOM-02',
        address: 'Unit 4, MIDC Andheri East, Mumbai, Maharashtra 400093',
    });
    const bengaluru = await warehouseService.createWarehouse({
        name: 'NourishCart Whitefield Depot',
        code: 'BLR-03',
        address: 'Sy. No. 48, EPIP Zone, Whitefield, Bengaluru 560066',
    });

    const loc = {};
    for (const [key, warehouseId, name, code] of [
        ['delhiRecv', delhi.id, 'Receiving dock', 'NCR-RCV'],
        ['delhiBulk', delhi.id, 'Bulk storage', 'NCR-BLK'],
        ['delhiPick', delhi.id, 'Pick face A', 'NCR-PKA'],
        ['delhiShip', delhi.id, 'Dispatch bay', 'NCR-DSP'],
        ['bomRecv', mumbai.id, 'Receiving dock', 'BOM-RCV'],
        ['bomPick', mumbai.id, 'Pick face', 'BOM-PKA'],
        ['blrRecv', bengaluru.id, 'Receiving dock', 'BLR-RCV'],
        ['blrPick', bengaluru.id, 'Pick face', 'BLR-PKA'],
    ]) {
        loc[key] = await warehouseService.createLocation(warehouseId, { name, code });
    }

    const products = {};
    for (const row of [
        ['Staples', 'Aashirvaad Whole Wheat Atta 10 kg', '8901725001847', 'bag', 40, 80, loc.delhiBulk.id, 180],
        ['Staples', 'India Gate Basmati Rice 5 kg', '8901499002183', 'bag', 30, 60, loc.delhiBulk.id, 95],
        ['Staples', 'Fortune Soyabean Oil 5 L', '8906006280476', 'can', 25, 50, loc.delhiPick.id, 120],
        ['Staples', 'Tata Salt Iodised 1 kg', '8901138512071', 'pkt', 80, 200, loc.delhiPick.id, 90],
        ['Staples', 'Toor Dal Premium 1 kg', '8901030865428', 'pkt', 50, 100, loc.delhiPick.id, 12],
        ['Beverages', 'Tata Tea Gold 1 kg', '8901030866111', 'pkt', 35, 70, loc.delhiPick.id, 64],
        ['Beverages', 'Nescafe Classic 200 g', '8901058000474', 'jar', 20, 40, loc.delhiPick.id, 28],
        ['Beverages', 'Real Mixed Fruit Juice 1 L', '8901030651234', 'carton', 40, 80, loc.bomPick.id, 55],
        ['Beverages', 'Bisleri Packaged Water 1 L (case of 12)', '8901030689018', 'case', 20, 40, loc.blrPick.id, 18],
        ['Personal Care', 'Dove Beauty Bar 100 g (pack of 4)', '8901030657786', 'pack', 24, 48, loc.delhiPick.id, 36],
        ['Personal Care', 'Clinic Plus Shampoo 650 ml', '8901030690120', 'btl', 18, 36, loc.bomPick.id, 22],
        ['Personal Care', 'Colgate Strong Teeth 200 g', '8901314002286', 'tube', 30, 60, loc.delhiPick.id, 4],
        ['Household', 'Surf Excel Easy Wash 2 kg', '8901030693343', 'pkt', 22, 44, loc.delhiBulk.id, 31],
        ['Household', 'Vim Dishwash Gel 750 ml', '8901030694456', 'btl', 16, 32, loc.bomPick.id, 19],
        ['Household', 'Harpic Power Plus 1 L', '8901030695569', 'btl', 12, 24, loc.blrPick.id, 2],
        ['Dairy & Frozen', 'Amul Taaza Toned Milk 1 L', '8901262200123', 'pkt', 60, 120, loc.delhiRecv.id, 48],
        ['Dairy & Frozen', 'Amul Paneer 200 g', '8901262200451', 'pkt', 25, 50, null, 0],
        ['Dairy & Frozen', 'McCain French Fries 1.25 kg', '8901499108821', 'pkt', 15, 30, loc.blrPick.id, 9],
    ]) {
        const [category, name, sku, unit, reorder, reorderQty, locationId, stock] = row;
        products[sku] = await productService.createProduct({
            name,
            sku,
            category_id: categories[category].id,
            unit_of_measure: unit,
            reorder_point: reorder,
            reorder_qty: reorderQty,
            initial_stock: stock,
            location_id: stock > 0 ? locationId : undefined,
        }, manager.id);
    }

    async function document(type, payload, { validate = false, status, actor = manager } = {}) {
        const created = await operationService.createDocument({ type, ...payload }, actor.id);
        if (status) await operationService.updateDocument(created.document.id, { status });
        if (validate) await operationService.validateDocument(created.document.id, manager.id);
        return created.document;
    }

    await document('RECEIPT', {
        destination_location_id: loc.delhiRecv.id,
        partner_name: 'Adani Wilmar Ltd',
        notes: 'Weekly oil and staples inbound from Mundra CFS',
        scheduled_date: '2026-09-18',
        lines: [
            { product_id: products['8906006280476'].id, quantity: 40 },
            { product_id: products['8901725001847'].id, quantity: 40 },
        ],
    }, { validate: true });

    await document('RECEIPT', {
        destination_location_id: loc.bomRecv.id,
        partner_name: 'Hindustan Unilever Ltd',
        notes: 'West region personal care replenishment — PO HUL-W-4421',
        scheduled_date: '2026-09-20',
        lines: [
            { product_id: products['8901030690120'].id, quantity: 36 },
            { product_id: products['8901030694456'].id, quantity: 24 },
        ],
    }, { validate: true });

    await document('TRANSFER', {
        source_location_id: loc.delhiBulk.id,
        destination_location_id: loc.bomRecv.id,
        partner_name: 'Internal transfer',
        notes: 'Atta to Andheri hub before Navratri week',
        scheduled_date: '2026-09-22',
        lines: [{ product_id: products['8901725001847'].id, quantity: 25 }],
    }, { validate: true });

    await document('DELIVERY', {
        source_location_id: loc.delhiPick.id,
        partner_name: 'Reliance Smart Bazaar, Saket',
        notes: 'Store PO RS-88421',
        scheduled_date: '2026-09-24',
        lines: [
            { product_id: products['8901030866111'].id, quantity: 12 },
            { product_id: products['8901138512071'].id, quantity: 20 },
            { product_id: products['8901030657786'].id, quantity: 8 },
        ],
    }, { validate: true });

    await document('DELIVERY', {
        source_location_id: loc.blrPick.id,
        partner_name: 'More Supermarket, Indiranagar',
        notes: 'South store weekly drop — PO MORE-IND-118',
        scheduled_date: '2026-09-23',
        lines: [
            { product_id: products['8901030689018'].id, quantity: 6 },
            { product_id: products['8901499108821'].id, quantity: 4 },
        ],
    }, { validate: true });

    await document('ADJUSTMENT', {
        source_location_id: loc.delhiPick.id,
        partner_name: 'Cycle count — Pick face A',
        notes: 'Month-end count: salt short by 2, tea over by 6',
        scheduled_date: '2026-09-25',
        lines: [
            { product_id: products['8901138512071'].id, quantity: 68 },
            { product_id: products['8901030866111'].id, quantity: 58 },
        ],
    }, { validate: true });

    await document('RECEIPT', {
        destination_location_id: loc.delhiRecv.id,
        partner_name: 'Amul Fed Dairy',
        notes: 'Paneer restock — awaiting QC on dock',
        scheduled_date: '2026-09-27',
        lines: [
            { product_id: products['8901262200451'].id, quantity: 80 },
            { product_id: products['8901262200123'].id, quantity: 120 },
        ],
    }, { actor: staff, status: 'READY' });

    await document('DELIVERY', {
        source_location_id: loc.bomPick.id,
        partner_name: 'DMart, Malad West',
        notes: 'Packed; hold until payment confirmation',
        scheduled_date: '2026-09-28',
        lines: [
            { product_id: products['8901030651234'].id, quantity: 15 },
            { product_id: products['8901030690120'].id, quantity: 10 },
        ],
    }, { status: 'WAITING' });

    await document('TRANSFER', {
        source_location_id: loc.delhiPick.id,
        destination_location_id: loc.blrRecv.id,
        partner_name: 'Internal transfer',
        notes: 'Draft putaway — toothpaste to Whitefield receiving',
        scheduled_date: '2026-09-29',
        lines: [{ product_id: products['8901314002286'].id, quantity: 2 }],
    }, { actor: staff });

    console.log('NourishCart sample inventory loaded through the same services the API uses.');
    console.log('You can still add your own warehouses, products, and operations from the app.');
    console.log(`Logins (password ${PASSWORD}):`);
    console.log('  priya.nair@nourishcart.in     inventory_manager');
    console.log('  ananya.sharma@nourishcart.in   warehouse_staff');
}

seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });
