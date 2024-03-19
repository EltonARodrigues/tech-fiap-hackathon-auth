import nodemailer from "nodemailer";
import { SQSEvent } from 'aws-lambda';

import { searchUserBySub } from '../../middleware/provider/confirmUser';

async function enviaNotificacao(
  to: string,
  pedidoId: string,
  pedidoEmProducao: boolean
): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string,
    },
  });

  const conteudoEmail = {
    from: process.env.EMAIL_FROM as string,
    to,
    subject: pedidoEmProducao ? "Pedido em Producao ✔" : "Revisao Pedido ✘",
    text: pedidoEmProducao
      ? "Pagamento confirmado! Aguardando preparo"
      : `Erro no pagamento, Revise o pedido: ${pedidoId}`,
  };

  try {
    const info = await transporter.sendMail(conteudoEmail);

    console.log(`Id do envio: ${info.messageId}`);

    return true;
  } catch (err) {
    console.log(`Erro ao tentar enviar o email: ${err}`);
  }

  return false;
}

async function handler(event: SQSEvent) {
  try {

    for (const record of event.Records) {
      console.log('Processing message:', record.body);
      console.log(record.body)
      const { sub, pedidoId, pedidoEmProducao  } = JSON.parse(record.body);

      const userData = await searchUserBySub({
        UserPoolId: process.env.CLIENTES_POOL_ID,
        Filter: `sub = "${sub}"`,
        AttributesToGet: ["email"]
      });

      if (userData?.Users?.[0]?.Attributes?.[0]?.Name === 'email') {
        console.log(userData?.Users?.[0]?.Attributes?.[0]?.Value)
        const to = userData?.Users?.[0]?.Attributes?.[0]?.Value as string;

        try {
          await enviaNotificacao(to, pedidoId, pedidoEmProducao)
        } catch (err) {
          console.error('Error sending email:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

export { handler };
