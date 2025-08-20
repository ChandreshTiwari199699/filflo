const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function generateInvoicePDF(requestBody, invoiceData, outputPath) {
    const templatePath = path.join(__dirname, 'invoiceTemplate.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    const qrCodeData = await QRCode.toDataURL(invoiceData.SignedQRCode);
    
    // Merge requestBody and invoiceData
    const orderData = {
        requestBody,
        invoiceData,
        qrCodeData
    };
    
    const html = ejs.render(template, orderData);
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
    });

    await browser.close();
    console.log(`PDF generated: ${outputPath}`);
}

const requestBody = {
    Version: '1.1',
    TranDtls: { TaxSch: 'GST', SupTyp: 'B2B', RegRev: 'N', IgstOnIntra: 'N' },
    DocDtls: { Typ: 'INV', No: 'test-11-march-12', Dt: '05/03/2025' },
    SellerDtls: {
        Gstin: '29AAGCB1286Q000',
        LglNm: 'Sleepy Owl Coffee Private Limited',
        Addr1: 'Hadbasat No - 161, Sector -76, Gurugram',
        Loc: 'Gurugram',
        Pin: '587101',
        Stcd: '29'
    },
    BuyerDtls: {
        Gstin: '24AACFZ5950A1ZE',
        LglNm: '1RIVET India LLP ( Surat)',
        Addr1: '1RIVET India LLP First Floor, Valsad',
        Loc: 'Valsad',
        Pin: 396007,
        Stcd: '24',
        Pos: '24'
    },
    ItemList: [
        {
            SlNo: '1',
            PrdDesc: 'CBB-AST-05P-BAG-ONE',
            HsnCd: '210111',
            Qty: 1,
            Unit: 'NOS',
            UnitPrice: 5,
            TotAmt: 5,
            IsServc: 'N',
            GstRt: 18,
            IgstAmt: '0.90',
            SgstAmt: '0.00',
            CgstAmt: '0.00',
            AssAmt: 5,
            TotItemVal: '5.90'
        }
    ],
    ValDtls: {
        AssVal: '5.00',
        IgstVal: '0.90',
        CgstVal: '0.00',
        SgstVal: '0.00',
        TotInvVal: '5.90'
    }
};

