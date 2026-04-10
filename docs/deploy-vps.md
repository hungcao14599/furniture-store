# Deploy Len VPS

Tai lieu nay huong dan deploy ca frontend va backend len VPS trong truong hop:

- frontend duoc build ra `frontend/dist`
- `frontend/dist` duoc Nginx serve static
- backend duoc build ra `backend/dist`
- backend chay bang `systemd` tren `127.0.0.1:5000`
- Nginx reverse proxy cac duong dan `/api`, `/docs`, `/health`
- database da nam o server khac, VPS chi dung de chay code
- anh upload moi di thang len Supabase Storage, khong luu local tren VPS

Sau khi deploy xong, ban truy cap bang:

- `http://YOUR_VPS_IP:3110`

Tai lieu nay dang dung path mau:

- source code: `/var/www/app/furniture-store`
- service: `noithat-viethung-backend`
- nginx site: `noithat-viethung`

Neu ban dung path khac, sua lai dong bo trong:

- `docs/deploy-vps.md`
- `deploy/noithat-viethung-backend.service`
- `deploy/nginx.noithat-viethung.conf`

## 1. Tong quan FE va BE sau deploy

Frontend:

- code nam o `frontend`
- build bang `npm run build --workspace frontend`
- output sau build la `frontend/dist`
- Nginx doc file tu `frontend/dist` va tra ve HTML/CSS/JS cho nguoi dung

Backend:

- code nam o `backend`
- build bang `npm run build --workspace backend`
- output sau build la `backend/dist/src/server.js`
- `systemd` chay lenh `npm run start` trong thu muc `backend`
- backend lang nghe noi bo o `127.0.0.1:5000`

Build toan bo:

- `npm run build` o root se build ca backend va frontend

## 2. Chuan bi VPS

Yeu cau toi thieu:

- Ubuntu 22.04+ hoac tuong duong
- Node.js 20+
- npm 10+
- Nginx
- Git
- khong can cai PostgreSQL local neu da co `DATABASE_URL` tu xa

Cai nhanh:

```bash
sudo apt update
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
nginx -v
```

Neu VPS co firewall hoac security group, nho mo cong `3110`.

## 3. Mo port 3110 tren Google Cloud

Neu VPS cua ban dang chay tren Google Cloud VM va da cau hinh Nginx listen cong `3110`, ban phai mo firewall rule tren Google Cloud thi moi truy cap duoc tu ben ngoai.

Cach mo port bang Google Cloud Console:

1. Vao `https://console.cloud.google.com`
2. Chon project dang chua VM
3. Vao `VPC network` -> `Firewall`
4. Bam `Create Firewall Rule`
5. Dien cac truong co ban:

- `Name`: `allow-3110`
- `Network`: chon VPC network dang dung cho VM
- `Direction of traffic`: `Ingress`
- `Action on match`: `Allow`
- `Targets`: `All instances in the network`
- `Source IPv4 ranges`: `0.0.0.0/0`
- `Protocols and ports`: tick `Specified protocols and ports`, nhap `tcp:3110`

6. Bam `Create`

Neu ban dung `Targets` theo network tag thay vi `All instances in the network`, hay gan dung tag do cho VM trong phan network settings cua instance.

Sau khi tao firewall rule, co the kiem tra lai:

- VM co external IP
- Nginx da `listen 3110`
- firewall rule da allow `tcp:3110`

## 4. Dua source code len VPS

Tao thu muc chua source:

```bash
sudo mkdir -p /var/www/app/furniture-store
sudo chown -R $USER:$USER /var/www/app/furniture-store
```

Clone code:

```bash
git clone <repo-url> /var/www/app/furniture-store
cd /var/www/app/furniture-store
```

Neu thu muc nay da co source san, bo qua buoc `git clone` va chi can:

```bash
cd /var/www/app/furniture-store
```

Cai dependency cho ca backend va frontend:

```bash
npm ci --include=dev
```

Vi repo dang dung `workspaces`, `npm ci --include=dev` o root se cai package cho ca `backend` va `frontend`, bao gom ca `devDependencies` can thiet cho buoc build nhu `typescript`, `tsx`, `prisma`.

