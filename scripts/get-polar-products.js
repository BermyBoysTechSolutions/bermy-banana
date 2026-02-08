#!/usr/bin/env node

// Script to fetch product IDs from Polar
const { PolarApi } = require('@polar-sh/sdk')

async function getProducts() {
  const polar = new PolarApi({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    organizationId: process.env.POLAR_ORGANIZATION_ID
  })

  try {
    console.log('🔍 Fetching products from Polar...')
    
    const products = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID
    })
    
    console.log('\n📦 Your Polar Products:')
    console.log('='.repeat(50))
    
    products.items?.forEach(product => {
      console.log(`\n📋 ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Type: ${product.type}`)
      console.log(`   Status: ${product.status}`)
      
      if (product.prices && product.prices.length > 0) {
        console.log('   Prices:')
        product.prices.forEach(price => {
          console.log(`     - ${price.type}: $${price.price_amount / 100} ${price.currency}`)
          console.log(`       Price ID: ${price.id}`)
        })
      }
    })
    
    console.log('\n✅ Copy these IDs to your .env.local file:')
    console.log('\n# Add these to your .env.local:')
    products.items?.forEach(product => {
      const envName = product.name.toUpperCase().replace(/\s+/g, '_')
      console.log(`POLAR_${envName}_PRODUCT_ID=${product.id}`)
      
      if (product.prices && product.prices[0]) {
        console.log(`POLAR_${envName}_PRICE_ID=${product.prices[0].id}`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.POLAR_ACCESS_TOKEN || !process.env.POLAR_ORGANIZATION_ID) {
    console.error('❌ Missing required environment variables:')
    console.error('   - POLAR_ACCESS_TOKEN')
    console.error('   - POLAR_ORGANIZATION_ID')
    process.exit(1)
  }
  
  getProducts()
}

module.exports = { getProducts }