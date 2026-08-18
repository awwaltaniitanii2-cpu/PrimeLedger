import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      username: "admin",
    },
  });

  if (!user) {
    console.error("ERROR: No user with username 'admin' exists.");
    process.exitCode = 1;
    return;
  }

  const passwordMatches = await bcrypt.compare(
    "AdminPass2026",
    user.password
  );

  console.log({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    passwordHashPresent: Boolean(user.password),
    passwordMatches,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });