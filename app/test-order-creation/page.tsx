'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestOrderCreation() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [division, setDivision] = useState('dhaka');

  async function testOrderCreation() {
    try {
      setLoading(true);
      setResult(null);
      
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
          division: division, // Use the selected division
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
      setResult(result);

      if (response.ok) {
        console.log('✅ Order created successfully:', result);
      } else {
        console.error('❌ Order creation failed:', result);
      }
    } catch (error) {
      console.error('❌ Test failed with exception:', error);
      setResult({ error: 'Test failed with exception', details: String(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Test Order Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="division">Shipping Division</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger id="division">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dhaka">Dhaka</SelectItem>
                <SelectItem value="chittagong">Chittagong</SelectItem>
                <SelectItem value="rajshahi">Rajshahi</SelectItem>
                <SelectItem value="khulna">Khulna</SelectItem>
                <SelectItem value="barisal">Barisal</SelectItem>
                <SelectItem value="sylhet">Sylhet</SelectItem>
                <SelectItem value="rangpur">Rangpur</SelectItem>
                <SelectItem value="mymensingh">Mymensingh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={testOrderCreation} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Order Creation'}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                {result.id ? '✅ Order Created Successfully' : '❌ Order Creation Failed'}
              </h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}