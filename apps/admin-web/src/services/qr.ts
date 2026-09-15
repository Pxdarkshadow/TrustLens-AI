import type { QRCodeData, GenerateQRCodeResponse } from '../types/product';

export const qrService = {
  // Parse QR code data from string
  parseQRData: (qrString: string): QRCodeData | null => {
    try {
      // New format: trustlens://verify/{productId}?t={timestamp}
      if (qrString.startsWith('trustlens://verify/')) {
        const url = new URL(qrString);
        const productId = url.pathname.replace('/verify/', '');
        const timestamp = url.searchParams.get('t') || new Date().toISOString();

        return {
          productId,
          verificationUrl: `${window.location.origin}/verify/${productId}`,
          timestamp,
        };
      }

      // Legacy format: CONTRACT_ADDRESS,SERIAL_NUMBER
      if (qrString.includes(',')) {
        const [_contractAddress, serialNumber] = qrString.split(',');
        return {
          productId: serialNumber,
          verificationUrl: `${window.location.origin}/verify/${serialNumber}`,
          timestamp: new Date().toISOString(),
        };
      }

      // Plain serial number
      return {
        productId: qrString,
        verificationUrl: `${window.location.origin}/verify/${qrString}`,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  // Generate QR code data string for display
  generateQRString: (data: GenerateQRCodeResponse['qrCodeData']): string => {
    return data.verificationUrl;
  },

  // Download QR code as image
  downloadQRImage: async (qrCodeImageUrl: string, filename: string): Promise<void> => {
    try {
      const response = await fetch(qrCodeImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      throw error;
    }
  },
};

export default qrService;