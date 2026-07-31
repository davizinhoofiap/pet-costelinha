const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateLogoMotionMedia() {
  console.log('🚀 Gerando imagem de alta resoluçao da Logo Motion para LinkedIn Media...');

  const htmlPath = path.join(__dirname, '..', 'public', 'logo-motion.html');
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Wait for GSAP animation to complete
  await new Promise(resolve => setTimeout(resolve, 2500));

  const targetElement = await page.$('#motion-stage');
  if (targetElement) {
    const outputPath = path.join(screenshotsDir, 'pet_costelinha_logo_motion_linkedin.png');
    await targetElement.screenshot({ path: outputPath });
    console.log(`📸 Imagem de Logo Motion gerada com sucesso: docs/screenshots/pet_costelinha_logo_motion_linkedin.png`);
  }

  await browser.close();
}

generateLogoMotionMedia().catch(err => {
  console.error('Erro na geraçao do Logo Motion:', err);
  process.exit(1);
});
