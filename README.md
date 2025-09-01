This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Hướng dẫn cài đặt và chạy dự án

```bash
git clone https://github.com/HongVi711/CV-Filter.git

Xóa thư mục migration trong thư mục prisma

Tạo file .env với nội dung như sau

DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=<schema>" -> thay bằng db url của bạn

OPENAI_API_KEY="sk...." -> thay openai api key của bạn

Mở terminal và run theo thứ tự sau:

npm install

npx prisma migrate dev --init

npm run seed

npx prisma generate

npm run dev



