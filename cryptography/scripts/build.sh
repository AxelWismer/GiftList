rm -r build
mkdir build
npx tsc
mv index.js build/index.js
cp index.ts build/index.ts
cp package.json build/package.json