"use client";

import { useRef, useState } from "react";

import { useCart } from "@/contexts/cart-context";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { Download, FileText, Printer } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useAction } from "@/hooks/use-action";

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
    getItemTotalAed,
    getTotalCC,
    clearCart,
  } = useCart();

  const { data: session } = useSession();
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
      <Card className="text-right" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ایجاد فاکتور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>برای ایجاد فاکتور، ابتدا کالاها را به سبد خرید اضافه کنید</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log(session);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const formatted = format(date, "yyyy/MM/dd - HH:mm");
    return `INV - ${session?.user.idNumber} - ${formatted}`;
  };

  const handlePrint = () => {
    const userInfo = {
      name: session?.user.name,
      idNumber: session?.user.idNumber,
    };

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      // 1. Calculate the total in AED before any other logic
      const totalAED = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      // 2. Generate the list of products
      const productLines = items
        .map((item) => {
          const namePart = `${item.quantity} ${item.product_name} ${item.offerQuantity && item.quantity > 0 ? `(Offer = ${item.offerQuantity})` : ""}`;
          return `${namePart.padEnd(45)} ${item.code}`;
        })
        .join("\n");

      // 3. Get the current month name
      const monthName = new Date().toLocaleString("en-US", { month: "long" });

      // 4. Assemble the final text content
      const textContent = `
${monthName.toLowerCase()}

${userInfo.name}
${userInfo.idNumber}
${pricingSettings.discountPercentage}%

${productLines}

total: ${totalAED.toFixed(2)} (${pricingSettings.exchangeRate} AED)

${getCartTotal().toLocaleString()} T
`;

      // 5. Write the content to the new window inside a <pre> tag
      printWindow.document.write(`
      <html>
        <head>
          <title>Order Summary ${generateInvoiceNumber()}</title>
          <style>
            body { 
              font-family: monospace; 
              font-size: 14px;
              margin: 1.5rem;
            }
          </style>
        </head>
        <body>
          <pre>${textContent}</pre>
        </body>
      </html>
    `);
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
      `Exchange Rate: 1 AED = ${pricingSettings.exchangeRate.toLocaleString()} T`,
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
      "Shipment (T)",
      "Offer",
      "Total (T)",
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

      // New formula for regular products: quantity * price * (exchangeRate * 1.05 * discount + 2100)
      const regularProductCost = Math.floor(
        item.quantity *
          item.price *
          (pricingSettings.exchangeRate *
            1.05 *
            (1 - pricingSettings.discountPercentage / 100) +
            2100),
      );

      // For offer products, we only add shipping cost: offerQuantity * price * 2100
      let offerShippingCost = 0;
      if (item.offerEnabled && item.offerQuantity) {
        offerShippingCost = Math.floor(item.offerQuantity * item.price * 2100);
      }

      const finalTotal = regularProductCost + offerShippingCost;

      const totalCC = item.cc * item.quantity;

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

    doc.text("Products Cost (AED):", totalsX, currentY);
    doc.text(`${getItemTotalAed().toLocaleString()}`, valuesX, currentY, {
      align: "right",
    });

    // Regular Products
    currentY += 6;
    doc.text("Regular Products:", totalsX, currentY);
    doc.text(`${getCartSubtotal().toLocaleString()} T`, valuesX, currentY, {
      align: "right",
    });

    // Offer Products Shipping
    currentY += 6;
    doc.text("Offer Products Shipping:", totalsX, currentY);
    doc.text(`${getCartShipping().toLocaleString()} T`, valuesX, currentY, {
      align: "right",
    });

    // Total CC Points (blue color)
    currentY += 6;
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text("Total CC:", totalsX, currentY);
    doc.text(`${getTotalCC().toFixed(3)}`, valuesX, currentY, {
      align: "right",
    });
    doc.setTextColor(...textColor);

    // Discount is now included in the calculation

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
    doc.text("Total Cost:", totalsX, currentY);
    doc.text(`${getCartTotal().toLocaleString()} T`, valuesX, currentY, {
      align: "right",
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
      // New formula for regular products: quantity * price * (exchangeRate * 1.05 * discount + 2100)
      const regularProductCost = Math.floor(
        item.quantity *
          item.price *
          (pricingSettings.exchangeRate *
            1.05 *
            (1 - pricingSettings.discountPercentage / 100) +
            2100),
      );

      // For offer products, we only add shipping cost: offerQuantity * price * 2100
      let offerShippingCost = 0;
      if (item.offerEnabled && item.offerQuantity) {
        offerShippingCost = Math.floor(item.offerQuantity * item.price * 2100);
      }

      const finalTotal = regularProductCost + offerShippingCost;

      return {
        productId: item.id,
        productName: item.product_name,
        productCode: item.code,
        quantity: item.quantity,
        freeQuantity:
          item.offerEnabled && item.offerQuantity ? item.offerQuantity : 0,
        unitPrice: item.price,
        ccPoints: item.cc * item.quantity,
        subtotal: finalTotal,
      };
    });

    const apiInvoiceData = {
      invoiceNumber: invoiceData.id,
      subtotal: getCartSubtotal(),
      discount: 0, // Discount is now included in the calculation
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
    <Card className="text-right" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          پیش‌نمایش فاکتور
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div id="invoice-content" ref={invoiceContentRef} className="space-y-6">
          {/* Invoice Header */}
          <div className="border-b pb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">فاکتور</h1>
            <p className="mt-2 text-gray-600">فاکتور سفارش محصول</p>
            {session?.user && (
              <p className="mt-1 text-sm text-gray-500">
                ایجاد شده توسط: {session.user.name || session.user.username}
              </p>
            )}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4 text-right">
            <div>
              <h3 className="mb-2 font-semibold">خلاصه سفارش</h3>
              <p className="text-sm">
                <strong>تعداد کل اقلام:</strong>{" "}
                {items
                  .reduce((sum, item) => sum + item.quantity, 0)
                  .toLocaleString("fa-IR")}
              </p>
              <p className="text-sm">
                <strong>محصولات منحصر به فرد:</strong>{" "}
                {items.length.toLocaleString("fa-IR")}
              </p>
              {pricingSettings.discountPercentage > 0 && (
                <p className="text-sm">
                  <strong>تخفیف:</strong>{" "}
                  {pricingSettings.discountPercentage.toLocaleString("fa-IR")}%
                </p>
              )}
            </div>
            <div>
              <h3 className="mb-2 font-semibold">جزئیات فاکتور</h3>
              <p className="text-sm">
                <strong>شماره فاکتور:</strong> {invoiceNumber}
              </p>
              <p className="text-sm">
                <strong>تاریخ:</strong> {currentDate}
              </p>
              <p className="text-sm">
                <strong>نرخ تبدیل ارز:</strong> ۱ درهم ={" "}
                {pricingSettings.exchangeRate.toLocaleString("fa-IR")} تومان
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="mb-3 font-semibold">اقلام سفارش</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-right">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2 font-semibold">کد</th>
                    <th className="border p-2 font-semibold">محصول</th>
                    <th className="border p-2 text-center font-semibold">
                      تعداد
                    </th>
                    <th className="border p-2 font-semibold">قیمت واحد</th>
                    <th className="border p-2 font-semibold">CC</th>
                    <th className="border p-2 text-center font-semibold">
                      پیشنهاد
                    </th>
                    <th className="border p-2 font-semibold">جمع کل</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    // New formula for regular products
                    const regularProductCost = Math.floor(
                      item.quantity *
                        item.price *
                        (pricingSettings.exchangeRate *
                          1.05 *
                          (1 - pricingSettings.discountPercentage / 100) +
                          2100),
                    );

                    let offerShippingCost = 0;
                    if (item.offerEnabled && item.offerQuantity) {
                      offerShippingCost = Math.floor(
                        item.offerQuantity * item.price * 2100,
                      );
                    }
                    const finalTotal = regularProductCost + offerShippingCost;

                    return (
                      <tr key={item.code} className="even:bg-gray-50">
                        <td className="border p-2 font-mono text-sm">
                          {item.code}
                        </td>
                        <td className="border p-2">{item.product_name}</td>
                        <td className="border p-2 text-center">
                          {item.quantity.toLocaleString("fa-IR")}
                          {item.offerEnabled && item.offerQuantity && (
                            <div className="text-xs text-green-600">
                              ( {item.offerQuantity.toLocaleString("fa-IR")}+
                              رایگان)
                            </div>
                          )}
                        </td>
                        <td className="border p-2">
                          {item.price.toLocaleString("fa-IR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="border p-2">
                          {item.cc.toLocaleString("fa-IR", {
                            minimumFractionDigits: 3,
                          })}
                        </td>
                        <td className="border p-2 text-center">
                          {item.offerEnabled && item.offerQuantity ? (
                            <Badge variant="destructive" className="text-xs">
                              {item.offerQuantity.toLocaleString("fa-IR")}+
                              رایگان
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="border p-2 font-semibold">
                          {finalTotal.toLocaleString("fa-IR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4">
            <Separator />
            <div className="flex justify-between">
              <span>هزینه محصولات (درهم):</span>
              <span>{getItemTotalAed().toLocaleString("fa-IR")}</span>
            </div>
            <div className="flex justify-between">
              <span>محصولات عادی:</span>
              <span>{getCartSubtotal().toLocaleString("fa-IR")} تومان</span>
            </div>
            <div className="flex justify-between">
              <span>ارسال محصولات پیشنهاد ویژه:</span>
              <span>{getCartShipping().toLocaleString("fa-IR")} تومان</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>مجموع CC:</span>
              <span>{getTotalCC().toLocaleString("fa-IR")}</span>
            </div>
            {pricingSettings.discountPercentage > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  تخفیف (
                  {pricingSettings.discountPercentage.toLocaleString("fa-IR")}
                  %):
                </span>
                <span>
                  {Math.floor(
                    ((getCartSubtotal() + getCartShipping()) *
                      pricingSettings.discountPercentage) /
                      100,
                  ).toLocaleString("fa-IR")}
                  - تومان
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>مبلغ کل:</span>
              <span>{getCartTotal().toLocaleString("fa-IR")} تومان</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-row-reverse gap-2 border-t pt-4">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="me-2 h-4 w-4" />
            خروجی متنی
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex-1"
          >
            <Download className="me-2 h-4 w-4" />
            دانلود PDF
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            className="flex-1"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                در حال ذخیره...
              </>
            ) : (
              <>
                <FileText className="me-2 h-4 w-4" />
                ایجاد فاکتور
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
