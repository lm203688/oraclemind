const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/home/z/my-project/browser_data3';
  
  // Connect to existing browser - but we can't, it's a different process
  // Instead, let me take a new screenshot with better cropping
  
  // Actually, let me just crop the existing screenshot
  const { execSync } = require('child_process');
  
  // Get image dimensions
  const size = execSync("identify /home/z/my-project/scan_qr.png | awk '{print $3}'").toString().trim();
  console.log('Image size:', size);
  
  // The QR code is typically in the right side of the login page
  // Let's crop the right portion where the QR code is
  // Image is 1280x800, QR code is roughly in the right-center area
  // Let's try cropping: x=700, y=100, width=500, height=500
  execSync('convert /home/z/my-project/scan_qr.png -crop 450x450+750+150 /home/z/my-project/qr_cropped.png');
  console.log('Cropped QR saved');
  
  // Also try to get the QR code image directly from the page
  // We need to use the existing browser context...
  // Since we can't, let's just use the cropped version
  
})();
