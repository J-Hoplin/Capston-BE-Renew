export const emailVerificationHTML = (url: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Email Authentication</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
    }
    h1 {
      margin-bottom: 20px;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
    #status {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>Email Authentication</h1>
  <form action="${url}" method="GET">
    <button id="authenticateButton">이메일 인증하기</button>
  </form> 
</body>
</html>
  `;
};
