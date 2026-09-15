#!/usr/bin/env bash
set -e
BASE=http://localhost:3001/api
JQ() { python -c "import sys,json;d=json.load(sys.stdin);print($1)"; }

login() { curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" -d "{\"username\":\"$1\",\"password\":\"$2\"}"; }
AT() { echo "$1" | python -c "import sys,json;print(json.load(sys.stdin)['data']['tokens']['accessToken'])"; }
RT() { echo "$1" | python -c "import sys,json;print(json.load(sys.stdin)['data']['tokens']['refreshToken'])"; }

echo "---------------------------"
echo "ADMIN"
ADMIN=$(login admin admin); echo "$ADMIN" | head -c 150; echo " ..."
AAT=$(AT "$ADMIN")

echo "---------------------------"
echo "[2] auth/me"
curl -s $BASE/auth/me -H "Authorization: Bearer $AAT"; echo

echo "[3] auth/refresh"
ART=$(RT "$ADMIN")
curl -s -X POST $BASE/auth/refresh -H "Content-Type: application/json" -d "{\"refreshToken\":\"$ART\"}" | head -c 120; echo

echo "[4] GET /users (admin)"
curl -s "$BASE/users?page=1&limit=2&search=" -H "Authorization: Bearer $AAT" | head -c 500; echo

echo "[5] POST /users (create unique user)"
SRAND="tester_$$_$RANDOM"
NEW=$(curl -s -X POST $BASE/users -H "Authorization: Bearer $AAT" -H "Content-Type: application/json" -d "{\"username\":\"$SRAND\",\"password\":\"password1\",\"role\":\"retailer\"}")
echo "$NEW" | head -c 400; echo
NEWUID=$(echo "$NEW" | python -c "import sys,json;print(json.load(sys.stdin)['data']['data']['id'])")

echo "[6] GET /users/:id"
curl -s $BASE/users/$NEWUID -H "Authorization: Bearer $AAT" | head -c 200; echo

echo "[7] PATCH /users/:id/role -> supplier"
curl -s -X PATCH $BASE/users/$NEWUID/role -H "Authorization: Bearer $AAT" -H "Content-Type: application/json" -d '{"role":"supplier"}' | head -c 200; echo

echo "[8] DELETE /users/:id"
curl -s -X DELETE $BASE/users/$NEWUID -H "Authorization: Bearer $AAT"; echo

echo "[9] GET /profiles (admin)"
curl -s $BASE/profiles -H "Authorization: Bearer $AAT" | head -c 300; echo

echo "[10] GET /profiles/manu"
curl -s $BASE/profiles/manu -H "Authorization: Bearer $AAT" | head -c 250; echo

echo "[11] PATCH /profiles/me (admin)"
curl -s -X PATCH $BASE/profiles/me -H "Authorization: Bearer $AAT" -H "Content-Type: application/json" -d '{"location":"HQ Singapore"}' | head -c 250; echo

echo "[12] POST /profiles/me/image (multipart)"
UP=$(curl -s -X POST $BASE/profiles/me/image -H "Authorization: Bearer $AAT" -F "image=@smoke-tmp.png")
echo "$UP" | head -c 250; echo
FNAME=$(echo "$UP" | python -c "import sys,json;print(json.load(sys.stdin)['data']['data']['filename'])")

echo "[13] GET /profiles/image/:filename"
curl -s -o /dev/null -w "http=%{http_code} type=%{content_type}\n" $BASE/profiles/image/$FNAME -H "Authorization: Bearer $AAT"

echo "[14] GET /products list"
curl -s "$BASE/products?page=1&limit=2" -H "Authorization: Bearer $AAT" | head -c 400; echo

echo "[15] GET /products/c12345"
curl -s $BASE/products/c12345 -H "Authorization: Bearer $AAT" | head -c 600; echo

echo "---------------------------"
echo "MANUFACTURER"
MANU=$(login manu manu); MAT=$(AT "$MANU")

echo "[16] POST /products (create NEWPROD, multipart with image)"
curl -s -X POST $BASE/products -H "Authorization: Bearer $MAT" \
  -F serialNumber=sn-99001 -F name="Test Wallet" -F brand="TestBrand" -F description="desc" \
  -F manufacturerName="Manu Group" -F manufacturerLocation="Kuala Lumpur, Malaysia" -F "image=@smoke-tmp.png" \
  | head -c 700; echo

echo "[17] POST /products create duplicate serial (expect 409)"
curl -s -o /dev/null -w "http=%{http_code}\n" -X POST $BASE/products -H "Authorization: Bearer $MAT" \
  -F serialNumber=sn-99001 -F name="Dup"

echo "[18] PATCH /products/sn-99001 (multipart name+image)"
curl -s -X PATCH $BASE/products/sn-99001 -H "Authorization: Bearer $MAT" -F name="Test Wallet v2" -F "image=@smoke-tmp.png" | head -c 400; echo

echo "[19] POST images (multipart)"
IMG=$(curl -s -X POST $BASE/products/sn-99001/images -H "Authorization: Bearer $MAT" -F "image=@smoke-tmp.png")
echo "$IMG" | head -c 300; echo
IID=$(echo "$IMG" | python -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")
echo "[20] DELETE images/:id"; curl -s -X DELETE $BASE/products/sn-99001/images/$IID -H "Authorization: Bearer $MAT"; echo

echo "[21] POST qr (manufacturer/admin)"
curl -s -X POST $BASE/products/sn-99001/qr -H "Authorization: Bearer $MAT" | head -c 300; echo

echo "[22] GET qr/download"
curl -s -o /dev/null -w "http=%{http_code} type=%{content_type} size=%{size_download}\n" $BASE/products/sn-99001/qr/download -H "Authorization: Bearer $MAT"

echo "[23] verify (PUBLIC, no auth)"
curl -s -X POST $BASE/products/sn-99001/verify | head -c 300; echo
echo "[24] verify fake serial (no auth)"
curl -s -X POST $BASE/products/NOTEXIST/verify | head -c 150; echo

echo "---------------------------"
echo "SUPPLIER / RETAILER"
SUP=$(login supp supp); SAT=$(AT "$SUP")
RET=$(login retailer retailer); RAT=$(AT "$RET")

echo "[25] POST history supplier (sn-99001)"
curl -s -X POST $BASE/products/sn-99001/history -H "Authorization: Bearer $SAT" -H "Content-Type: application/json" \
  -d '{"actor":"CK Supplier","role":"supplier","location":"Singapore","timestamp":"2026-09-01T00:00:00.000Z","isSold":false}' | head -c 300; echo

echo "[26] GET history"
curl -s $BASE/products/sn-99001/history -H "Authorization: Bearer $AAT" | head -c 400; echo

echo "[27] POST history retailer isSold=true -> status sold"
curl -s -X POST $BASE/products/sn-99001/history -H "Authorization: Bearer $RAT" -H "Content-Type: application/json" \
  -d '{"actor":"RE retailer","role":"retailer","location":"Dubai","timestamp":"2026-09-05T00:00:00.000Z","isSold":true}' | head -c 200; echo

echo "[28] revoke then activate via manufacturer"
curl -s -X POST $BASE/products/sn-99001/revoke -H "Authorization: Bearer $MAT" | head -c 120; echo
curl -s -X POST $BASE/products/sn-99001/activate -H "Authorization: Bearer $MAT" | head -c 120; echo

echo "[29] role guard: admin tries POST /products (expect 403)"
curl -s -o /dev/null -w "http=%{http_code}\n" -X POST $BASE/products -H "Authorization: Bearer $AAT" -F serialNumber=x1 -F name=x

echo "[30] no auth on /products (expect 401)"
curl -s -o /dev/null -w "http=%{http_code}\n" $BASE/products

echo "[31] change-password manu"
# change manu pw to manu2 then back; use a throwaway check via login
curl -s -X POST $BASE/auth/change-password -H "Authorization: Bearer $MAT" -H "Content-Type: application/json" \
  -d '{"username":"manu","currentPassword":"manu","newPassword":"manu2"}' ; echo
LOGIN2=$(login manu manu2); echo "relogin manu2 success=$?"; echo "$LOGIN2" | head -c 60; echo

echo "ALL DONE"