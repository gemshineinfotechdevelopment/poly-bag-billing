import React, { useState } from 'react';
import { Printer, ArrowLeft, Edit3, Share2, Download, Copy, Check, QrCode, FileText } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate, calculateInvoiceTotals } from '../utils/formatters';
import { BAG_TYPES } from '../constants/defaults';

export default function InvoicePreview({
  invoice,
  company,
  onBack,
  onEdit,
  onDuplicate
}) {
  const [copyType, setCopyType] = useState('ORIGINAL FOR RECIPIENT');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No invoice selected.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  const totals = calculateInvoiceTotals(invoice);
  const isInterstate = invoice.supplyType === 'interstate';

  // UPI payment QR string
  const upiUri = company?.upiId
    ? `upi://pay?pa=${encodeURIComponent(company.upiId)}&pn=${encodeURIComponent(company.name)}&am=${totals.grandTotal}&cu=INR&tn=${encodeURIComponent(`Inv ${invoice.invoiceNumber}`)}`
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top Toolbar (Hidden on Print) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </button>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Copy Type:</span>
            <select
              value={copyType}
              onChange={(e) => setCopyType(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white font-semibold text-indigo-700"
            >
              <option value="ORIGINAL FOR RECIPIENT">Original (Buyer)</option>
              <option value="DUPLICATE FOR TRANSPORTER">Duplicate (Transporter)</option>
              <option value="TRIPLICATE FOR SUPPLIER">Triplicate (Supplier)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(invoice)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Bill
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(invoice)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Page (A4 Paper Container) */}
      <div className="bg-white border border-slate-300 shadow-md rounded-xl p-8 print-shadow-none print:p-0 print:border-none print:rounded-none text-slate-900 text-sm">
        
        {/* Header Ribbon: Document Title & Copy Type */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-slate-800 mb-4">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">TAX INVOICE</h1>
            <p className="text-[11px] text-slate-500 font-medium">GST Compliant Packaging Invoice</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded uppercase tracking-wider border border-slate-300">
              {copyType}
            </span>
          </div>
        </div>

        {/* Company & Invoice Meta Header */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-200">
          {/* Seller / Supplier Details */}
          <div className="col-span-7 pr-2">
            <h2 className="text-base font-extrabold text-indigo-900">{company?.name || 'APEX POLY PACK INDUSTRIES'}</h2>
            <p className="text-xs text-slate-600 italic font-medium mb-1">{company?.tagline}</p>
            <p className="text-xs text-slate-700">{company?.address}</p>
            <p className="text-xs text-slate-700">{company?.city}, {company?.state} - {company?.pincode}</p>
            <div className="mt-2 text-xs space-y-0.5">
              <p><span className="font-semibold text-slate-800">GSTIN:</span> {company?.gstin} | <span className="font-semibold text-slate-800">PAN:</span> {company?.pan}</p>
              <p><span className="font-semibold text-slate-800">Phone:</span> {company?.phone}</p>
              <p><span className="font-semibold text-slate-800">Email:</span> {company?.email}</p>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="col-span-5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Invoice No:</span>
              <span className="font-bold text-slate-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Invoice Date:</span>
              <span className="font-bold text-slate-900">{formatDate(invoice.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Payment Terms:</span>
              <span className="text-slate-800">{invoice.paymentTerms || 'Immediate'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Due Date:</span>
              <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.poNumber && (
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-semibold">P.O. Ref:</span>
                <span className="font-medium text-slate-800">{invoice.poNumber} {invoice.poDate ? `(${formatDate(invoice.poDate)})` : ''}</span>
              </div>
            )}
            {invoice.eWayBillNo && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">E-Way Bill:</span>
                <span className="font-medium text-slate-800">{invoice.eWayBillNo}</span>
              </div>
            )}
            {invoice.transportMode && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Vehicle / Trans:</span>
                <span className="font-medium text-slate-800">{invoice.transportMode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Buyer / Customer Billing & Shipping Section */}
        <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs">
          <div className="pr-3 border-r border-slate-200">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-1">
              Billed To (Buyer):
            </span>
            <p className="font-bold text-slate-900 text-sm">{invoice.customer?.name || 'Walk-in Customer'}</p>
            {invoice.customer?.contactPerson && (
              <p className="text-slate-600">Attn: {invoice.customer.contactPerson}</p>
            )}
            <p className="text-slate-700 whitespace-pre-line mt-1">{invoice.customer?.billingAddress}</p>
            <div className="mt-1 space-y-0.5">
              <p><span className="font-semibold text-slate-700">GSTIN:</span> <span className="font-bold">{invoice.customer?.gstin || 'Unregistered'}</span></p>
              <p><span className="font-semibold text-slate-700">State:</span> {invoice.customer?.state} {invoice.customer?.stateCode ? `(Code: ${invoice.customer.stateCode})` : ''}</p>
              {invoice.customer?.phone && <p><span className="font-semibold text-slate-700">Phone:</span> {invoice.customer.phone}</p>}
            </div>
          </div>

          <div className="pl-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-1">
              Shipped To (Consignee / Delivery Address):
            </span>
            <p className="font-bold text-slate-900 text-sm">{invoice.customer?.name || 'Same as Buyer'}</p>
            <p className="text-slate-700 whitespace-pre-line mt-1">
              {invoice.customer?.shippingAddress || invoice.customer?.billingAddress}
            </p>
            <div className="mt-2 text-slate-600">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                {isInterstate ? 'Inter-State Supply (IGST Applicable)' : 'Intra-State Supply (CGST + SGST Applicable)'}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-4">
          <table className="w-full text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[10px]">
                <th className="p-2 text-center w-8 border-r border-slate-300">#</th>
                <th className="p-2 text-left border-r border-slate-300">Item Description & Poly Bag Specifications</th>
                <th className="p-2 text-center w-16 border-r border-slate-300">HSN</th>
                <th className="p-2 text-right w-20 border-r border-slate-300">Quantity</th>
                <th className="p-2 text-center w-14 border-r border-slate-300">Unit</th>
                <th className="p-2 text-right w-20 border-r border-slate-300">Rate (₹)</th>
                <th className="p-2 text-right w-24">Taxable Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(invoice.items || []).map((item, idx) => {
                const qty = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rate) || 0;
                const base = item.billingMode === '1000pcs' ? (qty / 1000) * rate : qty * rate;
                const dimStr = `${item.width || 0}" × ${item.length || 0}"${item.gusset ? ` + ${item.gusset}" Gusset` : ''}${item.flap ? ` + ${item.flap}" Lip` : ''}`;
                const micStr = `${item.micron || 50} µm (${item.gauge || 200} Gauge)`;

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="p-2 text-center border-r border-slate-200 font-medium text-slate-500">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{item.description}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5 space-x-2">
                        <span><strong className="text-slate-700">Size:</strong> {dimStr}</span>
                        <span>•</span>
                        <span><strong className="text-slate-700">Thickness:</strong> {micStr}</span>
                        <span>•</span>
                        <span><strong className="text-slate-700">Polymer:</strong> {item.material}</span>
                      </div>
                      {(item.color || item.printing) && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {item.color && <span>Color: {item.color} | </span>}
                          {item.printing && <span>Print: {item.printing}</span>}
                        </div>
                      )}
                      {/* Yield conversion note */}
                      <div className="text-[10px] text-indigo-700 italic mt-0.5">
                        {item.billingMode === 'kg' && item.calculatedPcs ? (
                          <span>(Estimated count: approx. {item.calculatedPcs.toLocaleString()} bags)</span>
                        ) : null}
                        {item.billingMode !== 'kg' && item.calculatedWeightKg ? (
                          <span>(Estimated weight: approx. {item.calculatedWeightKg} Kg)</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-2 text-center border-r border-slate-200 text-slate-700 font-mono text-[11px]">
                      {item.hsnCode || '39232100'}
                    </td>
                    <td className="p-2 text-right border-r border-slate-200 font-bold text-slate-900">
                      {formatNumber(qty, item.billingMode === 'kg' ? 1 : 0)}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200 text-slate-600 font-medium">
                      {item.billingMode === 'kg' ? 'KG' : item.billingMode === '1000pcs' ? '1K PCS' : 'PCS'}
                    </td>
                    <td className="p-2 text-right border-r border-slate-200 font-medium text-slate-900">
                      {formatNumber(rate, 2)}
                    </td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      {formatNumber(base, 2)}
                    </td>
                  </tr>
                );
              })}

              {/* Extra Charges Rows if applicable */}
              {parseFloat(invoice.cylinderCharge) > 0 && (
                <tr className="bg-slate-50/70">
                  <td className="p-2 text-center border-r border-slate-200 text-slate-400">•</td>
                  <td className="p-2 border-r border-slate-200 text-slate-800">
                    <span className="font-semibold">Printing Cylinder / Stereo Block Making Charge</span> (One-time)
                  </td>
                  <td className="p-2 text-center border-r border-slate-200 font-mono text-[11px]">84425000</td>
                  <td className="p-2 text-right border-r border-slate-200 font-bold">1</td>
                  <td className="p-2 text-center border-r border-slate-200">JOB</td>
                  <td className="p-2 text-right border-r border-slate-200">{formatNumber(invoice.cylinderCharge, 2)}</td>
                  <td className="p-2 text-right font-bold">{formatNumber(invoice.cylinderCharge, 2)}</td>
                </tr>
              )}

              {parseFloat(invoice.freightCharge) > 0 && (
                <tr className="bg-slate-50/70">
                  <td className="p-2 text-center border-r border-slate-200 text-slate-400">•</td>
                  <td className="p-2 border-r border-slate-200 text-slate-800">
                    <span className="font-semibold">Freight & Transportation / Delivery Charge</span>
                  </td>
                  <td className="p-2 text-center border-r border-slate-200 font-mono text-[11px]">996511</td>
                  <td className="p-2 text-right border-r border-slate-200 font-bold">1</td>
                  <td className="p-2 text-center border-r border-slate-200">TRIP</td>
                  <td className="p-2 text-right border-r border-slate-200">{formatNumber(invoice.freightCharge, 2)}</td>
                  <td className="p-2 text-right font-bold">{formatNumber(invoice.freightCharge, 2)}</td>
                </tr>
              )}

              {parseFloat(invoice.packagingCharge) > 0 && (
                <tr className="bg-slate-50/70">
                  <td className="p-2 text-center border-r border-slate-200 text-slate-400">•</td>
                  <td className="p-2 border-r border-slate-200 text-slate-800">
                    <span className="font-semibold">Corrugated Packaging & Strapping Charges</span>
                  </td>
                  <td className="p-2 text-center border-r border-slate-200 font-mono text-[11px]">481910</td>
                  <td className="p-2 text-right border-r border-slate-200 font-bold">1</td>
                  <td className="p-2 text-center border-r border-slate-200">PKG</td>
                  <td className="p-2 text-right border-r border-slate-200">{formatNumber(invoice.packagingCharge, 2)}</td>
                  <td className="p-2 text-right font-bold">{formatNumber(invoice.packagingCharge, 2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation & Tax Summary Section */}
        <div className="grid grid-cols-12 gap-4 mt-3 pt-3 border-t border-slate-300 text-xs">
          {/* Left Block: Amount in Words, Bank Details, Dispatch Totals */}
          <div className="col-span-7 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Amount Chargeable in Words:
              </span>
              <p className="font-bold text-slate-900 text-xs mt-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                {totals.amountInWords}
              </p>
            </div>

            {/* Material Dispatch Yield Summary */}
            <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Total Net Material:</span>
                <span className="font-extrabold text-indigo-950 text-sm">{formatNumber(totals.totalWeightKg, 1)} Kg</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-semibold block">Total Estimated Bags:</span>
                <span className="font-extrabold text-indigo-950 text-sm">{formatNumber(totals.totalBagsCount, 0)} Pieces</span>
              </div>
            </div>

            {/* Bank Details & UPI QR Preview */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Bank Account Details for NEFT / RTGS / IMPS:
                </span>
                <p className="font-bold text-slate-900">{company?.bankName}</p>
                <p><span className="text-slate-600">A/C Name:</span> <span className="font-medium">{company?.accountName}</span></p>
                <p><span className="text-slate-600">A/C Number:</span> <span className="font-mono font-bold text-slate-900">{company?.accountNumber}</span></p>
                <p><span className="text-slate-600">IFSC Code:</span> <span className="font-mono font-bold text-slate-900">{company?.ifscCode}</span> | {company?.branch}</p>
                {company?.upiId && (
                  <p className="mt-1 pt-1 border-t border-slate-200">
                    <span className="text-slate-600 font-semibold">UPI ID:</span> <span className="font-mono font-bold text-indigo-700">{company.upiId}</span>
                  </p>
                )}
              </div>

              {/* UPI QR Code box */}
              {company?.upiId && (
                <div className="text-center p-2 bg-white rounded border border-slate-200 w-24 shrink-0">
                  <div className="w-20 h-20 bg-slate-100 flex flex-col items-center justify-center rounded">
                    <QrCode className="w-12 h-12 text-slate-800" />
                    <span className="text-[8px] font-bold text-slate-500 mt-1">Scan to Pay</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 block mt-1">₹{totals.grandTotal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Block: Taxable & Tax Computation */}
          <div className="col-span-5">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Items Base Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totals.itemsBaseTotal)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>- {formatCurrency(totals.discountAmount)}</span>
                </div>
              )}

              {totals.additionalCharges > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Additional Charges:</span>
                  <span>{formatCurrency(totals.additionalCharges)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200 font-semibold text-slate-800">
                <span>Total Taxable Value:</span>
                <span>{formatCurrency(totals.taxableAmount)}</span>
              </div>

              {/* GST Breakdown */}
              {isInterstate ? (
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-semibold">{formatCurrency(totals.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>Central GST (CGST):</span>
                    <span className="font-semibold">{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>State GST (SGST):</span>
                    <span className="font-semibold">{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              )}

              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Round Off:</span>
                  <span>{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
                </div>
              )}

              {/* Grand Total Bar */}
              <div className="pt-2 border-t-2 border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span className="text-base">Grand Total:</span>
                <span className="text-lg text-indigo-900">{formatCurrency(totals.grandTotal)}</span>
              </div>

              {/* Payment Status indicator */}
              <div className="pt-1 text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  invoice.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.paymentStatus === 'partial'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Status: {invoice.paymentStatus}
                  {invoice.paymentStatus === 'partial' && ` (Bal: ${formatCurrency(totals.balanceDue)})`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Terms & Authorized Signatory */}
        <div className="grid grid-cols-12 gap-4 mt-6 pt-4 border-t border-slate-300 text-xs">
          <div className="col-span-7">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Terms & Conditions:
            </span>
            <div className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded border border-slate-200">
              {company?.termsAndConditions}
            </div>
          </div>

          <div className="col-span-5 flex flex-col justify-between text-right pl-4">
            <div>
              <p className="text-xs font-bold text-slate-800">{company?.authorizedSignatory || 'For APEX POLY PACK INDUSTRIES'}</p>
            </div>
            <div className="mt-12 pt-2 border-t border-slate-300">
              <p className="text-[11px] font-semibold text-slate-700">Authorized Signatory / Partner</p>
              <p className="text-[9px] text-slate-400">Electronic Computer Generated Invoice</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

