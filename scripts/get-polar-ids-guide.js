#!/usr/bin/env node

// Simple script to help you get product IDs from Polar
// Run this after installing dependencies

console.log('🎯 To get your Polar Product IDs:')
console.log('='.repeat(50))
console.log('\n1. Go to https://polar.sh')
console.log('2. Navigate to your Organization → Products')
console.log('3. Click on each product (Starter, Pro, Agency)')
console.log('4. The product ID is in the URL bar:')
console.log('   https://polar.sh/dashboard/products/{PRODUCT_ID}')
console.log('\n5. Also note the Price ID from the product details page')

console.log('\n📝 Example Product IDs format:')
console.log('   Starter: prod_1234567890abcdef')
console.log('   Pro: prod_abcdef1234567890')
console.log('   Agency: prod_7890abcdef123456')

console.log('\n✅ Add these to your .env.local:')
console.log('\n# Polar Product IDs')
console.log('POLAR_STARTER_PRODUCT_ID=your_starter_product_id')
console.log('POLAR_PRO_PRODUCT_ID=your_pro_product_id')
console.log('POLAR_AGENCY_PRODUCT_ID=your_agency_product_id')

console.log('\n# Polar Price IDs (from product details)')
console.log('POLAR_STARTER_PRICE_ID=your_starter_price_id')
console.log('POLAR_PRO_PRICE_ID=your_pro_price_id')
console.log('POLAR_AGENCY_PRICE_ID=your_agency_price_id')

console.log('\n🔧 After you get the IDs:')
console.log('1. Add them to .env.local')
console.log('2. Set up webhooks in Polar dashboard')
console.log('3. Test the integration with test card: 4242424242424242')

console.log('\n📚 Need help? Check the full setup guide:')
console.log('   cat docs/POLAR_SETUP.md')