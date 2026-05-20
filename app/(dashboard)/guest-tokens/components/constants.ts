export const getChatText = (data: {
  title?: string | null;
  pin?: string | null;
  token: string;
}) => `${data.title ? '🎬 ' + data.title + ' киног үзэх заавар' : ''}

1️⃣ Доорх линк дээр дарна уу 👇

👉 https://dramax.mn?ot=${data.token}

2️⃣ Сайт нээгдэхээр PIN код асуувал энэ кодыг бичнэ үү:

🔑 ${data.pin || 'PIN код админаас авна уу'}

3️⃣ Дараа нь “▶️ Тоглуулах” товч дээр дараад киногоо үзээрэй 😊

⏰ Анхаар: Энэ линк 12 цагийн хугацаанд хүчинтэй`;