Neu shell tren VPS dang dat san `NODE_ENV=production` hoac `NPM_CONFIG_PRODUCTION=true`, `npm ci` thuong se bo qua `devDependencies`, dan den loi kieu `sh: 1: tsc: not found`.

## 5. Cau hinh backend

Tao file env cho backend:

```bash
cd /var/www/app/furniture-store
cp backend/.env.production.example backend/.env
```

Sua file `backend/.env` va cap nhat it nhat:

- `PORT=5000`
- `NODE_ENV=production`
- `DATABASE_URL` tro toi database tu xa cua ban
- `JWT_SECRET`
- `FRONTEND_URL=http://YOUR_VPS_IP:3110`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Neu ban co du lieu cu dang tro toi `/uploads/...`, moi can tao thu muc nay:

```bash
mkdir -p /var/www/app/furniture-store/backend/uploads
```

Neu tat ca anh deu luu tren Supabase, bo qua buoc nay.

## 6. Cau hinh frontend

Tao file env cho frontend:

```bash
cd /var/www/app/furniture-store
cp frontend/.env.production.example frontend/.env.production
```

Mac dinh frontend production da dung cho mo hinh Nginx reverse proxy:

- `VITE_API_URL=/api`
- `VITE_BACKEND_URL=`

Y nghia:

- frontend se goi API qua `http://YOUR_VPS_IP:3110/api`
- anh tu Supabase se dung URL public tra ve tu backend
- neu con du lieu cu dung `/uploads/...` thi frontend van resolve qua cung domain va cung port `3110`

Neu ban van dung mo hinh nay thi thuong khong can sua `frontend/.env.production`.

## 7. Build backend va frontend

Chay generate Prisma cho backend:

```bash
cd /var/www/app/furniture-store
npm run prisma:generate --workspace backend
```

Neu database tu xa dang thieu migration, apply migration:

```bash
npm run prisma:migrate:deploy --workspace backend
```

Neu database da dung schema roi, co the bo qua buoc tren.

Build backend va frontend:

```bash
npm run build
```

Ket qua can co:

- `backend/dist/src/server.js`
- `frontend/dist/index.html`

Neu can seed du lieu lan dau:

```bash
npm run prisma:seed --workspace backend
```

## 8. Chay backend bang systemd

Copy file service mau:

```bash
sudo cp deploy/noithat-viethung-backend.service /etc/systemd/system/noithat-viethung-backend.service
```

File nay dung de:

- chay backend bang `npm run start`
- tu dong restart neu backend bi crash
- khoi dong cung he thong
- xem log bang `journalctl`

Template hien tai dang tro toi:

- `WorkingDirectory=/var/www/app/furniture-store/backend`
- `EnvironmentFile=/var/www/app/furniture-store/backend/.env`

Neu source cua ban nam o path khac, sua file service truoc khi copy.

Nap lai systemd va khoi dong backend:

```bash
sudo systemctl daemon-reload
sudo systemctl enable noithat-viethung-backend
sudo systemctl restart noithat-viethung-backend
sudo systemctl status noithat-viethung-backend
```

Xem log backend:

```bash
sudo journalctl -u noithat-viethung-backend -f
```

Kiem tra backend noi bo:

```bash
curl http://127.0.0.1:5000/health
```

## 9. Chay frontend bang Nginx

Copy file Nginx mau:

```bash
sudo cp deploy/nginx.noithat-viethung.conf /etc/nginx/sites-available/noithat-viethung
```

File Nginx nay lam 2 viec:

- serve frontend tu `frontend/dist`
- proxy request `/api`, `/docs`, `/health` vao backend `127.0.0.1:5000`

Luu y ve `/uploads`:

- template Nginx van giu location `/uploads` de tuong thich voi du lieu cu
- neu he thong cua ban chi dung Supabase Storage va khong co URL local `/uploads/...`, co the giu nguyen hoac xoa location nay deu duoc

Template hien tai dang tro toi:

