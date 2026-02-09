/**
 * Test Polar Connection Script
 * Run this to debug checkout issues
 */

import { Polar } from "@polar-sh/sdk";

async function testPolarConnection() {
  console.log("Testing Polar Connection...\n");

  // Check environment variables
  console.log("Environment Variables:");
  console.log("- POLAR_ACCESS_TOKEN:", process.env.POLAR_ACCESS_TOKEN ? "✓ Set" : "✗ Missing");
  console.log("- POLAR_ORGANIZATION_ID:", process.env.POLAR_ORGANIZATION_ID ? "✓ Set" : "✗ Missing");
  console.log("- POLAR_TRIAL_PRODUCT_ID:", process.env.POLAR_TRIAL_PRODUCT_ID || "Not set");
  console.log("- POLAR_STARTER_PRODUCT_ID:", process.env.POLAR_STARTER_PRODUCT_ID || "Not set");
  console.log("- POLAR_PRO_PRODUCT_ID:", process.env.POLAR_PRO_PRODUCT_ID || "Not set");
  console.log("- POLAR_AGENCY_PRODUCT_ID:", process.env.POLAR_AGENCY_PRODUCT_ID || "Not set");
  console.log("- NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "Not set");
  console.log("");

  // Test Polar connection
  const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN || "",
    server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  });

  try {
    // Test organization fetch
    console.log("Testing Polar API Connection...");
    const orgId = process.env.POLAR_ORGANIZATION_ID;
    
    if (orgId) {
      const organization = await polar.organizations.get({ id: orgId });
      console.log("✓ Polar Organization:", organization.name);
    } else {
      console.log("✗ POLAR_ORGANIZATION_ID not set");
    }

    // Test product fetch
    console.log("\nTesting Product Fetch...");
    try {
      const products = await polar.products.list({ 
        organizationId: orgId,
        limit: 10 
      });
      
      console.log(`✓ Found ${products.items.length} products:`);
      products.items.forEach((product) => {
        console.log(`  - ${product.id}: ${product.name} (${product.type})`);
      });
    } catch (productError) {
      console.log("✗ Failed to fetch products:", productError.message);
    }

    // Test checkout creation (dry run - won't actually create)
    console.log("\nCheckout Configuration:");
    console.log("- Success URL:", `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`);
    
    console.log("\n✓ Polar connection test complete!");
    
  } catch (error) {
    console.log("✗ Polar Connection Failed:");
    console.log(error);
  }
}

testPolarConnection();
