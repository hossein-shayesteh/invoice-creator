'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { format } from 'date-fns';
import { Download, FileText, Printer } from 'lucide-react';

export function InvoiceGenerator() {
  const {
    state,
    getCartSubtotal,
    getCartShipping,
    getCartTotal,
    clearCart,
  } = useCart();

  const { items, pricingSettings } = state;

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Add items to cart to generate invoice</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const generateInvoiceNumber = () => {
  const date = new Date();
  const formatted = format(date, 'yyyyMMdd-HH:mm');
  return `INV-${formatted}`;
};

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${generateInvoiceNumber()}</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                :root {
                  --primary-color: #4f46e5;
                  --border-color: #e5e7eb;
                  --heading-color: #111827;
                  --text-color: #374151;
                  --light-bg: #f9fafb;
                }
                
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                
                body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  color: var(--text-color);
                  line-height: 1.5;
                  padding: 2rem;
                  max-width: 1000px;
                  margin: 0 auto;
                  background-color: white;
                }
                
                .invoice-container {
                  border: 1px solid var(--border-color);
                  border-radius: 0.5rem;
                  overflow: hidden;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                .invoice-header {
                  text-align: center;
                  padding: 2rem;
                  background-color: var(--light-bg);
                  border-bottom: 1px solid var(--border-color);
                }
                
                .invoice-header h1 {
                  font-size: 2rem;
                  font-weight: 700;
                  color: var(--heading-color);
                  margin-bottom: 0.5rem;
                  letter-spacing: -0.025em;
                }
                
                .invoice-header p {
                  color: #6b7280;
                }
                
                .invoice-body {
                  padding: 2rem;
                }
                
                .invoice-details {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 2rem;
                  flex-wrap: wrap;
                  gap: 1rem;
                }
                
                .invoice-details-group h3 {
                  font-size: 1rem;
                  font-weight: 600;
                  color: var(--heading-color);
                  margin-bottom: 0.75rem;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                
                .invoice-details-group p {
                  margin-bottom: 0.5rem;
                  font-size: 0.875rem;
                }
                
                .invoice-details-group p strong {
                  font-weight: 600;
                  color: var(--heading-color);
                }
                
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 2rem;
                  font-size: 0.875rem;
                }
                
                th {
                  background-color: var(--light-bg);
                  font-weight: 600;
                  color: var(--heading-color);
                  text-align: left;
                  padding: 0.75rem 1rem;
                  border-top: 1px solid var(--border-color);
                  border-bottom: 1px solid var(--border-color);
                }
                
                td {
                  padding: 0.75rem 1rem;
                  border-bottom: 1px solid var(--border-color);
                  vertical-align: top;
                }
                
                .text-center {
                  text-align: center;
                }
                
                .text-right {
                  text-align: right;
                }
                
                .offer-badge {
                  display: inline-block;
                  background-color: #fee2e2;
                  color: #b91c1c;
                  font-size: 0.75rem;
                  font-weight: 600;
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.25rem;
                }
                
                .effective-qty {
                  font-size: 0.75rem;
                  color: #047857;
                  margin-top: 0.25rem;
                }
                
                .totals {
                  margin-top: 2rem;
                  border-top: 1px solid var(--border-color);
                  padding-top: 1rem;
                }
                
                .totals-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 0.5rem 0;
                }
                
                .discount-row {
                  color: #047857;
                }
                
                .total-row {
                  font-weight: 700;
                  color: var(--heading-color);
                  font-size: 1.125rem;
                  padding-top: 0.5rem;
                  margin-top: 0.5rem;
                  border-top: 2px solid var(--border-color);
                }
                
                .footer {
                  margin-top: 3rem;
                  text-align: center;
                  color: #6b7280;
                  font-size: 0.875rem;
                }
                
                @media print {
                  body {
                    padding: 0;
                    background: none;
                  }
                  
                  .invoice-container {
                    box-shadow: none;
                    border: none;
                  }
                  
                  @page {
                    margin: 1cm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                <div class="invoice-header">
                  <h1>INVOICE</h1>
                  <p>Product Order Invoice</p>
                </div>
                
                <div class="invoice-body">
                  <div class="invoice-details">
                    <div class="invoice-details-group">
                      <h3>Invoice Details</h3>
                      <p><strong>Invoice #:</strong> ${generateInvoiceNumber()}</p>
                      <p><strong>Date:</strong> ${format(new Date(), 'PPP')}</p>
                      <p><strong>Exchange Rate:</strong> 1 AED = ${pricingSettings.exchangeRate.toLocaleString()} IRR</p>
                    </div>
                    
                    <div class="invoice-details-group">
                      <h3>Order Summary</h3>
                      <p><strong>Total Items:</strong> ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                      <p><strong>Unique Products:</strong> ${items.length}</p>
                      ${pricingSettings.discountPercentage > 0 ? 
                        `<p><strong>Discount:</strong> ${pricingSettings.discountPercentage}%</p>` : ''}
                    </div>
                  </div>
                  
                  <h3 style="margin-bottom: 1rem; font-size: 1rem; font-weight: 600; color: var(--heading-color);">Order Items</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Product</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Unit Price (AED)</th>
                        <th class="text-right">Shipping (CC)</th>
                        <th class="text-center">Offer</th>
                        <th class="text-right">Total (IRR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items.map(item => {
                        const effectiveQuantity = item.offerEnabled && item.offer 
                          ? Math.ceil(item.quantity / item.offer) 
                          : item.quantity;
                        const productCost = item.price * effectiveQuantity * pricingSettings.exchangeRate;
                        const shippingCost = item.cc * item.quantity * pricingSettings.exchangeRate;
                        const itemTotal = productCost + shippingCost;
                        const discountAmount = (itemTotal * pricingSettings.discountPercentage) / 100;
                        const finalTotal = itemTotal - discountAmount;
                        
                        return `
                          <tr>
                            <td>${item.code}</td>
                            <td>${item.product_name}</td>
                            <td class="text-center">
                              ${item.quantity}
                              ${item.offerEnabled && item.offer ? 
                                `<div class="effective-qty">(Pay for ${effectiveQuantity})</div>` : ''}
                            </td>
                            <td class="text-right">${item.price.toFixed(2)}</td>
                            <td class="text-right">${item.cc.toFixed(3)}</td>
                            <td class="text-center">
                              ${item.offerEnabled && item.offer ? 
                                `<span class="offer-badge">${item.offer} for 1</span>` : '-'}
                            </td>
                            <td class="text-right">${finalTotal.toLocaleString()}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                  
                  <div class="totals">
                    <div class="totals-row">
                      <span>Subtotal:</span>
                      <span>${getCartSubtotal().toLocaleString()} IRR</span>
                    </div>
                    <div class="totals-row">
                      <span>Shipping:</span>
                      <span>${getCartShipping().toLocaleString()} IRR</span>
                    </div>
                    ${pricingSettings.discountPercentage > 0 ? `
                      <div class="totals-row discount-row">
                        <span>Discount (${pricingSettings.discountPercentage}%):</span>
                        <span>-${(((getCartSubtotal() + getCartShipping()) * pricingSettings.discountPercentage) / 100).toLocaleString()} IRR</span>
                      </div>
                    ` : ''}
                    <div class="totals-row total-row">
                      <span>Total Amount:</span>
                      <span>${getCartTotal().toLocaleString()} IRR</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for your business!</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadPDF = () => {
    // For a real implementation, you would use a library like jsPDF or react-pdf
    // For now, we'll trigger the print dialog which allows saving as PDF
    handlePrint();
  };

  const handleGenerateInvoice = () => {
    const invoiceData = {
      id: generateInvoiceNumber(),
      date: new Date().toISOString(),
      items: items,
      subtotal: getCartSubtotal(),
      shipping: getCartShipping(),
      total: getCartTotal(),
      exchangeRate: pricingSettings.exchangeRate,
      discount: pricingSettings.discountPercentage,
    };

    // Save to localStorage for order history
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    existingInvoices.push(invoiceData);
    localStorage.setItem('invoices', JSON.stringify(existingInvoices));

    // Clear cart after generating invoice
    clearCart();
    
    alert(`Invoice ${invoiceData.id} generated successfully!`);
  };

  const invoiceNumber = generateInvoiceNumber();
  const currentDate = format(new Date(), 'PPP');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Invoice Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div id="invoice-content" className="space-y-6">
          {/* Invoice Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-gray-600 mt-2">Product Order Invoice</p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Invoice Details</h3>
              <p className="text-sm"><strong>Invoice #:</strong> {invoiceNumber}</p>
              <p className="text-sm"><strong>Date:</strong> {currentDate}</p>
              <p className="text-sm"><strong>Exchange Rate:</strong> 1 AED = {pricingSettings.exchangeRate.toLocaleString()} IRR</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <p className="text-sm"><strong>Total Items:</strong> {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              <p className="text-sm"><strong>Unique Products:</strong> {items.length}</p>
              {pricingSettings.discountPercentage > 0 && (
                <p className="text-sm"><strong>Discount:</strong> {pricingSettings.discountPercentage}%</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left">Code</th>
                    <th className="border border-gray-200 px-3 py-2 text-left">Product</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Qty</th>
                    <th className="border border-gray-200 px-3 py-2 text-right">Unit Price (AED)</th>
                    <th className="border border-gray-200 px-3 py-2 text-right">Shipping (CC)</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Offer</th>
                    <th className="border border-gray-200 px-3 py-2 text-right">Total (IRR)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const effectiveQuantity = item.offerEnabled && item.offer 
                      ? Math.ceil(item.quantity / item.offer) 
                      : item.quantity;
                    const productCost = item.price * effectiveQuantity * pricingSettings.exchangeRate;
                    const shippingCost = item.cc * item.quantity * pricingSettings.exchangeRate;
                    const itemTotal = productCost + shippingCost;
                    const discountAmount = (itemTotal * pricingSettings.discountPercentage) / 100;
                    const finalTotal = itemTotal - discountAmount;

                    return (
                      <tr key={item.code}>
                        <td className="border border-gray-200 px-3 py-2">{item.code}</td>
                        <td className="border border-gray-200 px-3 py-2">{item.product_name}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          {item.quantity}
                          {item.offerEnabled && item.offer && (
                            <div className="text-xs text-green-600">
                              (Pay for {effectiveQuantity})
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-right">{item.price.toFixed(2)}</td>
                        <td className="border border-gray-200 px-3 py-2 text-right">{item.cc.toFixed(3)}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          {item.offerEnabled && item.offer ? (
                            <Badge variant="destructive" className="text-xs">
                              {item.offer} for 1
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-right">
                          {finalTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{getCartSubtotal().toLocaleString()} IRR</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{getCartShipping().toLocaleString()} IRR</span>
            </div>
            {pricingSettings.discountPercentage > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({pricingSettings.discountPercentage}%):</span>
                <span>-{(((getCartSubtotal() + getCartShipping()) * pricingSettings.discountPercentage) / 100).toLocaleString()} IRR</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span>{getCartTotal().toLocaleString()} IRR</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleGenerateInvoice} className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}