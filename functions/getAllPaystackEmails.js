// getAllPaystackCustomers.js
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY 

async function getAllCustomers() {
    let page = 1;
    const perPage = 50; // Paystack max per page is 50
    let allCustomers = [];

    try {
        while (true) {
            const res = await axios.get('https://api.paystack.co/customer', {
                params: { perPage, page },
                headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
            });

            const customers = res.data.data || [];

            if (customers.length === 0) break; // no more pages

            const mapped = customers.map(c => ({
                email: c.email,
                name: c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : 'No Name',
                phone: c.phone || 'No Phone Number',
                createdAt: c.createdAt || 'Unknown',
            }));

            allCustomers.push(...mapped);
            console.log(`Fetched page ${page}, got ${mapped.length} customers`);

            page++;
            await new Promise(r => setTimeout(r, 100)); // optional delay
        }

        console.log(`✅ Total customers fetched: ${allCustomers.length}`);

        fs.writeFileSync('paystack_customers.json', JSON.stringify(allCustomers, null, 2));
        console.log('Saved all customers to paystack_customers.json');

        return allCustomers;

    } catch (err) {
        console.error('Error fetching Paystack customers:', err.response?.data || err.message);
    }
}

getAllCustomers();