- `root /var/www/app/furniture-store/frontend/dist;`
- `listen 3110;`
- `server_name _;`

Neu ban dung IP va cong `3110`, co the giu nguyen.

Neu muon khoa chat hon, sua:

- `server_name YOUR_VPS_IP;`

Bat config va reload Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/noithat-viethung /etc/nginx/sites-enabled/noithat-viethung
sudo nginx -t
sudo systemctl restart nginx
```

## 10. Kiem tra sau deploy

Kiem tra backend noi bo:

```bash
curl http://127.0.0.1:5000/health
```

Kiem tra frontend qua Nginx:

```bash
curl -I http://YOUR_VPS_IP:3110
```

Kiem tra backend qua Nginx:

```bash
curl -I http://YOUR_VPS_IP:3110/health
curl -I http://YOUR_VPS_IP:3110/api/categories
```

Kiem tra Swagger:

```bash
curl -I http://YOUR_VPS_IP:3110/docs
```

Neu truy cap tren trinh duyet, cac URL can thu la:

- `http://YOUR_VPS_IP:3110`
- `http://YOUR_VPS_IP:3110/health`
- `http://YOUR_VPS_IP:3110/docs`

## 11. Deploy lan dau: tom tat nhanh

Neu can mot chuoi lenh ngan gon cho lan deploy dau tien:

```bash
sudo apt update
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo mkdir -p /var/www/app/furniture-store
sudo chown -R $USER:$USER /var/www/app/furniture-store

git clone <repo-url> /var/www/app/furniture-store
cd /var/www/app/furniture-store

npm ci --include=dev
cp backend/.env.production.example backend/.env
cp frontend/.env.production.example frontend/.env.production

# sua backend/.env truoc khi chay tiep
# neu dung Google Cloud, mo firewall tcp:3110 truoc khi test ngoai Internet

npm run prisma:generate --workspace backend
npm run prisma:migrate:deploy --workspace backend
npm run build

sudo cp deploy/noithat-viethung-backend.service /etc/systemd/system/noithat-viethung-backend.service
sudo cp deploy/nginx.noithat-viethung.conf /etc/nginx/sites-available/noithat-viethung

sudo systemctl daemon-reload
sudo systemctl enable noithat-viethung-backend
sudo systemctl restart noithat-viethung-backend

sudo ln -sf /etc/nginx/sites-available/noithat-viethung /etc/nginx/sites-enabled/noithat-viethung
sudo nginx -t
sudo systemctl restart nginx
```

## 12. Update code cho ca backend va frontend

Moi lan update code:

```bash
cd /var/www/app/furniture-store
git pull
npm ci --include=dev
npm run prisma:generate --workspace backend
npm run prisma:migrate:deploy --workspace backend
npm run build
sudo systemctl restart noithat-viethung-backend
sudo systemctl restart nginx
```

Neu lan update do khong co migration moi, co the bo qua `npm run prisma:migrate:deploy --workspace backend`.

## 13. Luu y

- `FRONTEND_URL` trong `backend/.env` phai khop URL that nguoi dung truy cap.
- Neu truy cap bang IP va cong `3110`, dat `FRONTEND_URL=http://YOUR_VPS_IP:3110`.
- Backend khong mo public cong `5000`; nguoi dung chi truy cap cong `3110`.
- Frontend duoc phuc vu boi Nginx, khong can chay `vite preview`.
- Upload hien tai dung `multer.memoryStorage()` va day file thang len Supabase Storage, khong can luu local tren VPS.
- Neu toan bo anh deu o Supabase thi khong can tao `backend/uploads`.
- `npm run prisma:migrate` khong dung cho production. Tren VPS hay dung `npm run prisma:migrate:deploy --workspace backend`.
- Neu build bi loi `tsc: not found` hoac `tsx: not found`, hay cai lai bang `npm ci --include=dev` va kiem tra shell khong ep `omit=dev`.
- Neu deploy tren Google Cloud ma truy cap bang IP khong vao duoc, thu kiem tra firewall rule `tcp:3110` truoc khi debug Nginx hay Node.js.
