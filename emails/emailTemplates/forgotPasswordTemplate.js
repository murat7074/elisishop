export const forgotPasswordTemplate = ({verifyUrl, userName}) => `
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        body {
            background-color: #f7fafc;
            color: #4a5568;
            font-family: Arial, sans-serif;
        }
        .container {
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            margin: 40px auto;
            padding: 20px;
        }
        .header {
            margin-bottom: 20px;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            padding: 10px;
        }
        .header img {
            border-radius: 8px;
            width: 120px;
            height: 50px;
        }
        .content {
            text-align: left;
        }
        .content h2 {
            color: #2d3748;
            font-weight: normal;
        }
        .content h2 span {
            font-weight: bold;
            text-transform: capitalize;
        }
        .content p {
            margin-top: 16px;
            line-height: 1.6;
        }
        .button {
            background-color: #ffbe00;
            color: #000000;
            display: inline-block;
            padding: 12px 40px;
            text-align: center;
            text-decoration: none;
            margin-top: 20px;
            border-radius: 4px;
        }
        .footer {
            color: #a0aec0;
            margin-top: 40px;
            margin-left: 20px;
            font-size: 14px;
        }
        .footer p {
            margin: 4px 0;
        }
        .break-word {
            word-break: break-all;
            color: #3182ce;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <a href="https://Beybuilmek.com">
                <img src="https://res.cloudinary.com/dwzrxtidw/image/upload/v1718368106/beybuilmek/email/ff1xflp8gbwxzqu9skld.jpg" alt="Beybuilmek Logo">
            </a>
        </div>
        <div class="content">
            <h2>Merhaba, <span>${userName}</span></h2>
            <p>Parolanızı yeniden oluşturmak için Beybuilmek'e istekde bulundunuz. Parolanızı oluşturmak için butona tıklayın.</p>
            <p><strong>Lütfen 30 dakika içinde linke tıklayarak parolanızı değşitirin.</strong></p>
            <p>
                <a href="${verifyUrl}" class="button" target="_blank">Yeni Parola Oluştur</a>
            </p>
           
            <p> Parola değiştirmek için istekde bulunmadıysanız bu emaili görmezden gelin.</p>
            <p>Teşekkürler,<br>Beybuilmek</p>
            <p class="break-word">Butonla ilgili sorun yaşıyorsanız, aşağıdaki URL'i kopyalayıp kendi tarayıcınızda çalıştırabilirsiniz:</p>
            <a href="${verifyUrl}" class="break-word">${verifyUrl}</a>
        </div>
         <div class="footer">
            <p>Beybuilmek</p>
            <p>Donanma Mah.</p>
            <p>İlhantuba Cad. Gölcük</p>
        </div>
    </div>
</body>

</html>
`;

