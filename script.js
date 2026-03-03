document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('downloadBtn');
    const element = document.querySelector('.cv-container');

    button.addEventListener('click', async () => {
        if (typeof html2pdf === 'undefined') {
            alert('PDF library failed to load. Please refresh and try again.');
            return;
        }

        const defaultLabel = button.innerHTML;
        button.disabled = true;
        button.innerHTML = 'Exporting...';

        const options = {
            filename: 'CV-Vi-Thanh-Son.pdf',
            margin: [8, 8, 8, 8],
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: {
                mode: ['css', 'legacy']
            }
        };

        try {
            document.body.classList.add('pdf-export');
            await new Promise((resolve) => requestAnimationFrame(() => resolve()));
            await html2pdf().set(options).from(element).save();
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Cannot export PDF right now. Please try again.');
        } finally {
            document.body.classList.remove('pdf-export');
            button.disabled = false;
            button.innerHTML = defaultLabel;
        }
    });
});
