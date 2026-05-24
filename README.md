# RitemastaPro

---

## 🛠️ How to Use

### Step 1: Upload Your Book
- Click **Upload** and drag & drop your DOCX file
- Ritemasta auto-detects chapters, headings, and structure
- Your book is converted into editable chapters

### Step 2: Edit & Refine
- Navigate to the **Editor** section
- TOC appears on the left; click any chapter to edit
- Add or delete chapters as needed
- All changes auto-save to your browser

### Step 3: Configure Settings
- Go to **Settings** to add:
  - Book title, subtitle, author
  - ISBN, publisher, edition
  - Copyright text
  - Front cover, back cover, and publisher logo

### Step 4: Choose Layout
- Select page size: 6x9, 5.5x8.5, 8.5x11, A4, A5, or Custom
- Choose template style: Wellness, Fiction, Academic, Poetry, Self-Help, Children, Cookbook
- Select font family: Serif, Sans, Monospace, Display

### Step 5: Export Your Book
- Navigate to **Export** – this section is locked
- Purchase a license code for **$49.99** (one-time payment)
- Pay via crypto to any of the addresses below
- Email or WhatsApp your transaction hash to receive your code
- Enter the code to unlock all export formats

### Step 6: Save & Backup
- Use **Save** to store your project in browser storage
- Download a DOCX backup for extra safety

---

## 🔑 Admin Panel

Access the admin panel at `/admin.html` to generate license codes.

| Feature | Details |
|---------|---------|
| **Default Password** | `Ritemasta2026` (change in `admin.html` before deployment) |
| **Generate Code** | Click "Generate New Code" to create a unique license key |
| **Copy Code** | Copy the code to send to users |
| **Mark as Sent** | Track which codes have been issued |
| **Mark as Used** | Track which codes have been redeemed |
| **Delete Code** | Remove codes from the system |

**Security Note:** The admin password is stored in plain text in the HTML file. For production, consider moving the admin panel to a private repository or adding a server-side authentication layer.

---

## 💰 Crypto Payment Addresses

Users can pay to any of these addresses to receive a license code:

| Currency | Address |
|----------|---------|
| **ETH / BNB** | `0x161caE357e1C08022A07b79F124fA395F24bE053` |
| **SOL** | `YoxQ94taomLRs7wsDcDYL1NDjBenpcrVNMCmNp1m7yQ` |
| **BTC** | `bc1qr0xfzkelhz3xpf53h57ew5uks5hsqkjwwavuzx` |

### Payment Verification Process:

1. User pays to any of the above addresses
2. User sends transaction hash to:
   - 📧 **Email:** ritemasta@gmail.com
   - 💬 **WhatsApp:** +233 249 845 856
3. You verify the payment on the blockchain
4. You generate a code in the admin panel
5. You send the code back to the user
6. User enters code in the export page to unlock

---

## 📞 Contact & Support

| Method | Details |
|--------|---------|
| **Email** | ritemasta@gmail.com |
| **WhatsApp** | +233 249 845 856 |
| **Complaints Hotline** | +233 249 845 856 / +233 500 119 195 |
| **Contact Form** | Available at `/contact.html` |

**Business Hours:** 24/7 support via WhatsApp and email

---

## 📋 Legal Information

| Detail | Information |
|--------|-------------|
| **Business Registration No** | BN360822013 |
| **TIN** | P0002032406 |
| **Registered under** | Ghana Business Names Act, 1962 (NO. 151) |
| **Complaints Hotline** | +233 249 845 856 / +233 500 119 195 |
| **Email** | ritemasta@gmail.com |

---

## 🎯 Why Ritemasta Pro?

| Feature | Ritemasta Pro | Atticus | Vellum |
|---------|--------------|---------|--------|
| **Price** | $49.99 (one-time) | $147 (one-time) | $249 (one-time) |
| **Export Formats** | PDF, EPUB, MOBI, DOCX, HTML | PDF, EPUB, MOBI | PDF, EPUB, MOBI |
| **Web-Based** | ✅ Any device | ❌ Desktop only | ❌ macOS only |
| **DOCX Import** | ✅ Full auto-format | ✅ Yes | ❌ No |
| **Cover Upload** | ✅ Front + Back + Publisher Logo | ✅ Yes | ✅ Yes |
| **Cloud Save** | ✅ Browser localStorage | ❌ Local files only | ❌ Local files only |
| **Crypto Payment** | ✅ 0% fees | ❌ Credit card only | ❌ Credit card only |
| **Multi-Device** | ✅ Any OS | ❌ Mac/Windows only | ❌ macOS only |
| **Admin Panel** | ✅ Code generation | ❌ No | ❌ No |
| **WhatsApp Support** | ✅ Direct chat | ❌ No | ❌ No |

**Winner:** 🏆 **Ritemasta Pro** – Best value, most features, lowest price.

---

## 🚀 Deployment

This is a static website designed for **GitHub Pages**.

### Deploy to GitHub Pages:

1. **Create a GitHub repository** (e.g., `RitemastaPro`)
2. **Upload all files** to the repository
3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Select branch: `main`
   - Click Save
4. **Access your site** at: `https://yourusername.github.io/RitemastaPro/`

### Custom Domain (Optional):

1. In GitHub Pages settings, enter your custom domain
2. At your domain registrar, add:
   - CNAME record pointing to `yourusername.github.io`
   - 4 A records pointing to GitHub's IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

---

## 🔒 Security Notes

| Concern | Recommendation |
|---------|----------------|
| **Admin password** | Change the default password in `admin.html` before deploying |
| **Crypto addresses** | These are public addresses; no security risk |
| **User data** | All data is stored locally in the user's browser |
| **License codes** | Codes are stored in browser localStorage; consider a backend for production |

---

## 🛠️ Customization

### Changing the Admin Password:

Open `admin.html` and find this line:

```javascript
const ADMIN_PASSWORD = 'Ritemasta2026';
