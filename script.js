document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qr-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrCodeContainer = document.getElementById('qrcode');
    const qrResultContainer = document.getElementById('qr-result-container');
    const downloadBtn = document.getElementById('download-btn');
    
    let qrCode = null;

    generateBtn.addEventListener('click', generateQR);
    
    qrInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateQR();
        }
    });

    function generateQR() {
        const text = qrInput.value.trim();
        
        if (!text) {
            // Pequena animação de erro no input
            qrInput.style.animation = 'shake 0.5s';
            qrInput.style.borderColor = '#ef4444';
            setTimeout(() => {
                qrInput.style.animation = '';
                qrInput.style.borderColor = 'var(--border-color)';
            }, 500);
            return;
        }

        // Mudar estado do botão
        const originalText = generateBtn.innerText;
        generateBtn.innerText = 'Gerando...';
        generateBtn.style.opacity = '0.8';

        setTimeout(() => {
            // Limpar QR Code anterior se existir
            qrCodeContainer.innerHTML = '';
            
            // Gerar novo QR Code
            qrCode = new QRCode(qrCodeContainer, {
                text: text,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // Mostrar container com animação
            qrResultContainer.classList.add('show');
            downloadBtn.style.display = 'flex';
            
            // Restaurar botão
            generateBtn.innerText = originalText;
            generateBtn.style.opacity = '1';
        }, 300); // Pequeno delay para efeito visual
    }

    downloadBtn.addEventListener('click', () => {
        const img = qrCodeContainer.querySelector('img');
        if (!img) return;

        // Se a imagem usar base64 (como o qrcode.js geralmente faz)
        const imgSrc = img.getAttribute('src');
        if (imgSrc) {
            triggerDownload(imgSrc);
        } else {
            // Fallback para canvas se src da imagem não estiver disponível logo
            const canvas = qrCodeContainer.querySelector('canvas');
            if (canvas) {
                triggerDownload(canvas.toDataURL("image/png"));
            }
        }
    });

    function triggerDownload(url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});

// Adicionar a animação de shake ao CSS via JS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-10px); }
    }
`;
document.head.appendChild(style);
