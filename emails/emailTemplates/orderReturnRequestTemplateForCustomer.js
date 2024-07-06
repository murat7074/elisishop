// Function to generate order detail email template

export const orderReturnRequestTemplateForCustomer = (
  userShippingInfo,
  orderInfo,
  orderProducts,
  message,
  title
) => {
  // Extract order data
  const { address, city, country, phoneNo, userName } = userShippingInfo
  const {
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    orderNumber,
    paymentMethod,
  } = orderInfo
  const paymentMtd =
    paymentMethod && paymentMethod === 'COD' ? 'Kapıda Ödeme' : 'Kredi Kartı'
  // Generate order summary HTML content
  const orderSummary = orderProducts
    .map((item) => {
      const { name, price, amount, image, colors } = item
      const color = colors[0]?.color || '#000'

      return `
       
           <tbody>
                     <tr bgcolor="transparent" style="background-color: transparent;">
                      <td class="pc-w620-halign-center pc-w620-valign-top pc-w620-width-50pc pc-w620-height-auto" align="left" valign="middle" style="padding: 20px 0px 20px 20px; border-bottom: 1px solid #d1dfe3;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-textAlign-center" align="left" valign="top" style="padding: 0px 0px 2px 0px;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-textAlign-center" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                           <tr>
                            <td valign="top" class="pc-w620-textAlign-center" align="left" style="padding: 0px 0px 0px 0px;">
                             <div class="pc-font-alt pc-w620-textAlign-center pc-w620-fontSize-14px pc-w620-lineHeight-24" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                              <div><span>Ürün Adı: ${name}</span>
                              </div>
                             </div>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-textAlign-center" align="left" valign="top" style="padding: 0px 0px 2px 0px;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-textAlign-center" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                           <tr>
                            <td valign="top" class="pc-w620-textAlign-center" align="left">
                             <div class="pc-font-alt pc-w620-textAlign-center" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                             
                               <div>
                                  <span>Color: </span><span style="background-color:${color}; width: 16px; height: 16px; display: inline-block; border-radius: 50%;" ></span>
                              </div>
                             </div>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-textAlign-center" align="left" valign="top" style="padding: 0px 0px 2px 0px;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-textAlign-center" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                           <tr>
                            <td valign="top" class="pc-w620-textAlign-center" align="left" style="padding: 0px 0px 0px 0px;">
                             <div class="pc-font-alt pc-w620-textAlign-center" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                              <div><span>Adet : ${amount}</span>
                              </div>
                             </div>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-textAlign-center" align="left" valign="top" style="padding: 0px 0px 2px 0px;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-textAlign-center" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                           <tr>
                            <td valign="top" class="pc-w620-textAlign-center" align="left" style="padding: 0px 0px 0px 0px;">
                             <div class="pc-font-alt pc-w620-textAlign-center" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                              <div><span>Fiyat : ₺${price * amount}</span>
                              </div>
                             </div>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                      <td class="pc-w620-halign-center pc-w620-valign-top pc-w620-width-50pc pc-w620-height-auto" align="right" valign="middle" style="padding: 0px 20px 20px 0px; border-bottom: 1px solid #d1dfe3;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-spacing-20-0-20-20 pc-w620-align-center" align="right" valign="top" style="padding: 20px 20px 10px 0px;">
                          <img src="${image}" class="pc-w620-align-center" width="102" height="102" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:102px; height: 102px; max-width: 100%; border-radius: 6px 6px 6px 6px;object-fit: cover" />
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                    </tbody>






      `
    })
    .join()
  // Create HTML email template
  return `
   
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
 <meta charset="UTF-8" />
 <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
 <!--[if !mso]><!-- -->
 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
 <!--<![endif]-->
 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 <meta name="format-detection" content="telephone=no" />
 <meta name="format-detection" content="date=no" />
 <meta name="format-detection" content="address=no" />
 <meta name="format-detection" content="email=no" />
 <meta name="x-apple-disable-message-reformatting" />
 <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:ital,wght@0,400;0,400;1,400;0,500;0,600;0,700" rel="stylesheet" />
 <link href="https://fonts.googleapis.com/css?family=Nunito:ital,wght@0,700" rel="stylesheet" />
 <title>SureOrder</title>
 <!-- Made with Postcards by Designmodo https://designmodo.com/postcards -->
 <style>
 html,
         body {
             margin: 0 !important;
             padding: 0 !important;
             min-height: 100% !important;
             width: 100% !important;
             -webkit-font-smoothing: antialiased;
         }
 
         * {
             -ms-text-size-adjust: 100%;
         }
 
         #outlook a {
             padding: 0;
         }
 
         .ReadMsgBody,
         .ExternalClass {
             width: 100%;
         }
 
         .ExternalClass,
         .ExternalClass p,
         .ExternalClass td,
         .ExternalClass div,
         .ExternalClass span,
         .ExternalClass font {
             line-height: 100%;
         }
 
         table,
         td,
         th {
             mso-table-lspace: 0 !important;
             mso-table-rspace: 0 !important;
             border-collapse: collapse;
         }
 
         u + .body table, u + .body td, u + .body th {
             will-change: transform;
         }
 
         body, td, th, p, div, li, a, span {
             -webkit-text-size-adjust: 100%;
             -ms-text-size-adjust: 100%;
             mso-line-height-rule: exactly;
         }
 
         img {
             border: 0;
             outline: 0;
             line-height: 100%;
             text-decoration: none;
             -ms-interpolation-mode: bicubic;
         }
 
         a[x-apple-data-detectors] {
             color: inherit !important;
             text-decoration: none !important;
         }
 
         .pc-gmail-fix {
             display: none;
             display: none !important;
         }
 
         @media (min-width: 621px) {
             .pc-lg-hide {
                 display: none;
             } 
 
             .pc-lg-bg-img-hide {
                 background-image: none !important;
             }
         }
 </style>
 <style>
 @media (max-width: 620px) {
 .pc-project-body {min-width: 0px !important;}
 .pc-project-container {width: 100% !important;}
 .pc-sm-hide {display: none !important;}
 .pc-sm-bg-img-hide {background-image: none !important;}
 .pc-w620-padding-20-0-20-0 {padding: 20px 0px 20px 0px !important;}
 .pc-w620-fontSize-36px {font-size: 36px !important;}
 .pc-w620-lineHeight-100pc {line-height: 100% !important;}
 table.pc-w620-spacing-0-0-12-0 {margin: 0px 0px 12px 0px !important;}
 td.pc-w620-spacing-0-0-12-0,th.pc-w620-spacing-0-0-12-0{margin: 0 !important;padding: 0px 0px 12px 0px !important;}
 .pc-w620-padding-0-0-0-0 {padding: 0px 0px 0px 0px !important;}
 .pc-w620-padding-20-30-0-30 {padding: 20px 30px 0px 30px !important;}
 table.pc-w620-spacing-0-0-0-0 {margin: 0px 0px 0px 0px !important;}
 td.pc-w620-spacing-0-0-0-0,th.pc-w620-spacing-0-0-0-0{margin: 0 !important;padding: 0px 0px 0px 0px !important;}
 .pc-w620-itemsSpacings-0-30 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 15px !important;padding-bottom: 15px !important;}
 .pc-w620-padding-32-20-40-20 {padding: 32px 20px 40px 20px !important;}
 .pc-w620-width-fill {width: 100% !important;}
 .pc-w620-fontSize-16px {font-size: 16px !important;}
 .pc-w620-width-auto {width: auto !important;}
 .pc-w620-height-auto {height: auto !important;}
 .pc-w620-itemsSpacings-0-0 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 0px !important;padding-bottom: 0px !important;}
 .pc-w620-width-hug {width: auto !important;}
 table.pc-w620-spacing-0-32-12-32 {margin: 0px 32px 12px 32px !important;}
 td.pc-w620-spacing-0-32-12-32,th.pc-w620-spacing-0-32-12-32{margin: 0 !important;padding: 0px 32px 12px 32px !important;}
 .pc-w620-valign-middle {vertical-align: middle !important;}
 td.pc-w620-halign-center {text-align: center !important;}
 table.pc-w620-halign-center {float: none !important;margin-right: auto !important;margin-left: auto !important;}
 img.pc-w620-halign-center {margin-right: auto !important;margin-left: auto !important;}
 .pc-w620-width-32 {width: 32px !important;}
 .pc-w620-width-64 {width: 64px !important;}
 .pc-w620-height-1 {height: 1px !important;}
 table.pc-w620-spacing-0-0-24-0 {margin: 0px 0px 24px 0px !important;}
 td.pc-w620-spacing-0-0-24-0,th.pc-w620-spacing-0-0-24-0{margin: 0 !important;padding: 0px 0px 24px 0px !important;}
 .pc-w620-valign-top {vertical-align: top !important;}
 .pc-w620-fontSize-14px {font-size: 14px !important;}
 .pc-w620-width-80 {width: 80px !important;}
 div.pc-w620-align-center,th.pc-w620-align-center,a.pc-w620-align-center,td.pc-w620-align-center {text-align: center !important;text-align-last: center !important;}
 table.pc-w620-align-center {float: none !important;margin-right: auto !important;margin-left: auto !important;}
 img.pc-w620-align-center {margin-right: auto !important;margin-left: auto !important;}
 .pc-w620-padding-20-24-0-24 {padding: 20px 24px 0px 24px !important;}
 .pc-w620-fontSize-20px {font-size: 20px !important;}
 .pc-w620-lineHeight-40 {line-height: 40px !important;}
 table.pc-w620-spacing-0-0-4-0 {margin: 0px 0px 4px 0px !important;}
 td.pc-w620-spacing-0-0-4-0,th.pc-w620-spacing-0-0-4-0{margin: 0 !important;padding: 0px 0px 4px 0px !important;}
 .pc-w620-lineHeight-120pc {line-height: 120% !important;}
 .pc-w620-padding-40-24-0-24 {padding: 40px 24px 0px 24px !important;}
 .pc-w620-padding-20-20-20-20 {padding: 20px 20px 20px 20px !important;}
 .pc-w620-width-50pc {width: 50% !important;}
 .pc-w620-lineHeight-24 {line-height: 24px !important;}
 div.pc-w620-align-left,th.pc-w620-align-left,a.pc-w620-align-left,td.pc-w620-align-left {text-align: left !important;text-align-last: left !important;}
 table.pc-w620-align-left{float: none !important;margin-right: auto !important;margin-left: 0 !important;}
 img.pc-w620-align-left{margin-right: auto !important;margin-left: 0 !important;}
 div.pc-w620-textAlign-center,th.pc-w620-textAlign-center,a.pc-w620-textAlign-center,td.pc-w620-textAlign-center {text-align: center !important;text-align-last: center !important;}
 table.pc-w620-textAlign-center {float: none !important;margin-right: auto !important;margin-left: auto !important;}
 img.pc-w620-textAlign-center {margin-right: auto !important;margin-left: auto !important;}
 table.pc-w620-spacing-20-0-20-20 {margin: 20px 0px 20px 20px !important;}
 td.pc-w620-spacing-20-0-20-20,th.pc-w620-spacing-20-0-20-20{margin: 0 !important;padding: 20px 0px 20px 20px !important;}
 .pc-w620-padding-20-24-20-24 {padding: 20px 24px 20px 24px !important;}
 td.pc-w620-halign-left {text-align: left !important;}
 table.pc-w620-halign-left {float: none !important;margin-right: auto !important;margin-left: 0 !important;}
 img.pc-w620-halign-left {margin-right: auto !important;margin-left: 0 !important;}
 .pc-w620-padding-20-0-20-20 {padding: 20px 0px 20px 20px !important;}
 .pc-w620-width-100pc {width: 100% !important;}
 .pc-w620-fontSize-16 {font-size: 16px !important;}
 .pc-w620-lineHeight-26 {line-height: 26px !important;}
 table.pc-w620-spacing-0-0-8-0 {margin: 0px 0px 8px 0px !important;}
 td.pc-w620-spacing-0-0-8-0,th.pc-w620-spacing-0-0-8-0{margin: 0 !important;padding: 0px 0px 8px 0px !important;}
 div.pc-w620-textAlign-left,th.pc-w620-textAlign-left,a.pc-w620-textAlign-left,td.pc-w620-textAlign-left {text-align: left !important;text-align-last: left !important;}
 table.pc-w620-textAlign-left{float: none !important;margin-right: auto !important;margin-left: 0 !important;}
 img.pc-w620-textAlign-left{margin-right: auto !important;margin-left: 0 !important;}
 .pc-w620-itemsSpacings-0-20 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 10px !important;padding-bottom: 10px !important;}
 .pc-w620-height-hug {height: auto !important;}
 .pc-w620-itemsSpacings-10-20 {padding-left: 5px !important;padding-right: 5px !important;padding-top: 10px !important;padding-bottom: 10px !important;}
 .pc-w620-padding-32-24-32-24 {padding: 32px 24px 32px 24px !important;}
 .pc-w620-itemsSpacings-20-0 {padding-left: 10px !important;padding-right: 10px !important;padding-top: 0px !important;padding-bottom: 0px !important;}
 table.pc-w620-spacing-0-0-20-0 {margin: 0px 0px 20px 0px !important;}
 td.pc-w620-spacing-0-0-20-0,th.pc-w620-spacing-0-0-20-0{margin: 0 !important;padding: 0px 0px 20px 0px !important;}
 .pc-w620-padding-30-24-40-24 {padding: 30px 24px 40px 24px !important;}
 
 .pc-w620-gridCollapsed-1 > tbody,.pc-w620-gridCollapsed-1 > tbody > tr,.pc-w620-gridCollapsed-1 > tr {display: inline-block !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > tr > td,.pc-w620-gridCollapsed-1 > tr > td {display: block !important;width: auto !important;padding-left: 0 !important;padding-right: 0 !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-first > .pc-grid-td-first,pc-w620-gridCollapsed-1 > .pc-grid-tr-first > .pc-grid-td-first {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-last > .pc-grid-td-last,pc-w620-gridCollapsed-1 > .pc-grid-tr-last > .pc-grid-td-last {padding-bottom: 0 !important;}
 
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-first > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-first > td {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-last > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-last > td {padding-bottom: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-first,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-first {padding-left: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-last,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-last {padding-right: 0 !important;}
 
 .pc-w620-tableCollapsed-1 > tbody,.pc-w620-tableCollapsed-1 > tbody > tr,.pc-w620-tableCollapsed-1 > tr {display: block !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1 > tbody > tr > td,.pc-w620-tableCollapsed-1 > tr > td {display: block !important;width: auto !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 }
 </style>
 <!--[if !mso]><!-- -->
 <style>
 @media all { @font-face { font-family: 'Nunito Sans'; font-style: normal; font-weight: 400; src: url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4G1ilXvVUj.woff') format('woff'), url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4G1ilXvVUl.woff2') format('woff2'); } @font-face { font-family: 'Nunito Sans'; font-style: normal; font-weight: 700; src: url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4GMS5XvVUj.woff') format('woff'), url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4GMS5XvVUl.woff2') format('woff2'); } @font-face { font-family: 'Nunito Sans'; font-style: normal; font-weight: 600; src: url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4GCC5XvVUj.woff') format('woff'), url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4GCC5XvVUl.woff2') format('woff2'); } @font-face { font-family: 'Nunito Sans'; font-style: normal; font-weight: 500; src: url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4G5ClXvVUj.woff') format('woff'), url('https://fonts.gstatic.com/s/nunitosans/v15/pe1mMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp5F5bxqqtQ1yiU4G5ClXvVUl.woff2') format('woff2'); } @font-face { font-family: 'Nunito'; font-style: normal; font-weight: 700; src: url('https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmdTo3iQ.woff') format('woff'), url('https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmdTo3jw.woff2') format('woff2'); } }
 </style>
 <!--<![endif]-->
 <!--[if mso]>
    <style type="text/css">
        .pc-font-alt {
            font-family: Arial, Helvetica, sans-serif !important;
        }
    </style>
    <![endif]-->
 <!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
</head>

<body class="body pc-font-alt" style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; line-height: 1.5; color: #2D3A41; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-variant-ligatures: normal; text-rendering: optimizeLegibility; -moz-osx-font-smoothing: grayscale; background-color: #ffefcf;" bgcolor="#ffefcf">
 <table class="pc-project-body" style="table-layout: fixed; min-width: 600px; background-color:#ffefcf;" bgcolor="#ffefcf" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
  <tr>
   <td align="center" valign="top">
    <table class="pc-project-container" style="width: 600px; max-width: 600px;" width="600" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
     <tr>
      <td class="pc-w620-padding-20-0-20-0" style="padding: 20px 0px 14px 0px;" align="left" valign="top">
       <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="width: 100%;">
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Menu -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-20-30-0-30" style="padding: 26px 32px 16px 32px; border-radius: 0px; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-12-0" align="center" valign="top" style="padding: 0px 0px 12px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                      <div class="pc-font-alt pc-w620-fontSize-36px pc-w620-lineHeight-100pc" style="line-height: 110%; letter-spacing: -1px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 32px; font-weight: bold; font-variant-ligatures: normal; color: #417cd6; text-align: center; text-align-last: center;">
                       <div><span>Beybuilmek</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Menu -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Order Status -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-20-24-0-24" style="padding: 0px 32px 0px 32px; border-radius: 0px; background-color: #FFFFFF;" bgcolor="#FFFFFF">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td>
                   <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-30" align="left" valign="top" style="width: 50%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                      <table class="pc-w620-width-fill" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                       <tr>
                        <td class="pc-w620-padding-32-20-40-20" align="center" valign="middle" style="padding: 48px 24px 48px 24px; background-color: #fff8f0; border-radius: 12px 12px 12px 12px;">
                         <table class="pc-w620-width-fill" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table class="pc-w620-width-auto" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-12-0" valign="top" style="padding: 0px 0px 12px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                                  <div class="pc-font-alt pc-w620-fontSize-16px pc-w620-lineHeight-100pc" style="line-height: 150%; letter-spacing: -1px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 22px; font-weight: normal; font-variant-ligatures: normal; color: #121212; text-align: center; text-align-last: center;">
                                   <div><span style="font-weight: 700;font-style: normal;color: rgb(22, 23, 24);letter-spacing: 1px;" data-letter-spacing-original="1">Ürün İade Talebiniz Alındı.</span>
                                   </div>
                                   <div><span>﻿</span>
                                   </div>
                                   <div><span style="font-weight: 500;font-style: normal;letter-spacing: 0px;" data-letter-spacing-original="0">Talebiniz incelendikten sonra sizi bilgilendireceğiz.</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-32-12-32 pc-w620-valign-middle pc-w620-halign-center" align="center" style="padding: 0px 0px 12px 0px;">
                               <table class="pc-width-hug pc-w620-gridCollapsed-0 pc-w620-width-hug pc-w620-halign-center" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-0-0" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td class="pc-w620-halign-center pc-w620-valign-middle" align="center" valign="middle">
                                     <table class="pc-w620-halign-center pc-w620-width-fill" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td class="pc-w620-halign-center" align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td class="pc-w620-halign-center" align="center" valign="top" style="padding: 0px 0px 0px 0px;">
                                           <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453698/beybuilmek/email/it02v5co0kt8kowbtegj.png" class="pc-w620-width-32 pc-w620-height-auto pc-w620-halign-center" width="40" height="40" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:40px; height: auto; max-width: 100%;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-0" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                   <tr>
                                    <td class="pc-w620-halign-center pc-w620-valign-middle" align="left" valign="middle">
                                     <table class="pc-w620-halign-center pc-w620-width-fill" align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td class="pc-w620-halign-center" align="left" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                         <tr>
                                          <td valign="top">
                                           <table class="pc-w620-width-64  pc-w620-halign-center" width="124" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-right: auto;">
                                            <tr>
                                             <!--[if gte mso 9]>
                    <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #000000;">&nbsp;</td>
                <![endif]-->
                                             <!--[if !gte mso 9]><!-- -->
                                             <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #000000;">&nbsp;</td>
                                             <!--<![endif]-->
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-0" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table class="pc-w620-width-fill" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                           <td align="center" valign="top" style="background-color: #FF564A; border-radius: 100%; padding: 0px 0px 0px 0px;">
                                           <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453708/beybuilmek/email/ptz2u4lury7tnvbwxswq.png" class="pc-w620-width-32 pc-w620-height-auto" width="40" height="40" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:40px; height: auto; max-width: 100%;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-0" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                   <tr>
                                    <td class="pc-w620-halign-center pc-w620-valign-middle" align="left" valign="top">
                                     <table class="pc-w620-halign-center pc-w620-width-fill" align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td class="pc-w620-halign-center" align="left" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                         <tr>
                                          <td valign="top">
                                           <table class="pc-w620-width-64  pc-w620-halign-center" width="124" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-right: auto;">
                                            <tr>
                                             <!--[if gte mso 9]>
                    <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #000000;">&nbsp;</td>
                <![endif]-->
                                             <!--[if !gte mso 9]><!-- -->
                                             <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #000000;">&nbsp;</td>
                                             <!--<![endif]-->
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-0-0" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td class="pc-w620-halign-center pc-w620-valign-middle" align="center" valign="middle">
                                     <table class="pc-w620-halign-center pc-w620-width-fill" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td class="pc-w620-halign-center" align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       
                                       
                                          <tr style="background-color: #FF564A;">
                                          <td class="pc-w620-halign-center" align="center" valign="top" style="border-radius: 100%; padding: 0px 0px 0px 0px;">
                                           <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453690/beybuilmek/email/eeiudpt7ll2xeki5g32h.png" class="pc-w620-width-32 pc-w620-height-auto pc-w620-halign-center" width="40" height="40" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:40px; height: auto; max-width: 100%;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td class="pc-w620-spacing-0-0-24-0 pc-w620-valign-top pc-w620-halign-center" style="padding: 0px 0px 24px 0px;">
                               <table class="pc-width-fill pc-w620-gridCollapsed-0 pc-w620-width-fill pc-w620-halign-center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-0-0" align="center" valign="top" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table class="pc-w620-width-fill" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table class="pc-w620-width-80" width="80" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top" style="padding: 0px 0px 0px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" align="center" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" class="pc-w620-align-center" align="center" style="padding: 0px 0px 0px 0px;">
                                              <div class="pc-font-alt pc-w620-align-center pc-w620-fontSize-14px" style="line-height: 120%; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #121212cc; text-align: center; text-align-last: center;">
                                               <div><span style="font-weight: 400;font-style: normal;">Siparişiniz Onaylandı</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-0" align="center" valign="top" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table class="pc-w620-width-fill" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table class="pc-w620-width-80" width="80" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top" style="padding: 0px 0px 0px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" align="center" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" align="center" style="padding: 0px 0px 0px 0px;">
                                              <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 120%; letter-spacing: 0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #121212cc; text-align: center; text-align-last: center;">
                                               <div><span style="font-weight: 400;font-style: normal;">Kargoya Verildi</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-0-0" align="center" valign="top" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table class="pc-w620-width-fill" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table class="pc-w620-width-fill" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table class="pc-w620-width-80" width="80" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td valign="top" style="padding: 0px 0px 0px 0px;">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" align="center" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" class="pc-w620-align-center" align="center" style="padding: 0px 0px 0px 0px;">
                                              <div class="pc-font-alt pc-w620-align-center pc-w620-fontSize-14px" style="line-height: 120%; letter-spacing: 0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #121212cc; text-align: center; text-align-last: center;">
                                               <div><span style="font-weight: 400;font-style: normal;">Teslim Edildi</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td align="center">
                               <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                 <td valign="top">
                                  <table class="pc-width-hug pc-w620-gridCollapsed-1" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr class="pc-grid-tr-first pc-grid-tr-last">
                                    <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-30" valign="middle" style="width: 50%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                     <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                         <tr>
                                          <td align="center" valign="top">
                                           <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                             <td valign="top">
                                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" align="center" style="border-collapse: separate; border-spacing: 0;">
                                               <tr>
                                                <td valign="top" align="center">
                                                 <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 150%; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #121212cc; text-align: center; text-align-last: center;">
                                                      <div><span style="font-weight: 400;font-style: normal;">Başlık : ${title}</span>
                                                  </div>
                                                  <div><span style="font-weight: 400;font-style: normal;">Konu : ${message}</span>
                                                  </div>
                                                  <div><span style="font-weight: 400;font-style: italic;color: rgb(75, 85, 99);">Eğer bu sayfayı düzgün görüntüleyemiyorsanız Mesajlarım hesabından bakabilirsiniz.</span>
                                                  </div>
                                                 </div>
                                                </td>
                                               </tr>
                                              </table>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Order Status -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Order Details Header -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="border-collapse: separate; border-spacing: 0px;">
              <tr>
               <td valign="top" class="pc-w620-padding-40-24-0-24" style="padding: 48px 32px 0px 32px; border-radius: 0px; background-color: #ffffff; box-shadow: 2px 2px 4px 0px rgba(0,0,0,0.1);" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-4-0" align="center" valign="top" style="padding: 0px 0px 8px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" class="pc-w620-padding-0-0-0-0" align="center" style="padding: 0px 0px 0px 0px;">
                      <div class="pc-font-alt pc-w620-fontSize-20px pc-w620-lineHeight-40" style="line-height: 120%; letter-spacing: 0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 22px; font-weight: bold; font-variant-ligatures: normal; color: #121212; text-align: center; text-align-last: center;">
                       <div><span>Sipariş Özeti</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td align="center" valign="top" style="padding: 0px 0px 24px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" align="center" style="padding: 0px 0px 0px 0px;">
                      <div class="pc-font-alt pc-w620-fontSize-16px pc-w620-lineHeight-120pc" style="line-height: 150%; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; font-variant-ligatures: normal; color: #000000; text-align: center; text-align-last: center;">
                       <div><span style="color: rgb(18, 18, 18);">Sipariş Numarası : </span><span style="color: rgba(6, 1, 21, 0.6);"> </span><span style="color: rgb(255, 85, 74);">${orderNumber}</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Order Details Header -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Order Details Product -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-20-24-20-24" style="padding: 48px 32px 0px 32px; border-radius: 0px; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td style="padding: 0px 0px 0px 0px; ">
                   <table class="pc-w620-tableCollapsed-0" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; width: 100%; border-top: 1px solid #d1dfe3; border-right: 1px solid #d1dfe3; border-bottom: 1px solid #d1dfe3; border-left: 1px solid #d1dfe3; border-radius: 12px 12px 12px 12px;">
                  
                  
                 
              ${orderSummary}




                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Order Details Product -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Order Details -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-40-24-0-24" style="padding: 48px 32px 0px 32px; border-radius: 0px; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td style="padding: 0px 0px 0px 0px; ">
                   <table class="pc-w620-tableCollapsed-0" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; width: 100%; border-top: 1px solid #d1dfe3; border-right: 1px solid #d1dfe3; border-bottom: 1px solid #d1dfe3; border-left: 1px solid #d1dfe3; border-radius: 12px 12px 12px 12px;">
                    <tbody>
                     <tr>
                      <td class="pc-w620-valign-middle pc-w620-width-100pc" width="518" valign="top" style="border-bottom: 1px solid #d1dfe3;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td style="padding: 20px 0px 20px 20px;" align="left">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-valign-middle pc-w620-halign-left">
                             <table class="pc-width-fill pc-w620-gridCollapsed-1 pc-w620-halign-left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr class="pc-grid-tr-first pc-grid-tr-last">
                               <td class="pc-grid-td-first pc-w620-itemsSpacings-0-30" align="left" valign="top" style="width: 33.333333333333%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 0px;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                 <tr>
                                  <td class="pc-w620-halign-left pc-w620-valign-middle" align="left" valign="top">
                                   <table class="pc-w620-halign-left" align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td class="pc-w620-spacing-0-0-8-0" valign="top" style="padding: 0px 0px 8px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-textAlign-left" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt pc-w620-textAlign-left pc-w620-fontSize-16 pc-w620-lineHeight-26" style="line-height: 24px; letter-spacing: 0px; font-family: 'Nunito', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #121212; text-align: left; text-align-last: left;">
                                             <div><span>Teslimat Adresi</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td class="pc-w620-spacing-0-0-8-0" valign="top" style="padding: 0px 0px 8px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-textAlign-left" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt pc-w620-textAlign-left pc-w620-fontSize-16 pc-w620-lineHeight-26" style="line-height: 24px; letter-spacing: 0px; font-family: 'Nunito', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #121212; text-align: left; text-align-last: left;">
                                             <div><span style="text-transform: uppercase;">Alıcı : ${userName}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="left">
                                            <div class="pc-font-alt pc-w620-textAlign-left" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                                             <div><span>${address}</span>
                                          </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="left">
                                            <div class="pc-font-alt pc-w620-textAlign-left" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                                                <div><span>${city}/${country}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" width="100%" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" align="left" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt pc-w620-textAlign-left" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                                              <div><span>Telefon No : ${phoneNo}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                   </table>
                                  </td>
                                 </tr>
                                </table>
                               </td>
                               <td class="pc-grid-td-last pc-w620-itemsSpacings-0-30" align="left" valign="top" style="width: 33.333333333333%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 20px;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                 <tr>
                                  <td class="pc-w620-halign-left pc-w620-valign-middle" align="left" valign="top">
                                   <table class="pc-w620-halign-left" align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td class="pc-w620-spacing-0-0-8-0" valign="top" style="padding: 0px 0px 8px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-textAlign-left" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt pc-w620-textAlign-left pc-w620-fontSize-16 pc-w620-lineHeight-26" style="line-height: 24px; letter-spacing: 0px; font-family: 'Nunito', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; font-variant-ligatures: normal; color: #121212; text-align: left; text-align-last: left;">
                                             <div><span style="text-transform: capitalize;">Ödeme : ${paymentMtd}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="left">
                                            <div class="pc-font-alt pc-w620-textAlign-left" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                                             <div><span>Ara Toplam :                 ₺${itemsPrice}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="left">
                                            <div class="pc-font-alt pc-w620-textAlign-left" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                                             <div><span>Vergi:                               ₺${taxAmount}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                    <tr>
                                     <td class="pc-w620-halign-left" align="left" valign="top">
                                      <table class="pc-w620-halign-left" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="left" style="padding: 0px 0px 0px 0px;">
                                            <div class="pc-font-alt pc-w620-textAlign-left pc-w620-lineHeight-24" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: left; text-align-last: left;">
                                             <div><span>Kargo :                               ₺${shippingAmount}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                   </table>
                                  </td>
                                 </tr>
                                </table>
                               </td>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                     <tr align="center" valign="middle">
                      <td class="pc-w620-valign-middle pc-w620-width-100pc" width="518" valign="middle" style="border-bottom: 1px solid #d1dfe3;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td style="padding: 20px 0px 20px 20px;" align="center">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                           <tr>
                            <td class="pc-w620-valign-middle pc-w620-halign-left">
                             <table class="pc-width-fill pc-w620-gridCollapsed-0 pc-w620-width-fill pc-w620-halign-left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr class="pc-grid-tr-first pc-grid-tr-last">
                               <td class="pc-grid-td-first pc-w620-itemsSpacings-0-20" align="center" valign="middle" style="width: 33.333333333333%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 0px;">
                                <table class="pc-w620-width-hug" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                 <tr>
                                  <td class="pc-w620-halign-left pc-w620-valign-middle" align="center" valign="middle">
                                   <table class="pc-w620-halign-left pc-w620-width-hug" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                    <tr>
                                     <td class="pc-w620-halign-left" align="center" valign="top">
                                      <table class="pc-w620-halign-left" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="center">
                                            <div class="pc-font-alt pc-w620-textAlign-left" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: center; text-align-last: center;">
                                             <div><span style="font-size: 16px;font-weight: 700;font-style: normal;line-height: 22px;">Toplam(${orderProducts?.length} Ürün</span><span>)</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                   </table>
                                  </td>
                                 </tr>
                                </table>
                               </td>
                               <td class="pc-grid-td-last pc-w620-itemsSpacings-0-20" align="center" valign="middle" style="width: 33.333333333333%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 20px;">
                                <table class="pc-w620-width-hug" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                 <tr>
                                  <td class="pc-w620-halign-left pc-w620-valign-middle pc-w620-height-hug" align="center" valign="middle">
                                   <table class="pc-w620-halign-left pc-w620-width-hug" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                    <tr>
                                     <td class="pc-w620-halign-left" align="center" valign="top">
                                      <table class="pc-w620-halign-left" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                       <tr>
                                        <td valign="top" style="padding: 0px 0px 2px 0px;">
                                         <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                          <tr>
                                           <td valign="top" class="pc-w620-textAlign-left" align="center">
                                            <div class="pc-font-alt pc-w620-textAlign-left" style="line-height: 24px; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; font-variant-ligatures: normal; color: #121212cc; text-align: center; text-align-last: center;">
                                             <div><span> </span><span style="font-size: 16px;font-weight: 700;font-style: normal;line-height: 22px;">₺${totalAmount}</span>
                                             </div>
                                            </div>
                                           </td>
                                          </tr>
                                         </table>
                                        </td>
                                       </tr>
                                      </table>
                                     </td>
                                    </tr>
                                   </table>
                                  </td>
                                 </tr>
                                </table>
                               </td>
                              </tr>
                             </table>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                      </td>
                     </tr>
                    </tbody>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Order Details -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: FAQ -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-0-0-0-0" style="padding: 0px 0px 0px 0px; border-radius: 0px; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td>
                   <table class="pc-width-fill pc-w620-gridCollapsed-0" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: FAQ -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Questions? -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-32-24-32-24" style="padding: 48px 32px 48px 32px; border-radius: 0px; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td align="left">
                   <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                     <td valign="top">
                      <table class="pc-width-hug pc-w620-gridCollapsed-1" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr class="pc-grid-tr-first pc-grid-tr-last">
                        <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-10-20" valign="top" style="width: 50%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                         <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                          <tr>
                           <td class="pc-w620-halign-center pc-w620-valign-top" align="left" valign="top" style="padding: 20px 20px 20px 20px; background-color: #fff8f0; border-radius: 8px 8px 8px 8px;">
                            <table class="pc-w620-halign-center" align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                             <tr>
                              <td class="pc-w620-halign-center" align="left" valign="top">
                               <table class="pc-w620-halign-center" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                 <td class="pc-w620-valign-middle pc-w620-halign-center" align="left">
                                  <table class="pc-width-hug pc-w620-gridCollapsed-1 pc-w620-halign-center" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr class="pc-grid-tr-first pc-grid-tr-last">
                                    <td class="pc-grid-td-first pc-w620-itemsSpacings-0-20" valign="middle" style="padding-top: 0px; padding-right: 6px; padding-bottom: 0px; padding-left: 0px;">
                                     <table class="pc-w620-width-fill" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                      <tr>
                                       <td class="pc-w620-padding-0-0-0-0 pc-w620-halign-center pc-w620-valign-middle" align="left" valign="middle" style="padding: 0px 11px 0px 2px;">
                                        <table class="pc-w620-halign-center pc-w620-width-fill" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td class="pc-w620-halign-center" align="left" valign="top">
                                           <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                             <td class="pc-w620-halign-center" align="left" valign="top">
                                              <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453664/beybuilmek/email/ebh3y6crihuushnyptcx.png" class="pc-w620-align-center" width="64" height="64" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:64px; height: auto; max-width: 100%;" />
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                    <td class="pc-grid-td-last pc-w620-itemsSpacings-0-20" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 6px;">
                                     <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                                      <tr>
                                       <td align="left" valign="middle" style="padding: 0px 0px 0px 0px;">
                                        <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                         <tr>
                                          <td align="left" valign="top">
                                           <table width="100%" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                             <td valign="top" style="padding: 0px 0px 4px 0px;">
                                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" align="left" style="border-collapse: separate; border-spacing: 0;">
                                               <tr>
                                                <td valign="top" class="pc-w620-align-center" align="left" style="padding: 0px 0px 0px 0px;">
                                                 <div class="pc-font-alt pc-w620-align-center pc-w620-fontSize-20px" style="line-height: 21px; letter-spacing: -0.2px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; font-variant-ligatures: normal; color: #121212; text-align: left; text-align-last: left;">
                                                  <div><span style="letter-spacing: 0px;" data-letter-spacing-original="0">Sorunuz Varmı?</span>
                                                  </div>
                                                 </div>
                                                </td>
                                               </tr>
                                              </table>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                         <tr>
                                          <td align="left" valign="top">
                                           <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="left" style="border-collapse: separate; border-spacing: 0;">
                                            <tr>
                                             <td valign="top" class="pc-w620-align-center" align="left">
                                              <div class="pc-font-alt pc-w620-align-center" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: left; text-align-last: left;">
                                               <div><span style="color: rgb(18, 18, 18);">﻿Eğer herhangi bir konuda yardıma ihtiyacınız varsa lütfen email destek hattımıza yazabilirsiniz</span><span style="text-transform: lowercase; font-weight: 600;font-style: normal;color: rgb(255, 85, 74);">beybuilmek@gmail.com</span>
                                               </div>
                                              </div>
                                             </td>
                                            </tr>
                                           </table>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Questions? -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Footer -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
             
                 <td valign="top" class="pc-w620-padding-30-24-40-24" style="background-size: cover; background-position: center; background-repeat: no-repeat; padding: 50px 40px 50px 40px; border-radius: 0px; background-color: #1d1b2d;" bgcolor="#1d1b2d" background="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453654/beybuilmek/email/ctveov34xebw8ch00mjz.png">       
  
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-20-0" align="center" style="padding: 0px 0px 40px 0px;">
                   <table class="pc-width-hug pc-w620-gridCollapsed-0" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-w620-itemsSpacings-20-0" valign="middle" style="padding-top: 0px; padding-right: 15px; padding-bottom: 0px; padding-left: 0px;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top">
                               <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453672/beybuilmek/email/pe89ytnvkxswgbbi18dy.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:20px; height:20px;" alt="" />
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                     <td class="pc-w620-itemsSpacings-20-0" valign="middle" style="padding-top: 0px; padding-right: 15px; padding-bottom: 0px; padding-left: 15px; mso-padding-left-alt: 0; margin-left: 15px;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top">
                               <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453717/beybuilmek/email/w0a6hy3lsvrubmgxauwv.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:20px; height:20px;" alt="" />
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                     <td class="pc-w620-itemsSpacings-20-0" valign="middle" style="padding-top: 0px; padding-right: 15px; padding-bottom: 0px; padding-left: 15px; mso-padding-left-alt: 0; margin-left: 15px;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top">
                               <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453683/beybuilmek/email/gvtv0bm8n9snrczkixle.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:20px; height:20px;" alt="" />
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                     <td class="pc-grid-td-last pc-w620-itemsSpacings-20-0" valign="middle" style="padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 15px; mso-padding-left-alt: 0; margin-left: 15px;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                       <tr>
                        <td align="center" valign="middle">
                         <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top">
                               <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718453641/beybuilmek/email/xkejtneoh5q5ajdtjf07.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:20px; height:20px;" alt="" />
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-align-center" align="center" valign="top" style="padding: 0px 0px 20px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-center" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" class="pc-w620-align-center" align="center" style="padding: 0px 0px 0px 0px;">
                     <div class="pc-font-alt pc-w620-align-center pc-w620-fontSize-14px" style="line-height: 130%; letter-spacing: -0px; font-family: 'Nunito Sans', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #ffffffcc; text-align: center; text-align-last: center;">
                       <div><span >©Beybuilmek Bütün Hakları Saklıdır.<br/>Yalı Mah. Kavak Cad. No:46 Gölcük /Kocaeli</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <!--[if gte mso 9]>
                                                </td>
                                                <td width="40" style="line-height: 1px; font-size: 1px;" valign="top">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td colspan="3" height="50" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <p style="margin:0;mso-hide:all"><o:p xmlns:o="urn:schemas-microsoft-com:office:office">&nbsp;</o:p></p>
                    </v:textbox>
                </v:rect>
                <![endif]-->
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Footer -->
         </td>
        </tr>
       
       </table>
      </td>
     </tr>
    </table>
   </td>
  </tr>
 </table>
 <!-- Fix for Gmail on iOS -->
 <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
 </div>
</body>

</html>
 

`
}
