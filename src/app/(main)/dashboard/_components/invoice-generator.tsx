"use client";

import { useRef, useState } from "react";

import { useCart } from "@/contexts/cart-context";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { Download, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

import { useAction } from "@/hooks/use-action";
import { useAuth } from "@/hooks/use-auth";

import { createInvoice } from "@/lib/actions/create-invoice";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function InvoiceGenerator() {
  const {
    state,
    getCartSubtotal,
    getCartShipping,
    getCartTotal,
    getTotalCC,
    clearCart,
  } = useCart();

  const { session } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const invoiceContentRef = useRef<HTMLDivElement>(null);

  const { items, pricingSettings } = state;

  const { execute: executeCreateInvoice } = useAction(createInvoice, {
    onSuccess: async (_data, message) => {
      toast.success(message);
      clearCart();
    },
    onError: async (err) => {
      toast.error(err);
    },
    onComplete: async () => {
      setIsSaving(false);
    },
  });

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Add items to cart to generate invoice</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const generateInvoiceNumber = () => {
    const date = new Date();
    const formatted = format(date, "yyyyMMdd-HH:mm");
    return `INV-${formatted}`;
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
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
                      <p><strong>Date:</strong> ${format(new Date(), "PPP")}</p>
                      <p><strong>Exchange Rate:</strong> 1 AED = ${pricingSettings.exchangeRate.toLocaleString()} IRR</p>
                    </div>
                    
                    <div class="invoice-details-group">
                      <h3>Order Summary</h3>
                      <p><strong>Total Items:</strong> ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                      <p><strong>Unique Products:</strong> ${items.length}</p>
                      ${
                        pricingSettings.discountPercentage > 0
                          ? `<p><strong>Discount:</strong> ${pricingSettings.discountPercentage}%</p>`
                          : ""
                      }
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
                        <th class="text-right">CC Points</th>
                        <th class="text-right">Shipment (IRR)</th>
                        <th class="text-center">Offer</th>
                        <th class="text-right">Total (IRR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items
                        .map((item) => {
                          const productCost = Math.floor(
                            item.price *
                              item.quantity *
                              pricingSettings.exchangeRate,
                          );
                          let shippingCost = Math.floor(
                            item.shipment * item.quantity,
                          );

                          if (item.offerEnabled && item.offerQuantity) {
                            shippingCost += Math.floor(
                              item.shipment * item.offerQuantity,
                            );
                          }

                          const itemTotal = productCost + shippingCost;
                          const discountAmount = Math.floor(
                            (itemTotal * pricingSettings.discountPercentage) /
                              100,
                          );
                          const finalTotal = itemTotal - discountAmount;

                          const totalQuantity =
                            item.quantity +
                            (item.offerEnabled && item.offerQuantity
                              ? item.offerQuantity
                              : 0);
                          const totalCC = item.cc * totalQuantity;

                          return `
                          <tr>
                            <td>${item.code}</td>
                            <td>${item.product_name}</td>
                            <td class="text-center">
                              ${item.quantity}
                              ${
                                item.offerEnabled && item.offerQuantity
                                  ? `<div class="effective-qty">(+${item.offerQuantity} free)</div>`
                                  : ""
                              }
                            </td>
                            <td class="text-right">${item.price.toFixed(2)}</td>
                            <td class="text-right">${totalCC.toFixed(3)}</td>
                            <td class="text-right">${item.shipment.toLocaleString()}</td>
                            <td class="text-center">
                              ${
                                item.offerEnabled && item.offerQuantity
                                  ? `<span class="offer-badge">+${item.offerQuantity} Free</span>`
                                  : "-"
                              }
                            </td>
                            <td class="text-right">${finalTotal.toLocaleString()}</td>
                          </tr>
                        `;
                        })
                        .join("")}
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
                    <div class="totals-row" style="color: #2563eb;">
                      <span>Total CC Points:</span>
                      <span>${getTotalCC().toFixed(3)}</span>
                    </div>
                    ${
                      pricingSettings.discountPercentage > 0
                        ? `
                      <div class="totals-row discount-row">
                        <span>Discount (${pricingSettings.discountPercentage}%):</span>
                        <span>-${Math.floor(((getCartSubtotal() + getCartShipping()) * pricingSettings.discountPercentage) / 100).toLocaleString()} IRR</span>
                      </div>
                    `
                        : ""
                    }
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
    if (!invoiceContentRef.current) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set document properties
    doc.setProperties({
      title: `Invoice ${invoiceNumber}`,
      subject: "Product Order Invoice",
      creator: session?.user?.name || session?.user?.username || "User",
    });

    // Colors matching your print CSS - explicitly typed as tuples
    const borderColor: [number, number, number] = [229, 231, 235]; // #e5e7eb
    const headingColor: [number, number, number] = [17, 24, 39]; // #111827
    const textColor: [number, number, number] = [55, 65, 81]; // #374151
    const lightBg: [number, number, number] = [249, 250, 251]; // #f9fafb
    const grayText: [number, number, number] = [107, 114, 128]; // #6b7280

    // Invoice container border (matching your print CSS)
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, 10, 190, 277, 2, 2, "S");

    // Invoice header with light background
    doc.setFillColor(...lightBg);
    doc.rect(10, 10, 190, 35, "F");
    doc.setDrawColor(...borderColor);
    doc.line(10, 45, 200, 45);

    // Header content
    doc.setTextColor(...headingColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", 105, 25, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.text("Product Order Invoice", 105, 33, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.text(`${session?.user.name}`, 105, 40, { align: "center" });

    // Invoice details section
    let currentY = 55;

    // Left column - Invoice Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...headingColor);
    doc.text("INVOICE DETAILS", 15, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...textColor);
    doc.text(`Invoice #: ${invoiceNumber}`, 15, currentY + 6);
    doc.text(`Date: ${currentDate}`, 15, currentY + 12);
    doc.text(
      `Exchange Rate: 1 AED = ${pricingSettings.exchangeRate.toLocaleString()} IRR`,
      15,
      currentY + 18,
    );

    // Right column - Order Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...headingColor);
    doc.text("ORDER SUMMARY", 110, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...textColor);
    doc.text(
      `Total Items: ${items.reduce((sum, item) => sum + item.quantity, 0)}`,
      110,
      currentY + 6,
    );
    doc.text(`Unique Products: ${items.length}`, 110, currentY + 12);

    if (pricingSettings.discountPercentage > 0) {
      doc.text(
        `Discount: ${pricingSettings.discountPercentage}%`,
        110,
        currentY + 18,
      );
    }

    currentY += 35;

    // Order Items title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...headingColor);
    doc.text("Order Items", 15, currentY);

    currentY += 8;

    // Table setup (matching your print table)
    const tableHeaders = [
      "Code",
      "Product",
      "Qty",
      "Unit Price (AED)",
      "CC Points",
      "Shipment (IRR)",
      "Offer",
      "Total (IRR)",
    ];
    const columnWidths = [20, 35, 15, 22, 18, 25, 15, 25];
    const columnX = [15, 35, 70, 85, 107, 125, 150, 165];

    // Table header background
    doc.setFillColor(...lightBg);
    doc.rect(10, currentY - 2, 190, 8, "F");

    // Table header borders
    doc.setDrawColor(...borderColor);
    doc.line(10, currentY - 2, 200, currentY - 2); // Top border
    doc.line(10, currentY + 6, 200, currentY + 6); // Bottom border

    // Table headers
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...headingColor);

    tableHeaders.forEach((header, index) => {
      const align = index <= 1 ? "left" : index === 6 ? "center" : "right";
      let x = columnX[index];

      if (align === "right") {
        x = columnX[index] + columnWidths[index] - 5;
      } else if (align === "center") {
        x = columnX[index] + columnWidths[index] / 2;
      }

      doc.text(header, x, currentY + 2, { align });
    });

    currentY += 10;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...textColor);

    items.forEach((item) => {
      // Check if we need a new page
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Calculate values exactly like in your print version
      const productCost = Math.floor(
        item.price * item.quantity * pricingSettings.exchangeRate,
      );
      let shippingCost = Math.floor(item.shipment * item.quantity);

      if (item.offerEnabled && item.offerQuantity) {
        shippingCost += Math.floor(item.shipment * item.offerQuantity);
      }

      const itemTotal = productCost + shippingCost;
      const discountAmount = Math.floor(
        (itemTotal * pricingSettings.discountPercentage) / 100,
      );
      const finalTotal = itemTotal - discountAmount;

      const totalQuantity =
        item.quantity +
        (item.offerEnabled && item.offerQuantity ? item.offerQuantity : 0);
      const totalCC = item.cc * totalQuantity;

      // Row border
      doc.setDrawColor(...borderColor);
      doc.line(10, currentY + 6, 200, currentY + 6);

      // Row data
      const rowData = [
        item.code,
        item.product_name.length > 20
          ? item.product_name.substring(0, 17) + "..."
          : item.product_name,
        item.quantity.toString(),
        item.price.toFixed(2),
        totalCC.toFixed(3),
        item.shipment.toLocaleString(),
        item.offerEnabled && item.offerQuantity
          ? `+${item.offerQuantity} Free`
          : "-",
        finalTotal.toLocaleString(),
      ];

      // Draw row data
      rowData.forEach((data, colIndex) => {
        const align =
          colIndex <= 1 ? "left" : colIndex === 6 ? "center" : "right";
        let x = columnX[colIndex];

        if (align === "right") {
          x = columnX[colIndex] + columnWidths[colIndex] - 5;
        } else if (align === "center") {
          x = columnX[colIndex] + columnWidths[colIndex] / 2;
        }

        // Special formatting for offers (red badge style)
        if (colIndex === 6 && item.offerEnabled && item.offerQuantity) {
          doc.setTextColor(185, 28, 28); // Red color for offer badge
          doc.text(data, x, currentY + 3, { align });
          doc.setTextColor(...textColor);
        } else {
          doc.text(data, x, currentY + 3, { align });
        }
      });

      // Add quantity details for offers (green text)
      if (item.offerEnabled && item.offerQuantity) {
        doc.setTextColor(4, 120, 87); // Green color
        doc.setFontSize(6);
        doc.text(`(+${item.offerQuantity} free)`, columnX[2], currentY + 8);
        doc.setFontSize(7);
        doc.setTextColor(...textColor);
      }

      currentY += 10;
    });

    // Totals section (matching your print CSS)
    currentY += 5;
    doc.setDrawColor(...borderColor);
    doc.line(10, currentY, 200, currentY); // Top border for totals
    currentY += 8;

    // Totals with right alignment
    const totalsX = 140;
    const valuesX = 195;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    // Subtotal
    doc.text("Subtotal:", totalsX, currentY);
    doc.text(`${getCartSubtotal().toLocaleString()} IRR`, valuesX, currentY, {
      align: "right",
    });

    // Shipping
    currentY += 6;
    doc.text("Shipping:", totalsX, currentY);
    doc.text(`${getCartShipping().toLocaleString()} IRR`, valuesX, currentY, {
      align: "right",
    });

    // Total CC Points (blue color)
    currentY += 6;
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text("Total CC Points:", totalsX, currentY);
    doc.text(`${getTotalCC().toFixed(3)}`, valuesX, currentY, {
      align: "right",
    });
    doc.setTextColor(...textColor);

    // Discount (if applicable, green color)
    if (pricingSettings.discountPercentage > 0) {
      currentY += 6;
      doc.setTextColor(4, 120, 87); // Green color
      doc.text(
        `Discount (${pricingSettings.discountPercentage}%):`,
        totalsX,
        currentY,
      );
      doc.text(
        `-${Math.floor(
          ((getCartSubtotal() + getCartShipping()) *
            pricingSettings.discountPercentage) /
            100,
        ).toLocaleString()} IRR`,
        valuesX,
        currentY,
        { align: "right" },
      );
      doc.setTextColor(...textColor);
    }

    // Total line
    currentY += 6;
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.line(totalsX, currentY, valuesX, currentY);

    // Final Total
    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...headingColor);
    doc.text("Total Amount:", totalsX, currentY);
    doc.text(`${getCartTotal().toLocaleString()} IRR`, valuesX, currentY, {
      align: "right",
    });

    // Footer
    currentY = 280;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...grayText);
    doc.text("Thank you for your business!", 105, currentY, {
      align: "center",
    });

    // Save the PDF
    doc.save(`Invoice-${invoiceNumber}.pdf`);
  };

  const handleGenerateInvoice = async () => {
    const invoiceData = {
      id: generateInvoiceNumber(),
      date: new Date().toISOString(),
      items: items,
      subtotal: getCartSubtotal(),
      shipping: getCartShipping(),
      total: getCartTotal(),
      totalCC: getTotalCC(),
      exchangeRate: pricingSettings.exchangeRate,
      discount: pricingSettings.discountPercentage,
    };

    // Save to database and localStorage
    setIsSaving(true);

    // Prepare invoice data for API
    const invoiceItemsData = items.map((item) => {
      const productCost = Math.floor(
        item.price * item.quantity * pricingSettings.exchangeRate,
      );
      let shippingCost = Math.floor(item.shipment * item.quantity);

      if (item.offerEnabled && item.offerQuantity) {
        shippingCost += Math.floor(item.shipment * item.offerQuantity);
      }

      const itemTotal = productCost + shippingCost;
      const discountAmount = Math.floor(
        (itemTotal * pricingSettings.discountPercentage) / 100,
      );
      const finalTotal = itemTotal - discountAmount;

      const totalQuantity =
        item.quantity +
        (item.offerEnabled && item.offerQuantity ? item.offerQuantity : 0);

      return {
        productId: item.id,
        productName: item.product_name,
        productCode: item.code,
        quantity: item.quantity,
        freeQuantity:
          item.offerEnabled && item.offerQuantity ? item.offerQuantity : 0,
        unitPrice: item.price,
        ccPoints: item.cc * totalQuantity,
        shipment: item.shipment,
        subtotal: finalTotal,
      };
    });

    const apiInvoiceData = {
      invoiceNumber: invoiceData.id,
      subtotal: getCartSubtotal(),
      shipping: getCartShipping(),
      discount: Math.floor(
        ((getCartSubtotal() + getCartShipping()) *
          pricingSettings.discountPercentage) /
          100,
      ),
      total: getCartTotal(),
      totalCC: getTotalCC(),
      exchangeRate: pricingSettings.exchangeRate,
      discountPercentage: pricingSettings.discountPercentage,
      items: invoiceItemsData,
    };

    await executeCreateInvoice({ ...apiInvoiceData });
  };

  const invoiceNumber = generateInvoiceNumber();
  const currentDate = format(new Date(), "PPP");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div id="invoice-content" ref={invoiceContentRef} className="space-y-6">
          {/* Invoice Header */}
          <div className="border-b pb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
            <p className="mt-2 text-gray-600">Product Order Invoice</p>
            {session?.user && (
              <p className="mt-1 text-sm text-gray-500">
                Created by: {session.user.name || session.user.username}
              </p>
            )}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 font-semibold">Invoice Details</h3>
              <p className="text-sm">
                <strong>Invoice #:</strong> {invoiceNumber}
              </p>
              <p className="text-sm">
                <strong>Date:</strong> {currentDate}
              </p>
              <p className="text-sm">
                <strong>Exchange Rate:</strong> 1 AED ={" "}
                {pricingSettings.exchangeRate.toLocaleString()} IRR
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Order Summary</h3>
              <p className="text-sm">
                <strong>Total Items:</strong>{" "}
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
              <p className="text-sm">
                <strong>Unique Products:</strong> {items.length}
              </p>
              {pricingSettings.discountPercentage > 0 && (
                <p className="text-sm">
                  <strong>Discount:</strong>{" "}
                  {pricingSettings.discountPercentage}%
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="mb-3 font-semibold">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left">
                      Code
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-left">
                      Product
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center">
                      Qty
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-right">
                      Unit Price (AED)
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-right">
                      CC Points
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-right">
                      Shipment (IRR)
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center">
                      Offer
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-right">
                      Total (IRR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const productCost = Math.floor(
                      item.price * item.quantity * pricingSettings.exchangeRate,
                    );
                    let shippingCost = Math.floor(
                      item.shipment * item.quantity,
                    );

                    if (item.offerEnabled && item.offerQuantity) {
                      shippingCost += Math.floor(
                        item.shipment * item.offerQuantity,
                      );
                    }

                    const itemTotal = productCost + shippingCost;
                    const discountAmount = Math.floor(
                      (itemTotal * pricingSettings.discountPercentage) / 100,
                    );
                    const finalTotal = itemTotal - discountAmount;

                    const totalQuantity =
                      item.quantity +
                      (item.offerEnabled && item.offerQuantity
                        ? item.offerQuantity
                        : 0);
                    const totalCC = item.cc * totalQuantity;

                    return (
                      <tr key={item.code}>
                        <td className="border border-gray-200 px-3 py-2">
                          {item.code}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          {item.product_name}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          {item.quantity}
                          {item.offerEnabled && item.offerQuantity && (
                            <div className="text-xs text-green-600">
                              (+{item.offerQuantity} free)
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-right">
                          {item.price.toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-right">
                          {totalCC.toFixed(3)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-right">
                          {item.shipment.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          {item.offerEnabled && item.offerQuantity ? (
                            <Badge variant="destructive" className="text-xs">
                              +{item.offerQuantity} Free
                            </Badge>
                          ) : (
                            "-"
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
            <div className="flex justify-between text-blue-600">
              <span>Total CC Points:</span>
              <span>{getTotalCC().toFixed(3)}</span>
            </div>
            {pricingSettings.discountPercentage > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({pricingSettings.discountPercentage}%):</span>
                <span>
                  -
                  {Math.floor(
                    ((getCartSubtotal() + getCartShipping()) *
                      pricingSettings.discountPercentage) /
                      100,
                  ).toLocaleString()}{" "}
                  IRR
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>{getCartTotal().toLocaleString()} IRR</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2 border-t pt-4">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            className="flex-1"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Saving...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
