// Test script for order creation

async function testOrderCreation() {
  try {
    console.log('Starting order creation test...');
    
    // Sample order data
    const orderData = {
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '01712345678',
      },
      shipping: {
        address: 'Test Address',
        city: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1212',
      },
      payment: {
        method: 'cash-on-delivery',
        amount: 1500,
      },
      items: [
        {
          id: 1,
          name: 'Test Product',
          price: 1000,
          quantity: 1,
        },
      ],
      subtotal: 1000,
      tax: 50,
      shippingCost: 60,
      total: 1500,
    };

    console.log('Sending order data:', JSON.stringify(orderData, null, 2));

    // Send request to API
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Order created successfully:', result);
      console.log('Order ID:', result.id);
    } else {
      console.error('❌ Order creation failed:', result);
      console.error('Error details:', result.error);
      if (result.debug) {
        console.error('Debug information:', result.debug);
      }
    }
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Run the test
testOrderCreation();