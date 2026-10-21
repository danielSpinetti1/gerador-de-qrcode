document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qr-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrCodeContainer = document.getElementById('qrcode');
    const qrResultContainer = document.getElementById('qr-result-container');
    const downloadBtn = document.getElementById('download-btn');
    const qrHint = document.getElementById('qr-hint');
    
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
            if (qrHint) qrHint.style.display = 'block';
            
            // Restaurar botão
            generateBtn.innerText = originalText;
            generateBtn.style.opacity = '1';
        }, 300); // Pequeno delay para efeito visual
    }

    downloadBtn.addEventListener('click', async () => {
        try {
            const blob = await getQrBlob();
            if (!blob) {
                alert('Não foi possível obter a imagem do QR Code.');
                return;
            }

            const fileName = 'qrcode.png';
            const file = new File([blob], fileName, { type: 'image/png' });

            // 1. Tentar Web Share API (Ideal para celular iOS/Android)
            // Permite salvar direto na galeria de fotos ou compartilhar em apps
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'QR Code',
                        text: 'QR Code gerado'
                    });
                    return;
                } catch (shareErr) {
                    if (shareErr.name === 'AbortError') {
                        return; // Usuário cancelou a folha de compartilhamento
                    }
                    console.warn('Web Share falhou, tentando download direto:', shareErr);
                }
            }

            // 2. Download via Blob URL (PC/Notebook e navegadores mobile com suporte)
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 1000);
        } catch (error) {
            console.error('Erro ao baixar QR Code:', error);
            // Fallback de emergência: abrir a imagem em uma nova aba
            const img = qrCodeContainer.querySelector('img');
            const canvas = qrCodeContainer.querySelector('canvas');
            const fallbackSrc = (img && img.src) || (canvas && canvas.toDataURL('image/png'));
            if (fallbackSrc) {
                window.open(fallbackSrc, '_blank');
            }
        }
    });

    async function getQrBlob() {
        // Tentar pegar do <img> se já tiver data URL
        const img = qrCodeContainer.querySelector('img');
        if (img && img.src && img.src.startsWith('data:')) {
            return dataURLtoBlob(img.src);
        }

        // Tentar pegar do <canvas>
        const canvas = qrCodeContainer.querySelector('canvas');
        if (canvas && canvas.toDataURL) {
            try {
                return dataURLtoBlob(canvas.toDataURL('image/png'));
            } catch (e) {
                console.warn('Erro ao obter imagem do canvas:', e);
            }
        }

        // Se img.src for URL externa ou Blob
        if (img && img.src) {
            try {
                const response = await fetch(img.src);
                return await response.blob();
            } catch (e) {
                console.warn('Erro ao buscar src da imagem:', e);
            }
        }

        return null;
    }

    function dataURLtoBlob(dataUrl) {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
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
