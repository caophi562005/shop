import { RoleName } from '../src/shared/constants/role.constant'
import envConfig from '../src/shared/envConfig'
import { HashingService } from '../src/shared/services/hashing.service'
import { PrismaService } from '../src/shared/services/prisma.service'

const prisma = new PrismaService()
const hashingService = new HashingService()

const main = async () => {
  const roleCount = await prisma.role.count()
  if (roleCount > 0) {
    throw new Error('Roles already exist')
  }
  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.ADMIN,
        description: 'Admin role',
      },
      {
        name: RoleName.CLIENT,
        description: 'Client role',
      },
      {
        name: RoleName.SELLER,
        description: 'Seller role',
      },
    ],
  })

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.ADMIN,
    },
  })

  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })

  return {
    createdRoleCount: roles.count,
    adminUser,
  }
}

main()
  .then(({ adminUser, createdRoleCount }) => {
    console.log('Create roles : ', createdRoleCount)
    console.log('Create admin user : ', adminUser)
  })
  .catch(console.error)
