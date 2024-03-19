import { object, string } from 'yup';

const adminSchema = object({
  email: string().email().required(),
  password: string().required(),
});

export default async function validateAdminData(email: string, password: string) {
  await adminSchema.validate({ email, password });
}
