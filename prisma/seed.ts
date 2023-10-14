import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export function md5(str: string): string {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

const prisma = new PrismaClient();
async function main() {
  const post1 = await prisma.user.upsert({
    create: {
      username: 'zhangsan',
      password: md5('111111'),
      email: 'xxx@xx.com',
      is_admin: true,
      nick_name: '张三',
      phone_number: '13233323333',
      roles: {
        create: {
          name: '管理员',
          permissions: {
            create: [
              {
                code: 'ccc',
                description: '访问 ccc 接口',
              },
              {
                code: 'ddd',
                description: '访问 ddd 接口',
              },
            ],
          },
        },
      },
    },
    where: { email: 'xxx@xx.com' },
    update: {},
  });
  const post2 = await prisma.user.upsert({
    create: {
      username: 'lisi',
      password: md5('222222'),
      email: 'yy@yy.com',
      nick_name: '李四',
      roles: {
        create: {
          name: '普通用户',
          permissions: {
            create: [
              {
                code: 'ccc',
                description: '访问 ccc 接口',
              },
            ],
          },
        },
      },
    },
    where: { email: 'yy@yy.com' },
    update: {},
  });
  console.log('🚀 ~ file: seed.ts:18 ~ main ~ post1:', post1, post2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
