document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const element = document.querySelector('.cv-container');

        html2pdf()
            .from(element)
            .save('CV-Vi-Thanh-Son.pdf');
    });
});