const invoiceData = {
    AckNo: 112510222424305,
    AckDt: '2025-03-11 14:43:00',
    Irn: 'f34ec3ca5cb0eef254f3fa7976c7e3d54782a7fe448de432e7e49fdb0573cb28',
    Status: 'ACT',
    SignedInvoice: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjNCRTE3RTUxNDE5MjUyMjY0N0YwMUZEQkZGNTI3MUFENTI2OEQ3MzUiLCJ4NXQiOiJPLUYtVVVHU1VpWkg4Ql9iXzFKeHJWSm8xelUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJOSUMgU2FuZGJveCIsImRhdGEiOiJ7XCJBY2tOb1wiOjExMjUxMDIyMjQyNDMwNSxcIkFja0R0XCI6XCIyMDI1LTAzLTExIDE0OjQzOjAwXCIsXCJJcm5cIjpcImYzNGVjM2NhNWNiMGVlZjI1NGYzZmE3OTc2YzdlM2Q1NDc4MmE3ZmU0NDhkZTQzMmU3ZTQ5ZmRiMDU3M2NiMjhcIixcIlZlcnNpb25cIjpcIjEuMVwiLFwiVHJhbkR0bHNcIjp7XCJUYXhTY2hcIjpcIkdTVFwiLFwiU3VwVHlwXCI6XCJCMkJcIixcIlJlZ1JldlwiOlwiTlwiLFwiSWdzdE9uSW50cmFcIjpcIk5cIn0sXCJEb2NEdGxzXCI6e1wiVHlwXCI6XCJJTlZcIixcIk5vXCI6XCJ0ZXN0LTExLW1hcmNoLTEyXCIsXCJEdFwiOlwiMDUvMDMvMjAyNVwifSxcIlNlbGxlckR0bHNcIjp7XCJHc3RpblwiOlwiMjlBQUdDQjEyODZRMDAwXCIsXCJMZ2xObVwiOlwiU2xlZXB5IE93bCBDb2ZmZWUgUHJpdmF0ZSBMaW1pdGVkXCIsXCJBZGRyMVwiOlwiSGFkYmFzYXQgTm8gLSAxNjEsIEtoZXdhdCBOby9LaGF0YSBObyAtIDQ5NS81MTAsNzkyLzg0MSwgU2VjdG9yIC03NiwgR3JveiB0b2xscyBsaW5rIHJvYWQsIFZpbGxhZ2UtIFwiLFwiTG9jXCI6XCJHdXJ1Z3JhbVwiLFwiUGluXCI6NTg3MTAxLFwiU3RjZFwiOlwiMjlcIn0sXCJCdXllckR0bHNcIjp7XCJHc3RpblwiOlwiMjRBQUNGWjU5NTBBMVpFXCIsXCJMZ2xObVwiOlwiMVJJVkVUIEluZGlhIExMUCAoIFN1cmF0KVwiLFwiUG9zXCI6XCIyNFwiLFwiQWRkcjFcIjpcIjFSSVZFVCBJbmRpYSBMTFAgRmlyc3QgRmxvb3IsU2Vjb25kIGZsb29yLCBUZXJyYWNlIFVuaXQsIEdyb3VuZCBGbG9vciAgTkVcXHUwMDI2RSBCdWlsZGluZyBEaGFtcHVyIENoYXIgUmFcIixcIkxvY1wiOlwiVmFsc2FkXCIsXCJQaW5cIjozOTYwMDcsXCJTdGNkXCI6XCIyNFwifSxcIkl0ZW1MaXN0XCI6W3tcIkl0ZW1Ob1wiOjAsXCJTbE5vXCI6XCIxXCIsXCJJc1NlcnZjXCI6XCJOXCIsXCJQcmREZXNjXCI6XCJDQkItQVNULTA1UC1CQUctT05FXCIsXCJIc25DZFwiOlwiMjEwMTExXCIsXCJRdHlcIjoxLFwiVW5pdFwiOlwiTk9TXCIsXCJVbml0UHJpY2VcIjo1LFwiVG90QW10XCI6NSxcIkFzc0FtdFwiOjUsXCJHc3RSdFwiOjE4LFwiSWdzdEFtdFwiOjAuOTAsXCJDZ3N0QW10XCI6MC4wMCxcIlNnc3RBbXRcIjowLjAwLFwiVG90SXRlbVZhbFwiOjUuOTB9XSxcIlZhbER0bHNcIjp7XCJBc3NWYWxcIjo1LjAwLFwiQ2dzdFZhbFwiOjAuMDAsXCJTZ3N0VmFsXCI6MC4wMCxcIklnc3RWYWxcIjowLjkwLFwiVG90SW52VmFsXCI6NS45MH19In0.Vld9CJX6m3-1lB9g0u_5uRAq0PGz9QUDrYFxgy84fr7BIUa-QUWzIsJrPQI4nPX9buN86RP3Jq58HT6uAx3uNxs0ruWePcNgUcihtQ9wGPXD7vNOxIVU0D7jfNnozzNnUaNHyHHMOeQTgSDLbYp9SKiJE9DPOQoLECz71j7JHPKQiITKQ1-7gHCLWu70hEVxWtSDUpjkdkL9jyQre9SQxld1Vmhfm7ueWohnkMm00DGz3sIPD2nXtf7NZdrDN66FAyL_xNEaWEY7OUoattXj1v39VZiodlJ8Jw_JuG9sBH6DQpK5lIUHk4OJ6hBDJ6u9XR57aJTjLUxdHRNm29hVOg',
    SignedQRCode: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjNCRTE3RTUxNDE5MjUyMjY0N0YwMUZEQkZGNTI3MUFENTI2OEQ3MzUiLCJ4NXQiOiJPLUYtVVVHU1VpWkg4Ql9iXzFKeHJWSm8xelUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJOSUMgU2FuZGJveCIsImRhdGEiOiJ7XCJTZWxsZXJHc3RpblwiOlwiMjlBQUdDQjEyODZRMDAwXCIsXCJCdXllckdzdGluXCI6XCIyNEFBQ0ZaNTk1MEExWkVcIixcIkRvY05vXCI6XCJ0ZXN0LTExLW1hcmNoLTEyXCIsXCJEb2NUeXBcIjpcIklOVlwiLFwiRG9jRHRcIjpcIjA1LzAzLzIwMjVcIixcIlRvdEludlZhbFwiOjUuOTAsXCJJdGVtQ250XCI6MSxcIk1haW5Ic25Db2RlXCI6XCIyMTAxMTFcIixcIklyblwiOlwiZjM0ZWMzY2E1Y2IwZWVmMjU0ZjNmYTc5NzZjN2UzZDU0NzgyYTdmZTQ0OGRlNDMyZTdlNDlmZGIwNTczY2IyOFwiLFwiSXJuRHRcIjpcIjIwMjUtMDMtMTEgMTQ6NDM6MDBcIn0ifQ.SsVPscGN-FstZV3XWDBllsz4-4024D3t9z4ta7h7OEDepKK7OzZCkx7eOsBIzrjv-8XPtzqb38An_YHfGW2SmcHitGbtF0-VaCJ_G6lZK8Tsq4xp7L0CGdC-75QxrFWiI9S8U2X3Ev4vzAkB51g6p7Ltf9RZ4zQpkI8cgsp1tu3b6Z80XW1zJ_IqFR9sRi26_edxgqUF2ugisyIXO25swogxG-3fYOthUG_GT40JN4FUSKy2Grf8pe6WhXgoZrbZ0WwvgahhNnynxUkfFgm8I94YUt8h_hpFX993aiB7cYXv37ZKZ6S5Ohic10BsxFR08v-LdFh5ni9EJhfXLueR3A'
};

generateInvoicePDF(requestBody, invoiceData, 'invoice.pdf');
