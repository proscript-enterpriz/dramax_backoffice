export const getChatText = (data: {
  title?: string | null;
  pin?: string | null;
  token: string;
}) => {
  let chat = `
${data.title ? '🎬 Кино: ' + data.title : ''}

⏰ Энэ линк 12 цагийн хугацаанд хүчинтэй

👉 Үзэх линк:
https://dramax.mn?ot=${data.token}
            `;

  if (data.pin) {
    chat += `

PIN: ${data.pin}`;
  }

  return chat;
};
