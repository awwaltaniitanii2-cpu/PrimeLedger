import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("AdminPass2026", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password,
      role: "ADMIN",
    },
    create: {
      name: "PrimeLedger Admin",
      email: "admin@primeledger.com",
      username: "admin",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin ready:");
  console.log("Username: admin");
  console.log("Password: AdminPass2026");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });