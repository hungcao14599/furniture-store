# Deploy Len VPS

Tai lieu nay dung cho mo hinh:

- `frontend/dist` duoc Nginx serve static
- `backend` chay bang `systemd` tren `127.0.0.1:5000`
- Nginx reverse proxy cac duong dan `/api`, `/uploads`, `/docs`, `/health`

Neu database dang nam o server/dich vu khac thi VPS nay chi can:

- source code
- Node.js + npm
- Nginx
- `DATABASE_URL` tro dung toi database tu xa

Tai lieu nay uu tien truong hop chua co domain that va dang truy cap bang:

- `http://YOUR_VPS_IP:3110`

## 1. Chuan bi VPS

Yeu cau toi thieu:

- Ubuntu 22.04+ hoac tuong duong
- Node.js 20+
- npm 10+
- Nginx
- khong can cai PostgreSQL local neu da co `DATABASE_URL` tu xa

Vi du cai nhanh:

```bash
sudo apt update
sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. Dua source len server

```bash
sudo mkdir -p /var/www/noithat-viethung
sudo chown -R $USER:$USER /var/www/noithat-viethung
git clone <repo-url> /var/www/noithat-viethung
cd /var/www/noithat-viethung
npm ci
```

## 3. Cau hinh environment

Backend:

```bash
cp backend/.env.production.example backend/.env
```

Can cap nhat it nhat:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL` voi gia tri dang `http://YOUR_VPS_IP:3110`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Frontend:

```bash
cp frontend/.env.production.example frontend/.env.production
```

Mac dinh frontend production da dung:

- `VITE_API_URL=/api`
- `VITE_BACKEND_URL=` rong de anh `/uploads/...` di qua cung domain

Neu API dat o domain khac, sua 2 bien nay thanh URL day du.

Neu can luu file local trong `backend/uploads`, tao thu muc truoc:

```bash
mkdir -p /var/www/noithat-viethung/backend/uploads
```

## 4. Build va migrate

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate:deploy --workspace backend
npm run build
```

Neu schema database tu xa da dung san va khong co migration moi, ban co the bo qua buoc `prisma:migrate:deploy`.

Neu can seed du lieu lan dau:

```bash
npm run prisma:seed --workspace backend
```

## 5. Tao service cho backend

Copy file mau:

```bash
sudo cp deploy/noithat-viethung-backend.service /etc/systemd/system/noithat-viethung-backend.service
```

Neu source khong nam o `/var/www/noithat-viethung`, sua lai:

- `WorkingDirectory`
- `EnvironmentFile`

Neu muon chay service bang user rieng, bo comment:

- `User`
- `Group`

Nap lai systemd va khoi dong service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable noithat-viethung-backend
sudo systemctl restart noithat-viethung-backend
sudo systemctl status noithat-viethung-backend
```

Log backend:

```bash
sudo journalctl -u noithat-viethung-backend -f
```

## 6. Cau hinh Nginx

Copy file mau:

```bash
sudo cp deploy/nginx.noithat-viethung.conf /etc/nginx/sites-available/noithat-viethung
```

Sua lai:

- `root`

Voi truong hop dung IP, file mau da de:

- `server_name _;`
- `listen 3110;`

Neu muon khoa chat hon, ban co the sua thanh:

- `server_name YOUR_VPS_IP;`

Bat site va reload:

```bash
sudo ln -sf /etc/nginx/sites-available/noithat-viethung /etc/nginx/sites-enabled/noithat-viethung
sudo nginx -t
sudo systemctl reload nginx
```

## 7. SSL voi Let's Encrypt

Neu chua co domain that, bo qua muc nay.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

## 8. Quy trinh deploy cap nhat

Moi lan cap nhat code:

```bash
cd /var/www/noithat-viethung
git pull
npm ci
npm run prisma:generate --workspace backend
npm run prisma:migrate:deploy --workspace backend
npm run build
sudo systemctl restart noithat-viethung-backend
sudo systemctl reload nginx
```

## 9. Kiem tra sau deploy

Kiem tra backend:

```bash
curl http://127.0.0.1:5000/health
```

Kiem tra domain:

```bash
curl -I http://YOUR_VPS_IP:3110
curl -I http://YOUR_VPS_IP:3110/health
```

## 10. Luu y

- `FRONTEND_URL` o backend nen chua dung domain that, co the cach nhau bang dau phay neu co `www` va non-`www`.
- Neu truy cap bang IP va cong 3110, dat `FRONTEND_URL=http://YOUR_VPS_IP:3110`.
- Thu muc `backend/uploads` phai ton tai va co quyen ghi neu ban luu file local.
- Neu dang upload anh len Supabase Storage thi frontend van chi can proxy `/api`; URL anh tu Supabase se hoat dong doc lap.
- `npm run prisma:migrate` khong dung cho production. Tren VPS hay dung `npm run prisma:migrate:deploy --workspace backend`.
- Truong hop cua ban la VPS chi deploy code thi thu quan trong nhat la `backend/.env` phai tro dung toi database ngoai qua `DATABASE_URL`.
- Neu VPS co firewall hoac security group, nho mo cong `3110`.
