const { db } = require('./db.js');

const prod = db.prepare("SELECT id, name, image FROM products WHERE id = 'MNA-1103'").get();
console.log('Product MNA-1103 in DB:', prod);

const allDiscounts = db.prepare("SELECT * FROM discounts").all();
console.log('Current discounts in DB:', allDiscounts);
