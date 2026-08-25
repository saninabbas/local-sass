(function() {
  // Config - dynamically detect API URL from script src
  let WIDGET_URL = 'https://local-sass.pages.dev';
  
  // Extract businessId from script tag
  const scripts = document.getElementsByTagName('script');
  let businessId = null;
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src.includes('widget.js')) {
      const url = new URL(scripts[i].src);
      businessId = url.searchParams.get('id');
      WIDGET_URL = url.origin;
      if (businessId) break;
    }
  }

  if (!businessId) {
    console.error('Scorankio Widget: Missing business ID in script tag.');
    return;
  }

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    #rankora-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 24px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999998;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #rankora-widget-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    #rankora-widget-modal {
      position: fixed;
      bottom: 80px;
      right: 24px;
      width: 320px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    #rankora-widget-modal.open {
      display: flex;
      animation: rankora-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes rankora-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .rankora-header {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      padding: 20px;
      position: relative;
    }
    .rankora-header h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }
    .rankora-header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .rankora-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .rankora-close:hover {
      background: rgba(255,255,255,0.3);
    }
    .rankora-body {
      padding: 20px;
    }
    .rankora-input {
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 14px;
    }
    .rankora-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    .rankora-submit {
      width: 100%;
      padding: 12px;
      background: #111827;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .rankora-submit:hover {
      background: #1f2937;
    }
    .rankora-success {
      display: none;
      padding: 30px 20px;
      text-align: center;
    }
    .rankora-success.show {
      display: block;
    }
    .rankora-success h3 {
      color: #10b981;
      margin: 0 0 8px 0;
    }
    .rankora-success p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  // Create Button
  const btn = document.createElement('button');
  btn.id = 'rankora-widget-btn';
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
    Free SEO Audit
  `;
  document.body.appendChild(btn);

  // Create Modal
  const modal = document.createElement('div');
  modal.id = 'rankora-widget-modal';
  modal.innerHTML = `
    <div class="rankora-header">
      <button class="rankora-close">&times;</button>
      <h3>Get Your SEO Audit</h3>
      <p>Enter your details below and we'll send you a free comprehensive SEO report.</p>
    </div>
    <div class="rankora-body" id="rankora-form-container">
      <form id="rankora-form">
        <input type="text" class="rankora-input" id="rankora-name" placeholder="Your Name" required>
        <input type="email" class="rankora-input" id="rankora-email" placeholder="Email Address" required>
        <input type="text" class="rankora-input" id="rankora-website" placeholder="Website URL (Optional)">
        <button type="submit" class="rankora-submit" id="rankora-submit-btn">Send My Audit</button>
      </form>
    </div>
    <div class="rankora-success" id="rankora-success-msg">
      <h3>Request Sent!</h3>
      <p>We'll be in touch shortly with your free SEO audit.</p>
    </div>
  `;
  document.body.appendChild(modal);

  // Logic
  const closeBtn = modal.querySelector('.rankora-close');
  const form = modal.querySelector('#rankora-form');
  const submitBtn = modal.querySelector('#rankora-submit-btn');
  const formContainer = modal.querySelector('#rankora-form-container');
  const successMsg = modal.querySelector('#rankora-success-msg');

  btn.addEventListener('click', () => {
    modal.classList.toggle('open');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.innerText = 'Sending...';
    submitBtn.disabled = true;

    const name = modal.querySelector('#rankora-name').value;
    const email = modal.querySelector('#rankora-email').value;
    const website = modal.querySelector('#rankora-website').value;

    fetch(WIDGET_URL + '/api/widget/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: businessId,
        name: name,
        email: email,
        websiteUrl: website
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        formContainer.style.display = 'none';
        successMsg.classList.add('show');
        setTimeout(() => {
          modal.classList.remove('open');
        }, 3000);
      } else {
        alert('Failed to send request. Please try again.');
        submitBtn.innerText = 'Send My Audit';
        submitBtn.disabled = false;
      }
    })
    .catch(err => {
      alert('An error occurred. Please try again.');
      submitBtn.innerText = 'Send My Audit';
      submitBtn.disabled = false;
    });
  });

})();
